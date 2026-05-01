const Job = require("../models/Job");

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const asList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

exports.normalizeJobPayload = (payload) => {
  const salaryMin = Number(payload.salaryMin || 0);
  const salaryMax = Number(payload.salaryMax || 0);
  const numericSalary = Number(payload.salary || 0);
  const salary =
    numericSalary ||
    (salaryMin && salaryMax ? Math.round((salaryMin + salaryMax) / 2) : salaryMax || salaryMin || 0);

  return {
    ...payload,
    salary,
    salaryMin,
    salaryMax: salaryMax || salaryMin || salary,
    openings: Number(payload.openings || 1),
    skills: asList(payload.skills),
    benefits: asList(payload.benefits),
    urgentHiring: payload.urgentHiring === true || payload.urgentHiring === "true",
    featured: payload.featured === true || payload.featured === "true",
  };
};

exports.createJob = async (req, res) => {
  try {
    const job = await Job.create({
      ...exports.normalizeJobPayload(req.body),
      postedBy: req.user.id,
      hrId: req.user.id,
    });

    return res.json(job);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const {
      search,
      location,
      category,
      jobType,
      workMode,
      minSalary,
      maxSalary,
      page = 1,
      limit = 24,
    } = req.query;

    const filter = { isActive: true };

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      filter.$or = [
        { title: regex },
        { company: regex },
        { description: regex },
        { skills: regex },
      ];
    }

    if (location) {
      filter.location = new RegExp(escapeRegex(location), "i");
    }

    if (category) {
      filter.category = new RegExp(`^${escapeRegex(category)}$`, "i");
    }

    if (jobType) {
      filter.jobType = jobType;
    }

    if (workMode) {
      filter.workMode = workMode;
    }

    if (minSalary || maxSalary) {
      const salaryRange = {};
      if (minSalary) {
        salaryRange.$gte = Number(minSalary);
      }
      if (maxSalary) {
        salaryRange.$lte = Number(maxSalary);
      }
      filter.$and = [
        ...(filter.$and || []),
        {
          $or: [
            { salary: salaryRange },
            { salaryMin: salaryRange },
            { salaryMax: salaryRange },
          ],
        },
      ];
    }

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 50);

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate("postedBy", "name email company")
        .sort({ featured: -1, urgentHiring: -1, createdAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber),
      Job.countDocuments(filter),
    ]);

    res.set("X-Total-Count", String(total));
    return res.json(jobs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};
