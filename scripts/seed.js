const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");
const Hr = require("../models/Hr");
const Job = require("../models/Job");
const Application = require("../models/Application");
const SavedJob = require("../models/SavedJob");

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/jobportal";

const seed = async () => {
  await mongoose.connect(mongoUri);

  const demoUserIds = await User.find({ email: /@demo\.com$/ }).distinct("_id");
  const demoHrIds = await Hr.find({ email: /@demo\.com$/ }).distinct("_id");
  const demoJobIds = await Job.find({
    $or: [{ hrId: { $in: demoHrIds } }, { company: "NimbusWorks" }],
  }).distinct("_id");

  await Promise.all([
    Application.deleteMany({ $or: [{ userId: { $in: demoUserIds } }, { jobId: { $in: demoJobIds } }] }),
    SavedJob.deleteMany({ $or: [{ userId: { $in: demoUserIds } }, { jobId: { $in: demoJobIds } }] }),
    Job.deleteMany({ _id: { $in: demoJobIds } }),
    User.deleteMany({ email: /@demo\.com$/ }),
    Hr.deleteMany({ email: /@demo\.com$/ }),
  ]);

  const password = await bcrypt.hash("password123", 10);

  const user = await User.create({
    name: "Aarav Mehta",
    email: "user@demo.com",
    password,
    headline: "Frontend engineer focused on accessible SaaS products",
    phone: "+91 98765 43210",
    dob: "1998-08-14",
    age: 27,
    state: "Karnataka",
    city: "Bengaluru",
    pincode: "560001",
    portfolio: "https://aarav.example.com",
    skills: ["React", "Node.js", "Tailwind", "Product Design"],
    languages: ["English", "Hindi"],
    preferredRoles: ["Frontend Engineer", "Full Stack Developer"],
    experienceLevel: "3-5 years",
    desiredSalary: 1800000,
    education: "Bachelor",
    specialization: "Computer Science",
  });

  const hr = await Hr.create({
    name: "Priya Raman",
    email: "hr@demo.com",
    password,
    company: "NimbusWorks",
    designation: "Head of Talent",
    phone: "+91 91234 56789",
    website: "https://nimbusworks.example.com",
    location: "Bengaluru, India",
    industry: "B2B SaaS",
    teamSize: "201-500",
    about: "NimbusWorks builds workflow automation software for high-growth operations teams.",
  });

  const jobs = await Job.insertMany([
    {
      title: "Senior Frontend Engineer",
      company: "NimbusWorks",
      location: "Bengaluru, India",
      salary: 2400000,
      salaryMin: 1800000,
      salaryMax: 3000000,
      jobType: "Full-time",
      experience: "3-5 years",
      education: "Bachelor's",
      skills: ["React", "TypeScript", "Design Systems"],
      openings: 3,
      workMode: "Hybrid",
      shift: "Day",
      benefits: ["Health insurance", "Learning budget", "ESOPs"],
      department: "Engineering",
      category: "Engineering",
      urgentHiring: true,
      featured: true,
      description:
        "Own polished product surfaces for workflow automation teams. You will partner with design, ship reusable components, improve performance, and mentor engineers.",
      postedBy: hr._id,
      hrId: hr._id,
    },
    {
      title: "Product Analyst",
      company: "NimbusWorks",
      location: "Pune, India",
      salary: 1350000,
      salaryMin: 1000000,
      salaryMax: 1700000,
      jobType: "Full-time",
      experience: "1-3 years",
      education: "Bachelor's",
      skills: ["SQL", "Experimentation", "Dashboards"],
      openings: 2,
      workMode: "Remote",
      shift: "Flexible",
      benefits: ["Remote stipend", "Health insurance"],
      department: "Product",
      category: "Data",
      description:
        "Turn product usage signals into hiring-grade insights. Build dashboards, run experiments, and shape product strategy with clear analysis.",
      postedBy: hr._id,
      hrId: hr._id,
    },
    {
      title: "Talent Operations Specialist",
      company: "NimbusWorks",
      location: "Mumbai, India",
      salary: 900000,
      salaryMin: 700000,
      salaryMax: 1100000,
      jobType: "Full-time",
      experience: "1-3 years",
      education: "Bachelor's",
      skills: ["Recruiting", "ATS", "Candidate Experience"],
      openings: 1,
      workMode: "Office",
      shift: "Day",
      benefits: ["Health insurance", "Commuter benefits"],
      department: "People",
      category: "Human Resources",
      description:
        "Create a calm, high-signal candidate experience across sourcing, interviews, offers, and onboarding.",
      postedBy: hr._id,
      hrId: hr._id,
    },
  ]);

  await Application.create({
    userId: user._id,
    jobId: jobs[0]._id,
    jobVersion: jobs[0].version,
    coverLetter: "I have shipped React dashboards and design systems for SaaS teams.",
    expectedSalary: 2200000,
    availability: "30 days",
    status: "Interview",
    statusHistory: [
      { status: "Pending", note: "Application submitted" },
      { status: "Screening", note: "Profile shortlisted" },
      { status: "Interview", note: "Technical interview scheduled" },
    ],
    jobSnapshot: {
      title: jobs[0].title,
      description: jobs[0].description,
      company: jobs[0].company,
      location: jobs[0].location,
      salary: jobs[0].salary,
      salaryMin: jobs[0].salaryMin,
      salaryMax: jobs[0].salaryMax,
    },
    interviewDate: "2026-05-08",
    interviewTime: "11:00",
    contactInfo: "meet.google.com/demo-link",
    description: "Technical interview with the frontend platform team.",
  });

  await SavedJob.create({ userId: user._id, jobId: jobs[1]._id });

  console.log("Seed complete");
  console.log("User login: user@demo.com / password123");
  console.log("HR login: hr@demo.com / password123");

  await mongoose.disconnect();
};

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
