const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const {
  registerUser,
  registerHR,
  loginUser,
  loginHR,
  requestRegisterOtp,
  verifyRegisterOtp,
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  googleRedirect,
  googleCallback,
  setPassword,
  deleteUser,
  validatePassword,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const Hr = require("../models/Hr");

const router = express.Router();
router.get("/google", googleRedirect);
router.get("/google/callback", googleCallback);

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, DOCX, PNG, and JPG files are allowed"));
    }
  },
});

const stripPassword = (doc, role) => {
  const data = doc.toObject ? doc.toObject() : doc;
  delete data.password;
  return { ...data, role };
};

const listFromValue = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

router.post("/user/register", registerUser);
router.post("/hr/register", registerHR);
router.post("/user/login", loginUser);
router.post("/hr/login", loginHR);

router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/otp/request-register", requestRegisterOtp);
router.post("/otp/verify-register", verifyRegisterOtp);
router.post("/otp/request-reset", requestPasswordResetOtp);
router.post("/otp/verify-reset", verifyPasswordResetOtp);

router.post("/set-password", authMiddleware, setPassword);


router.get("/profile", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can access user profile" });
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const Model = req.user.role === "hr" ? Hr : User;
    const account = await Model.findById(req.user.id).select("-password");
    if (!account) {
      return res.status(404).json({ message: "Profile not found" });
    }
    return res.json(stripPassword(account, req.user.role));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/me", authMiddleware, async (req, res) => {
  try {
    const isHr = req.user.role === "hr";
    const Model = isHr ? Hr : User;
    const allowed = isHr
      ? ["name", "company", "designation", "phone", "website", "location", "industry", "teamSize", "about"]
      : ["name", "headline", "phone", "portfolio", "experienceLevel", "desiredSalary"];

    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    });

    const account = await Model.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!account) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.json(stripPassword(account, req.user.role));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/profile", authMiddleware, upload.single("resume"), async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can update this profile" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updates = { ...req.body };

    if (updates.dob) {
      const dob = new Date(updates.dob);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDelta = today.getMonth() - dob.getMonth();
      if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < dob.getDate())) {
        age -= 1;
      }
      if (age < 18 || age > 65) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "Age must be between 18 and 65" });
      }
      updates.age = age;
    }

    if (updates.pincode && !/^\d{6}$/.test(updates.pincode)) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Pincode must be a 6-digit number" });
    }

    ["skills", "languages", "preferredRoles"].forEach((field) => {
      if (updates[field] !== undefined) {
        updates[field] = listFromValue(updates[field]);
      }
    });

    if (updates.specialization && Array.isArray(updates.specialization)) {
      updates.specialization = updates.specialization.join(", ");
    }

    if (updates.education) {
      const validEducation = ["10th", "12th", "Diploma", "Bachelor", "Master", "PhD"];
      if (!validEducation.includes(updates.education)) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "Invalid education option" });
      }
      if (["Diploma", "Bachelor", "Master", "PhD"].includes(updates.education) && !updates.specialization) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: `Specialization required for ${updates.education}` });
      }
    }

    if (updates.desiredSalary !== undefined) {
      updates.desiredSalary = Number(updates.desiredSalary) || 0;
    }

    if (req.file) {
      if (user.resume) {
        try {
          const oldPath = path.join(uploadDir, path.basename(user.resume));
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        } catch (e) {
          console.error("Failed to delete old resume", e);
        }
      }
      updates.resume = req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    return res.json(updatedUser);
  } catch (err) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error("Failed to clean up uploaded file on error", e);
      }
    }
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.delete("/delete", authMiddleware, deleteUser);

router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!newPassword || !validatePassword(newPassword)) {
      return res.status(400).json({ message: "Password must be at least 8 characters and include uppercase, lowercase, and a number." });
    }
    const isHr = req.user.role === "hr";
    const Model = isHr ? Hr : User;

    const account = await Model.findById(req.user.id);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (!account.password) {
      return res.status(400).json({ message: "Cannot change password for OAuth accounts directly" });
    }

    const isMatch = await bcrypt.compare(oldPassword, account.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    const salt = await bcrypt.genSalt(10);
    account.password = await bcrypt.hash(newPassword, salt);
    await account.save();

    return res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }

});

module.exports = router;
