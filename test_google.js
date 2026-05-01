require('dotenv').config();
const { getGoogleUser } = require('./utils/google');
const crypto = require("crypto");
const mongoose = require("mongoose");
const User = require("./models/User");

async function test() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/jobportal");
  console.log("DB connected");

  try {
    const password = crypto.randomBytes(32).toString("hex");
    const user = await User.create({
      name: "Test User",
      firstName: "Test",
      lastName: "User",
      email: "test_google_error@example.com",
      password: password,
      passwordSet: false,
    });
    console.log("User created successfully:", user);
    await User.deleteOne({ email: "test_google_error@example.com" });
  } catch (err) {
    console.error("Error creating user:", err);
  }
  process.exit(0);
}
test();
