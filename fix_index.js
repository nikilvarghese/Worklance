require('dotenv').config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function fixIndex() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/jobportal");
  console.log("DB connected");

  try {
    const db = mongoose.connection.db;
    const indexes = await db.collection("users").indexes();
    console.log("Current indexes:", indexes);
    
    // Drop the problematic index if it exists
    await db.collection("users").dropIndex("skills_1_preferredRoles_1").catch(() => {});
    console.log("Dropped problematic index if it existed.");
  } catch (err) {
    console.error("Error fixing index:", err);
  }
  process.exit(0);
}
fixIndex();
