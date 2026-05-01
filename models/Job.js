const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    salary: { type: Number, default: 0 },
    salaryMin: { type: Number, default: 0 },
    salaryMax: { type: Number, default: 0 },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship"],
      default: "Full-time",
    },
    experience: {
      type: String,
      enum: ["0-1 years", "1-3 years", "3-5 years", "5+ years"],
      default: "0-1 years",
    },
    education: {
      type: String,
      enum: ["High School", "Bachelor's", "Master's", "PhD"],
      default: "Bachelor's",
    },
    skills: [{ type: String, trim: true }],
    openings: { type: Number, default: 1, min: 1 },
    workMode: {
      type: String,
      enum: ["Office", "Remote", "Hybrid"],
      default: "Office",
    },
    shift: {
      type: String,
      enum: ["Day", "Night", "Flexible"],
      default: "Day",
    },
    benefits: [{ type: String, trim: true }],
    department: { type: String, default: "", trim: true },
    category: { type: String, default: "General", trim: true },
    urgentHiring: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    closingDate: { type: String, default: "" },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hr",
    },
    hrId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hr",
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    originalJobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

jobSchema.index({ title: "text", company: "text", description: "text", skills: "text" });
jobSchema.index({ location: 1, category: 1, workMode: 1, jobType: 1 });
jobSchema.index({ hrId: 1, isActive: 1 });

module.exports = mongoose.model("Job", jobSchema);
