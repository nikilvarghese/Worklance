const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const User = require("../models/User");
const Hr = require("../models/Hr");
const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("../utils/email");
const { getGoogleAuthUrl, getGoogleUser } = require("../utils/google");

const createToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "jobportal-dev-secret", {
    expiresIn: "1d",
  });
};

const sanitize = (doc) => {
  const obj = doc.toObject();
  delete obj.password;
  return obj;
};

const alreadyRegisteredMessage = "Already registered, please login";

const validateEmail = (email) => {
  return /^\S+@\S+\.\S+$/.test(email);
};

const validatePassword = (password) => {
  return (
    typeof password === "string" &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    password.length >= 8
  );
};

const normalizeName = ({ firstName, lastName, name }) => {
  if (firstName && lastName) {
    return `${firstName.trim()} ${lastName.trim()}`;
  }
  if (name) {
    return name.trim();
  }
  return `${firstName || ""} ${lastName || ""}`.trim();
};

const validateRegistration = (data) => {
  const { firstName, lastName, name, email, password } = data;
  if ((!firstName || !lastName) && !name) {
    return "First name and last name are required.";
  }
  if (!email || !password) {
    return "Email and password are required.";
  }
  if (!validateEmail(email)) {
    return "Please enter a valid email address.";
  }
  if (!validatePassword(password)) {
    return "Password must be at least 8 characters and include uppercase, lowercase, and a number.";
  }
  return null;
};

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const clearActiveOtps = async (email, type, role) => {
  await Otp.deleteMany({ email, type, role });
};

const buildOtpResponse = (otpDoc) => {
  const now = Date.now();
  const resendIn = Math.max(0, Math.ceil((otpDoc.resendAvailableAt.getTime() - now) / 1000));
  return {
    resendCooldown: resendIn,
    expiresAt: otpDoc.expiresAt,
  };
};

const createOtpRecord = async ({ email, type, role, payload }) => {
  await clearActiveOtps(email, type, role);
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const otpDoc = await Otp.create({
    email,
    type,
    role,
    otpHash,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    resendAvailableAt: new Date(Date.now() + 2 * 60 * 1000),
    payload,
  });
  return { otp, otpDoc };
};

const sendOTP = async ({ email, otp, purpose }) => {
  await sendOTPEmail(email, otp);
};

const verifyOtpCode = async (otpDoc, otp) => {
  if (!otpDoc) {
    const error = new Error("OTP not found or already used");
    error.code = "OTP_INVALID";
    throw error;
  }
  if (otpDoc.expiresAt < new Date()) {
    await clearActiveOtps(otpDoc.email, otpDoc.type, otpDoc.role);
    const error = new Error("OTP expired");
    error.code = "OTP_EXPIRED";
    throw error;
  }
  if (otpDoc.attempts >= 5) {
    await clearActiveOtps(otpDoc.email, otpDoc.type, otpDoc.role);
    const error = new Error("Too many invalid OTP attempts");
    error.code = "OTP_BLOCKED";
    throw error;
  }

  const isValid = await bcrypt.compare(otp, otpDoc.otpHash);
  if (!isValid) {
    otpDoc.attempts += 1;
    await otpDoc.save();
    const error = new Error("Invalid OTP code");
    error.code = "OTP_INVALID";
    throw error;
  }

  await Otp.deleteOne({ _id: otpDoc._id });
  return otpDoc;
};

const getUserByEmail = async (email) => {
  const normalized = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalized });
  if (user) return { account: user, role: "user" };
  const hr = await Hr.findOne({ email: normalized });
  if (hr) return { account: hr, role: "hr" };
  return { account: null, role: null };
};

