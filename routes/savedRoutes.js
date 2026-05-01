const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const SavedJob = require("../models/SavedJob");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can view saved jobs" });
    }

    const saved = await SavedJob.find({ userId: req.user.id })
      .populate("jobId")
      .sort({ createdAt: -1 });
    return res.json(saved.filter((item) => item.jobId));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can save jobs" });
    }

    const saved = await SavedJob.create({
      userId: req.user.id,
      jobId: req.body.jobId,
    });

    return res.json(saved);
  } catch (err) {
    console.error(err);
    return res.status(err.code === 11000 ? 400 : 500).json({
      message: err.code === 11000 ? "Already saved" : "Server error",
    });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can remove saved jobs" });
    }

    const saved = await SavedJob.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!saved) {
      return res.status(404).json({ message: "Saved job not found" });
    }

    await saved.deleteOne();
    return res.json({ message: "Job removed from saved list" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
