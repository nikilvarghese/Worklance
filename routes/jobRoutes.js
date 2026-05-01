const express = require("express");
const Job = require("../models/Job");
const Application = require("../models/Application");
const { getJobs, normalizeJobPayload } = require("../controllers/jobController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "hr") {
      return res.status(403).json({ message: "Only HR can post jobs" });
    }

    const job = await Job.create({
      ...normalizeJobPayload(req.body),
      postedBy: req.user.id,
      hrId: req.user.id,
    });

    return res.json(job);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

router.get("/my-jobs", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "hr") {
      return res.status(403).json({ message: "Only HR can view their jobs" });
    }

    const jobs = await Job.find({ hrId: req.user.id, isActive: true }).sort({ createdAt: -1 });
    return res.json(jobs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("postedBy", "name email company");
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.json(job);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "hr") {
      return res.status(403).json({ message: "Only HR can update jobs" });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only update your own jobs" });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      {
        ...normalizeJobPayload(req.body),
        version: job.version + 1,
      },
      { new: true, runValidators: true }
    );

    return res.json(updatedJob);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

router.patch("/:id/archive", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "hr") {
      return res.status(403).json({ message: "Only HR can archive jobs" });
    }

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, hrId: req.user.id },
      { isActive: false },
      { returnDocument: "after" }
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.json(job);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "hr") {
      return res.status(403).json({ message: "Only HR can delete jobs" });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own jobs" });
    }

    const applications = await Application.countDocuments({ jobId: req.params.id });
    if (applications > 0) {
      const archived = await Job.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
      return res.json({
        message: "Job has applications, so it was archived instead of deleted.",
        job: archived,
      });
    }

    await Job.findByIdAndDelete(req.params.id);
    return res.json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/", getJobs);

module.exports = router;
