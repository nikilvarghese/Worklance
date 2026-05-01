import { useEffect, useMemo, useState } from "react";
import { FunnelIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import axios from "../utils/axios";
import JobCard from "../components/JobCard";
import { useToast } from "../components/Toast";
import { jobCategories } from "../data/categories";

const categories = ["", ...jobCategories];
const jobTypes = ["", "Full-time", "Part-time", "Contract", "Internship"];
const workModes = ["", "Office", "Remote", "Hybrid"];

export default function BrowseJobs() {
  const { addToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    category: "",
    jobType: "",
    workMode: "",
    minSalary: "",
    maxSalary: "",
  });
  const [applicationJob, setApplicationJob] = useState(null);
  const [applicationForm, setApplicationForm] = useState({
    coverLetter: "",
    expectedSalary: "",
    availability: "Immediately",
  });
  const [submitting, setSubmitting] = useState(false);

  const appliedIds = useMemo(() => new Set(applications.map((item) => item.jobId?._id || item.jobId)), [applications]);
  const savedIds = useMemo(() => new Set(savedJobs.map((item) => item.jobId?._id)), [savedJobs]);

  const fetchStatus = async () => {
    const [appRes, savedRes] = await Promise.all([
      axios.get("/applications"),
      axios.get("/saved"),
    ]);
    setApplications(appRes.data);
    setSavedJobs(savedRes.data);
  };

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ""));
        const [jobsRes] = await Promise.all([axios.get("/jobs", { params }), fetchStatus()]);
        setJobs(jobsRes.data);
      } catch (err) {
        addToast("Could not load jobs", "error");
      } finally {
        setLoading(false);
      }
    };

    const timeout = window.setTimeout(fetchJobs, 250);
    return () => window.clearTimeout(timeout);
  }, [addToast, filters]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const openApply = (job) => {
    setApplicationJob(job);
    setApplicationForm({
      coverLetter: `I am interested in the ${job.title} role at ${job.company}.`,
      expectedSalary: job.salaryMax || job.salary || "",
      availability: "Immediately",
    });
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    if (!applicationJob) return;
    setSubmitting(true);
    try {
      await axios.post("/applications", {
        jobId: applicationJob._id,
        ...applicationForm,
      });
      addToast("Application submitted", "success");
      setApplicationJob(null);
      await fetchStatus();
    } catch (err) {
      addToast(err.response?.data?.message || "Could not apply", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const saveJob = async (job) => {
    try {
      // Check if already saved
      const isSaved = savedIds.has(job._id);
      
      if (isSaved) {
        // Find the saved record and delete it
        const savedRecord = savedJobs.find((item) => item.jobId?._id === job._id);
        if (savedRecord) {
          await axios.delete(`/saved/${savedRecord._id}`);
          addToast("Job removed from saved", "success");
        }
      } else {
        // Save the job
        await axios.post("/saved", { jobId: job._id });
        addToast("Job saved", "success");
      }
      
      await fetchStatus();
    } catch (err) {
      addToast(err.response?.data?.message || "Could not save job", "error");
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      location: "",
      category: "",
      jobType: "",
      workMode: "",
      minSalary: "",
      maxSalary: "",
    });
  };

  return (
    <div className="page-wrap">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Browse jobs</h2>
          <p className="muted mt-1">Filter by location, salary, category, work mode, and role type.</p>
        </div>
        <button type="button" onClick={clearFilters} className="btn-secondary">
          <XMarkIcon className="h-4 w-4" />
          Clear filters
        </button>
      </div>

      <section className="panel mb-6 p-4">
        <div className="grid gap-3 lg:grid-cols-[1.2fr_0.9fr_0.8fr_0.8fr_0.8fr_0.7fr_0.7fr]">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search title, company, skill"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
            />
          </div>
          <input
            className="input"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => updateFilter("location", e.target.value)}
          />
          <select className="input" value={filters.category} onChange={(e) => updateFilter("category", e.target.value)}>
            {categories.map((item) => <option key={item || "all"} value={item}>{item || "All categories"}</option>)}
          </select>
          <select className="input" value={filters.jobType} onChange={(e) => updateFilter("jobType", e.target.value)}>
            {jobTypes.map((item) => <option key={item || "all"} value={item}>{item || "All job types"}</option>)}
          </select>
          <select className="input" value={filters.workMode} onChange={(e) => updateFilter("workMode", e.target.value)}>
            {workModes.map((item) => <option key={item || "all"} value={item}>{item || "All modes"}</option>)}
          </select>
          <input
            className="input"
            placeholder="Min INR"
            type="number"
            value={filters.minSalary}
            onChange={(e) => updateFilter("minSalary", e.target.value)}
          />
          <input
            className="input"
            placeholder="Max INR"
            type="number"
            value={filters.maxSalary}
            onChange={(e) => updateFilter("maxSalary", e.target.value)}
          />
        </div>
      </section>

      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-600">
        <FunnelIcon className="h-4 w-4" />
        {jobs.length} matching role{jobs.length === 1 ? "" : "s"}
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => <JobCard key={item} loading />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="panel p-12 text-center">
          <p className="text-lg font-semibold text-slate-950">No jobs matched your filters</p>
          <p className="muted mt-2">Try a broader salary range or remove one of the filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              applied={appliedIds.has(job._id)}
              saved={savedIds.has(job._id)}
              onApply={openApply}
              onSave={saveJob}
            />
          ))}
        </div>
      )}

      {applicationJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <form onSubmit={submitApplication} className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label">Application</p>
                <h3 className="mt-1 text-xl font-bold text-slate-950">{applicationJob.title}</h3>
                <p className="muted mt-1">{applicationJob.company}</p>
              </div>
              <button type="button" onClick={() => setApplicationJob(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="label">Cover note</label>
                <textarea
                  className="input mt-1 min-h-32"
                  value={applicationForm.coverLetter}
                  onChange={(e) => setApplicationForm({ ...applicationForm, coverLetter: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Expected salary</label>
                  <input
                    type="number"
                    className="input mt-1"
                    value={applicationForm.expectedSalary}
                    onChange={(e) => setApplicationForm({ ...applicationForm, expectedSalary: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Availability</label>
                  <select
                    className="input mt-1"
                    value={applicationForm.availability}
                    onChange={(e) => setApplicationForm({ ...applicationForm, availability: e.target.value })}
                  >
                    <option>Immediately</option>
                    <option>15 days</option>
                    <option>30 days</option>
                    <option>60 days</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setApplicationJob(null)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary">{submitting ? "Submitting..." : "Submit application"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
