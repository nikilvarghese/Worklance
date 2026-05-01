const mongoose = require("mongoose");

const savedSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
});

module.exports = mongoose.model("Saved", savedSchema);