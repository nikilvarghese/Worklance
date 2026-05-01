const Application = require("../models/Application");

// Apply to job
exports.applyJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    const application = await Application.create({
      job: jobId,
      user: req.user.id
    });

    res.json(application);
  } catch (err) {
    res.status(500).json(err);
  }
};

// Get my applications
exports.getMyApplications = async (req, res) => {
  try {
    const apps = await Application.find({ user: req.user.id }).populate("job");

    res.json(apps);
  } catch (err) {
    res.status(500).json(err);
  }
};