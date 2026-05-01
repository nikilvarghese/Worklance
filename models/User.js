const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      default: "",
    },
    lastName: {
      type: String,
      trim: true,
      default: "",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    googleId: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user"],
      default: "user",
    },
    headline: {
      type: String,
      default: "Open to new opportunities",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    dob: String,
    age: Number,
    state: String,
    city: String,
    pincode: String,
    portfolio: {
      type: String,
      default: "",
      trim: true,
    },
    resume: String,
    skills: {
      type: [String],
      default: [],
    },
    languages: {
      type: [String],
      default: [],
    },
    preferredRoles: {
      type: [String],
      default: [],
    },
    experienceLevel: {
      type: String,
      default: "Fresher",
    },
    desiredSalary: {
      type: Number,
      default: 0,
    },
    education: String,
    specialization: String,
    passwordSet: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ skills: 1 });
userSchema.index({ preferredRoles: 1 });

module.exports = mongoose.model("User", userSchema);