// ================= REGISTER USER =================
exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, name, email, password } = req.body;
    const validationError = validateRegistration({ firstName, lastName, name, email, password });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    const existingHr = await Hr.findOne({ email: normalizedEmail });

    if (existingUser || existingHr) {
      return res.status(400).json({ message: alreadyRegisteredMessage });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const fullName = normalizeName({ firstName, lastName, name });

    const user = await User.create({
      name: fullName,
      firstName: firstName?.trim() || undefined,
      lastName: lastName?.trim() || undefined,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = createToken(user._id, "user");

    res.json({
      token,
      user: {
        ...sanitize(user),
        role: "user",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= REGISTER HR =================
exports.registerHR = async (req, res) => {
  try {
    const { firstName, lastName, name, email, password, company = "", designation = "Talent Partner" } = req.body;
    const validationError = validateRegistration({ firstName, lastName, name, email, password });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    const existingHr = await Hr.findOne({ email: normalizedEmail });

    if (existingUser || existingHr) {
      return res.status(400).json({ message: alreadyRegisteredMessage });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const fullName = normalizeName({ firstName, lastName, name });

    const hr = await Hr.create({
      name: fullName,
      firstName: firstName?.trim() || undefined,
      lastName: lastName?.trim() || undefined,
      email: normalizedEmail,
      password: hashedPassword,
      company: company.trim(),
      designation: designation.trim(),
    });

    const token = createToken(hr._id, "hr");

    res.json({
      success: true,
      token,
      user: {
        ...sanitize(hr),
        role: "hr",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const requestRegisterOtp = async (req, res) => {
  try {
    const { firstName, lastName, name, email, password, role = "user", company = "", designation = "Talent Partner" } = req.body;
    const validationError = validateRegistration({ firstName, lastName, name, email, password });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    const existingHr = await Hr.findOne({ email: normalizedEmail });
    if (existingUser || existingHr) {
      return res.status(400).json({ message: alreadyRegisteredMessage });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const payload = {
      firstName: firstName?.trim() || undefined,
      lastName: lastName?.trim() || undefined,
      name: normalizeName({ firstName, lastName, name }),
      email: normalizedEmail,
      passwordHash,
      company: company.trim(),
      designation: designation.trim(),
    };

    const { otp, otpDoc } = await createOtpRecord({
      email: normalizedEmail,
      type: "register",
      role,
      payload,
    });

    await sendOTP({ email: normalizedEmail, otp, purpose: "registration" });
    res.json({ success: true, message: "OTP sent to email", ...buildOtpResponse(otpDoc) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp, role = "user" } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otpDoc = await Otp.findOne({ email: normalizedEmail, type: "register", role, active: true }).sort({ createdAt: -1 });
    if (!otpDoc) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }

    try {
      await verifyOtpCode(otpDoc, otp);
    } catch (error) {
      if (error.code === "OTP_EXPIRED") {
        return res.status(400).json({ message: "OTP has expired" });
      }
      if (error.code === "OTP_INVALID") {
        return res.status(400).json({ message: "Invalid OTP code" });
      }
      if (error.code === "OTP_BLOCKED") {
        return res.status(400).json({ message: "Too many invalid OTP attempts" });
      }
      throw error;
    }

    const payload = otpDoc.payload || {};
    const normalizedEmailFromPayload = payload.email || normalizedEmail;
    const existingUser = await User.findOne({ email: normalizedEmailFromPayload });
    const existingHr = await Hr.findOne({ email: normalizedEmailFromPayload });
    if (existingUser || existingHr) {
      return res.status(400).json({ message: alreadyRegisteredMessage });
    }

    if (role === "hr") {
      const hr = await Hr.create({
        name: payload.name,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: normalizedEmailFromPayload,
        password: payload.passwordHash,
        company: payload.company,
        designation: payload.designation,
      });
      const token = createToken(hr._id, "hr");
      return res.json({ success: true, token, user: { ...sanitize(hr), role: "hr" } });
    }

    const user = await User.create({
      name: payload.name,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: normalizedEmailFromPayload,
      password: payload.passwordHash,
    });
    const token = createToken(user._id, "user");
    return res.json({ success: true, token, user: { ...sanitize(user), role: "user" } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const requestPasswordResetOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ message: "A valid email address is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const { account, role } = await getUserByEmail(normalizedEmail);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const { otp, otpDoc } = await createOtpRecord({
      email: normalizedEmail,
      type: "reset",
      role,
      payload: { accountId: account._id.toString() },
    });

    await sendOTP({ email: normalizedEmail, otp, purpose: "password reset" });
    return res.json({ message: "OTP sent to email", ...buildOtpResponse(otpDoc) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyPasswordResetOtp = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res.status(400).json({ message: "Email, OTP and new password are required" });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ message: "Password must be at least 8 characters and include uppercase, lowercase, and a number." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otpDoc = await Otp.findOne({ email: normalizedEmail, type: "reset", active: true }).sort({ createdAt: -1 });
    if (!otpDoc) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }

    try {
      await verifyOtpCode(otpDoc, otp);
    } catch (error) {
      if (error.code === "OTP_EXPIRED") {
        return res.status(400).json({ message: "OTP has expired" });
      }
      if (error.code === "OTP_INVALID") {
        return res.status(400).json({ message: "Invalid OTP code" });
      }
      if (error.code === "OTP_BLOCKED") {
        return res.status(400).json({ message: "Too many invalid OTP attempts" });
      }
      throw error;
    }

    const account = await User.findOne({ email: normalizedEmail }) || await Hr.findOne({ email: normalizedEmail });
    if (!account) {
      return res.status(400).json({ message: "Account not found" });
    }

    account.password = await bcrypt.hash(password, 10);
    await account.save();
    return res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const googleRedirect = async (req, res) => {
  try {
    const role = req.query.role === "hr" ? "hr" : "user";
    const action = req.query.action === "register" ? "register" : "login";
    const authUrl = getGoogleAuthUrl(role, action);
    return res.redirect(authUrl);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Google authentication failed" });
  }
};

const googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    let rawState = {};
    if (state) {
      try {
        rawState = JSON.parse(state);
      } catch (innerErr) {
        rawState = {};
      }
    }
    const role = rawState.role === "hr" ? "hr" : "user";
    const action = rawState.action === "register" ? "register" : "login";

    if (!code) {
      return res.redirect("/login");
    }

    const profile = await getGoogleUser(code);
    const normalizedEmail = profile.email.toLowerCase().trim();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const loginUrl = role === "hr" ? `${clientUrl}/hr-login` : `${clientUrl}/login`;
    const registerUrl = `${clientUrl}/register`;

    if (role === "hr") {
      const existingHr = await Hr.findOne({ email: normalizedEmail });
      const existingUser = await User.findOne({ email: normalizedEmail });

      if (action === "login") {
        if (!existingHr) {
          return res.redirect(`${loginUrl}?error=NO_ACCOUNT`);
        }
        const token = createToken(existingHr._id, "hr");
        return res.send(generateAuthRedirectScript(token, "hr", !existingHr.passwordSet));
      }

      if (action === "register") {
        if (existingHr) {
          return res.redirect(`${registerUrl}?error=ACCOUNT_EXISTS`);
        }
        if (existingUser) {
          return res.send(generateErrorRedirectScript("This email is already registered as a job seeker. Please sign in with that account."));
        }
        const token = jwt.sign(
          {
            email: normalizedEmail,
            firstName: profile.firstName || "",
            lastName: profile.lastName || "",
            role: "hr",
            isTempRegister: true,
          },
          process.env.JWT_SECRET || "jobportal-dev-secret",
          { expiresIn: "1h" }
        );
        return res.send(generateAuthRedirectScript(token, "hr", true));
      }
    } else {
      const existingUser = await User.findOne({ email: normalizedEmail });
      const existingHr = await Hr.findOne({ email: normalizedEmail });

      if (action === "login") {
        if (!existingUser) {
          return res.redirect(`${loginUrl}?error=NO_ACCOUNT`);
        }
        const token = createToken(existingUser._id, "user");
        return res.send(generateAuthRedirectScript(token, "user", !existingUser.passwordSet));
      }

      if (action === "register") {
        if (existingUser) {
          return res.redirect(`${registerUrl}?error=ACCOUNT_EXISTS`);
        }
        if (existingHr) {
          return res.send(generateErrorRedirectScript("This email is already registered as an employer. Please sign in with that account."));
        }
        const token = jwt.sign(
          {
            email: normalizedEmail,
            firstName: profile.firstName || "",
            lastName: profile.lastName || "",
            role: "user",
            isTempRegister: true,
          },
          process.env.JWT_SECRET || "jobportal-dev-secret",
          { expiresIn: "1h" }
        );
        return res.send(generateAuthRedirectScript(token, "user", true));
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Google callback error" });
  }
};

const generateAuthRedirectScript = (token, role, needsPassword = false) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
  const redirect = needsPassword ? "/set-password" : (role === "hr" ? "/hr-dashboard" : "/dashboard");

  return `<!DOCTYPE html>
  <html>
    <body>
      <script>
        window.location.href='${clientUrl}${redirect}?token=${token}&role=${role}';
      </script>
    </body>
  </html>`;
};

const generateErrorRedirectScript = (message) => {
  const safeMessage = JSON.stringify(message);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Authentication error</title></head><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#f8fafc;margin:0;">
      <div style="max-width:420px;padding:32px;border-radius:20px;background:#fff;box-shadow:0 20px 60px rgba(15,23,42,0.08);text-align:center;">
        <h1 style="font-size:1.25rem;color:#111;margin-bottom:16px;">Sign in issue</h1>
        <p style="color:#475569;margin-bottom:24px;">${safeMessage.replace(/^"|"$/g, "")}</p>
        <a href="https://worklance-nu.vercel.app/login" style="display:inline-flex;align-items:center;justify-content:center;padding:12px 20px;border-radius:999px;background:#0f172a;color:#fff;text-decoration:none;font-weight:600;">Go back to login</a>
      </div>
    </body></html>`;
};

// ================= LOGIN USER =================
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    const hr = await Hr.findOne({ email: normalizedEmail });

    if (!user && !hr) {
      return res.status(400).json({ message: "No account found. Please register first." });
    }

    const account = user || hr;

    if (account.passwordSet === false) {
      return res.status(400).json({ message: "Please login using Google or set a password first." });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    if (!user) {
      return res.status(400).json({ message: "This email is registered as an employer. Please sign in as employer." });
    }

    const token = createToken(user._id, "user");

    res.json({
      token,
      user: {
        ...sanitize(user),
        role: "user",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= LOGIN HR =================
exports.loginHR = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    const hr = await Hr.findOne({ email: normalizedEmail });

    if (!user && !hr) {
      return res.status(400).json({ message: "No account found. Please register first." });
    }

    const account = hr || user;

    if (account.passwordSet === false) {
      return res.status(400).json({ message: "Please login using Google or set a password first." });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    if (!hr) {
      return res.status(400).json({ message: "This email is registered as a job seeker. Please sign in as job seeker." });
    }

    const token = createToken(hr._id, "hr");

    res.json({
      token,
      user: {
        ...sanitize(hr),
        role: "hr",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// ================= DELETE ACCOUNT =================
exports.deleteUser = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required to delete your account" });
    }

    const isHr = req.user.role === "hr";
    const Model = isHr ? Hr : User;

    const account = await Model.findById(req.user.id);

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // 🔐 Verify password
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password. Account deletion failed." });
    }

    const Job = require("../models/Job");
    const Application = require("../models/Application");
    const SavedJob = require("../models/SavedJob");

    // ============================
    // 🔥 CASCADE DELETE LOGIC
    // ============================

    if (isHr) {
      // 🧑‍💼 Delete HR jobs + related data
      const hrJobs = await Job.find({ hrId: req.user.id });
      const jobIds = hrJobs.map(job => job._id);

      await Job.deleteMany({ hrId: req.user.id });

      await Application.deleteMany({
        jobId: { $in: jobIds }
      });

      await SavedJob.deleteMany({
        jobId: { $in: jobIds }
      });

    } else {
      // 👤 Delete user applications + saved jobs
      await Application.deleteMany({ userId: req.user.id });
      await SavedJob.deleteMany({ userId: req.user.id });

      // 🧨 Delete resume files
      try {
        const uploadDir = path.join(__dirname, "..", "uploads");
        if (fs.existsSync(uploadDir)) {
          const files = fs.readdirSync(uploadDir);
          for (const file of files) {
            if (file.startsWith(`${req.user.id}-`)) {
              fs.unlinkSync(path.join(uploadDir, file));
            }
          }
        }
      } catch (fileErr) {
        console.error("File cleanup error:", fileErr);
      }
    }

    // 🗑 Finally delete account
    await Model.findByIdAndDelete(req.user.id);

    res.json({ message: "Account and all related data deleted successfully" });

  } catch (err) {
    console.error("Error in deleteUser:", err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.setPassword = async (req, res) => {
  try {
    const { password, firstName, lastName, company } = req.body;
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ message: "Password must be at least 8 characters and include uppercase, lowercase, and a number." });
    }

    if (req.user && req.user.isTempRegister) {
      const role = req.user.role || "user";
      const normalizedEmail = req.user.email.toLowerCase().trim();

      const existingUser = await User.findOne({ email: normalizedEmail });
      const existingHr = await Hr.findOne({ email: normalizedEmail });
      if (existingUser || existingHr) {
        return res.status(400).json({ message: "Account already exists" });
      }

      const finalFirstName = (firstName !== undefined ? firstName : req.user.firstName || "").trim();
      const finalLastName = (lastName !== undefined ? lastName : req.user.lastName || "").trim();
      const fullName = normalizeName({ firstName: finalFirstName, lastName: finalLastName });

      if (!finalFirstName || !finalLastName) {
        return res.status(400).json({ message: "First name and last name are required." });
      }

      let createdAccount;
      if (role === "hr") {
        const finalCompany = (company || "").trim();
        if (!finalCompany) {
          return res.status(400).json({ message: "Company name is required." });
        }
        createdAccount = await Hr.create({
          name: fullName,
          firstName: finalFirstName,
          lastName: finalLastName,
          email: normalizedEmail,
          password: await bcrypt.hash(password, 10),
          company: finalCompany,
          passwordSet: true,
        });
      } else {
        createdAccount = await User.create({
          name: fullName,
          firstName: finalFirstName,
          lastName: finalLastName,
          email: normalizedEmail,
          password: await bcrypt.hash(password, 10),
          passwordSet: true,
        });
      }

      const token = createToken(createdAccount._id, role);
      return res.json({
        message: "Account created and password set successfully",
        token,
        role,
      });
    } else {
      const Model = req.user.role === "hr" ? Hr : User;
      const account = await Model.findById(req.user.id);

      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }

      if (firstName !== undefined && lastName !== undefined) {
        const finalFirstName = firstName.trim();
        const finalLastName = lastName.trim();
        if (finalFirstName && finalLastName) {
          account.firstName = finalFirstName;
          account.lastName = finalLastName;
          account.name = normalizeName({ firstName: finalFirstName, lastName: finalLastName });
        }
      }
      if (req.user.role === "hr" && company !== undefined) {
        const finalCompany = company.trim();
        if (finalCompany) {
          account.company = finalCompany;
        }
      }

      account.password = await bcrypt.hash(password, 10);
      account.passwordSet = true;
      await account.save();

      const token = createToken(account._id, req.user.role);
      res.json({ message: "Password set successfully", token, role: req.user.role });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.requestRegisterOtp = requestRegisterOtp;
exports.verifyRegisterOtp = verifyRegisterOtp;
exports.requestPasswordResetOtp = requestPasswordResetOtp;
exports.verifyPasswordResetOtp = verifyPasswordResetOtp;
exports.googleRedirect = googleRedirect;
exports.googleCallback = googleCallback;
exports.validatePassword = validatePassword;

// Compatibility with existing routes
exports.register = exports.registerUser;
exports.login = exports.loginUser;
