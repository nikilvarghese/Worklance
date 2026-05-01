const mongoose = require("mongoose");

const statusEnum = ["Pending", "Screening", "Interview", "Approved", "Rejected", "Hired"];

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    jobVersion: {
      type: Number,
      default: 1,
    },
    jobSnapshot: {
      title: String,
      description: String,
      company: String,
      location: String,
      salary: Number,
      salaryMin: Number,
      salaryMax: Number,
    },
    coverLetter: { type: String, default: "", trim: true },
    expectedSalary: { type: Number, default: 0 },
    availability: { type: String, default: "Immediately", trim: true },
    status: {
      type: String,
      enum: statusEnum,
      default: "Pending",
    },
    statusHistory: [
      {
        status: { type: String, enum: statusEnum },
        note: String,
        changedAt: { type: Date, default: Date.now },
      },
    ],
    interviewDate: String,
    interviewTime: String,
    contactInfo: String,
    description: String,
  },
  { timestamps: true }
);

applicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });
applicationSchema.index({ jobId: 1, status: 1 });

module.exports = mongoose.model("Application", applicationSchema);
