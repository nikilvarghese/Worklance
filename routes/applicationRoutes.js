const express = require("express");
const Application = require("../models/Application");
const Job = require("../models/Job");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const allowedStatuses = ["Pending", "Screening", "Interview", "Approved", "Rejected", "Hired"];

router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can apply to jobs" });
    }

    const { jobId, coverLetter = "", expectedSalary = 0, availability = "Immediately" } = req.body;
    const existing = await Application.findOne({ userId: req.user.id, jobId });

    if (existing) {
      return res.status(400).json({ message: "Already applied" });
    }

    const job = await Job.findById(jobId);
    if (!job || !job.isActive) {
      return res.status(404).json({ message: "Job not found" });
    }

    const app = await Application.create({
      userId: req.user.id,
      jobId,
      jobVersion: job.version,
      coverLetter,
      expectedSalary: Number(expectedSalary) || 0,
      availability,
      jobSnapshot: {
        title: job.title,
        description: job.description,
        company: job.company,
        location: job.location,
        salary: job.salary,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
      },
      statusHistory: [{ status: "Pending", note: "Application submitted" }],
    });

    return res.json(app);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.code === 11000 ? "Already applied" : "Server error" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role === "hr") {
      const hrJobIds = await Job.find({ hrId: req.user.id }).distinct("_id");
      const apps = await Application.find({ jobId: { $in: hrJobIds } })
        .populate("userId", "name email headline city state resume skills preferredRoles experienceLevel")
        .populate("jobId", "title company location salary salaryMin salaryMax category")
        .sort({ createdAt: -1 });
      return res.json(apps);
    }

    const apps = await Application.find({ userId: req.user.id })
      .populate("jobId", "title company location salary salaryMin salaryMax category workMode jobType")
      .sort({ createdAt: -1 });

    return res.json(apps);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/job/:jobId/applicants", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "hr") {
      return res.status(403).json({ message: "Only HR can view applicants" });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.hrId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only view applicants for your jobs" });
    }

    const apps = await Application.find({ jobId: req.params.jobId })
      .populate("userId", "name email headline city state resume skills preferredRoles experienceLevel")
      .populate("jobId", "title company location salary salaryMin salaryMax category")
      .sort({ createdAt: -1 });

    return res.json(apps);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "hr") {
      return res.status(403).json({ message: "Only HR can view applicant details" });
    }

    const application = await Application.findById(req.params.id)
      .populate(
        "userId",
        "name email headline phone dob age state city pincode portfolio resume skills languages preferredRoles education specialization experienceLevel desiredSalary"
      )
      .populate("jobId", "title company location salary salaryMin salaryMax jobType experience education skills workMode category");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const job = await Job.findById(application.jobId);
    if (!job || job.hrId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only view applicants for your jobs" });
    }

    return res.json(application);
  } catch (err) {
    console.error("Error fetching applicant details:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "hr") {
      return res.status(403).json({ message: "Only HR can update application status" });
    }

    const { status, interviewDate, interviewTime, contactInfo, description } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const job = await Job.findById(application.jobId);
    if (!job || job.hrId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only update applications for your jobs" });
    }

    application.status = status;
    application.interviewDate = interviewDate || application.interviewDate;
    application.interviewTime = interviewTime || application.interviewTime;
    application.contactInfo = contactInfo || application.contactInfo;
    application.description = description || application.description;
    application.statusHistory.push({
      status,
      note: description || `Moved to ${status}`,
      changedAt: new Date(),
    });

    const updated = await application.save();
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can withdraw applications" });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only withdraw your own application" });
    }

    await application.deleteOne();
    return res.json({ message: "Application withdrawn successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
