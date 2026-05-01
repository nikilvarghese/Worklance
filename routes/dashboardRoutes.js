const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Job = require("../models/Job");
const Application = require("../models/Application");
const SavedJob = require("../models/SavedJob");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role === "user") {
      const [
        totalJobs,
        appliedCount,
        savedCount,
        interviewCount,
        latestApplications,
        recommendedJobs,
      ] = await Promise.all([
        Job.countDocuments({ isActive: true }),
        Application.countDocuments({ userId: req.user.id }),
        SavedJob.countDocuments({ userId: req.user.id }),
        Application.countDocuments({ userId: req.user.id, status: { $in: ["Interview", "Approved", "Hired"] } }),
        Application.find({ userId: req.user.id })
          .populate("jobId", "title company location salary salaryMin salaryMax")
          .sort({ updatedAt: -1 })
          .limit(5),
        Job.find({ isActive: true })
          .sort({ featured: -1, urgentHiring: -1, createdAt: -1 })
          .limit(6),
      ]);

      return res.json({
        totalJobs,
        appliedCount,
        savedCount,
        interviewCount,
        latestApplications,
        recommendedJobs,
      });
    }

    if (req.user.role === "hr") {
      const hrJobIds = await Job.find({ hrId: req.user.id }).distinct("_id");
      const [totalJobs, applicants, hires, interviews, recentApplicants, jobs] = await Promise.all([
        Job.countDocuments({ hrId: req.user.id, isActive: true }),
        Application.countDocuments({ jobId: { $in: hrJobIds } }),
        Application.countDocuments({ jobId: { $in: hrJobIds }, status: { $in: ["Approved", "Hired"] } }),
        Application.countDocuments({ jobId: { $in: hrJobIds }, status: "Interview" }),
        Application.find({ jobId: { $in: hrJobIds } })
          .populate("userId", "name email headline")
          .populate("jobId", "title company")
          .sort({ createdAt: -1 })
          .limit(8),
        Job.find({ hrId: req.user.id, isActive: true }).sort({ createdAt: -1 }).limit(6),
      ]);

      return res.json({
        totalJobs,
        applicants,
        hires,
        interviews,
        recentApplicants,
        jobs,
      });
    }

    return res.status(403).json({ message: "Invalid role" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
