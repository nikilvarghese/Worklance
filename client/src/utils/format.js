export const formatSalary = (job = {}) => {
  const min = Number(job.salaryMin || 0);
  const max = Number(job.salaryMax || 0);
  const salary = Number(job.salary || 0);
  const formatter = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  });

  if (min && max && min !== max) {
    return `INR ${formatter.format(min)} - ${formatter.format(max)}`;
  }

  if (max || min || salary) {
    return `INR ${formatter.format(max || min || salary)}`;
  }

  return "Salary undisclosed";
};

export const formatDate = (date) => {
  if (!date) return "Not set";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

export const initials = (name = "JP") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "JP";

export const pipelineStatuses = ["Pending", "Screening", "Interview", "Approved", "Rejected", "Hired"];

export const statusStyles = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Screening: "bg-sky-50 text-sky-700 border-sky-200",
  Interview: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-rose-50 text-rose-700 border-rose-200",
  Hired: "bg-teal-50 text-teal-700 border-teal-200",
};
