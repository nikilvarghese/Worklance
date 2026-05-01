const mongoose = require("mongoose");
const User = require("./models/User");

mongoose.connect("mongodb://127.0.0.1:27017/jobportal", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  const users = await User.find({ resume: { $exists: true, $ne: null } }).select("resume name");
  console.log("Resumes in DB:");
  users.forEach(u => console.log(u._id, u.name, u.resume));
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
