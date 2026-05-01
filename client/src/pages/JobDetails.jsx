import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  BookmarkIcon,
  BriefcaseIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  CheckCircleIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import axios from "../utils/axios";
import { useToast } from "../components/Toast";
import { formatDate, formatSalary } from "../utils/format";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const role = localStorage.getItem("role");
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    coverLetter: "",
    expectedSalary: "",
    availability: "Immediately",
  });

  const applied = useMemo(
    () => applications.some((item) => (item.jobId?._id || item.jobId) === id),
    [applications, id]
  );
  const saved = useMemo(
    () => savedJobs.some((item) => item.jobId?._id === id),
    [savedJobs, id]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const requests = [axios.get(`/jobs/${id}`)];
      if (role === "user") {
        requests.push(axios.get("/applications"), axios.get("/saved"));
      }
      const [jobRes, appRes, savedRes] = await Promise.all(requests);
      setJob(jobRes.data);
      setApplicationForm((prev) => ({
        ...prev,
        coverLetter: `I am interested in the ${jobRes.data.title} role at ${jobRes.data.company}.`,
        expectedSalary: jobRes.data.salaryMax || jobRes.data.salary || "",
      }));
      setApplications(appRes?.data || []);
      setSavedJobs(savedRes?.data || []);
    } catch (err) {
      addToast("Could not load job details", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast, id, role]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const submitApplication = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      await axios.post("/applications", { jobId: id, ...applicationForm });
      addToast("Application submitted", "success");
      await loadData();
    } catch (err) {
      addToast(err.response?.data?.message || "Could not apply", "error");
    } finally {
      setApplying(false);
    }
  };

  const saveJob = async () => {
    try {
      await axios.post("/saved", { jobId: id });
      addToast("Job saved", "success");
      await loadData();
    } catch (err) {
      addToast(err.response?.data?.message || "Could not save job", "error");
    }
  };

  if (loading) {
    return (
      <div className="page-wrap">
        <div className="panel h-96 animate-pulse" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="page-wrap">
        <div className="panel p-12 text-center">
          <h2 className="text-xl font-bold text-slate-950">Job not found</h2>
          <button type="button" onClick={() => navigate(role === "hr" ? "/manage-jobs" : "/browse")} className="btn-primary mt-5">
            Back to jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap space-y-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </button>

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-200 bg-white p-6">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap gap-2">
                {job.featured && <span className="badge border-amber-200 bg-amber-50 text-amber-700">Featured</span>}
                {job.urgentHiring && <span className="badge border-rose-200 bg-rose-50 text-rose-700">Urgent hiring</span>}
                <span className="badge border-indigo-200 bg-indigo-50 text-indigo-700">{job.category || "General"}</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-950">{job.title}</h2>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <BuildingOffice2Icon className="h-4 w-4" />
                  {job.company}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4" />
                  {job.location}
                </span>
                <span className="inline-flex items-center gap-2 font-semibold text-slate-950">
                  <BriefcaseIcon className="h-4 w-4" />
                  {formatSalary(job)}
                </span>
              </div>
            </div>

            {role === "user" && (
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <button type="button" onClick={saveJob} disabled={saved} className="btn-secondary">
                  <BookmarkIcon className="h-4 w-4" />
                  {saved ? "Saved" : "Save job"}
                </button>
                <a href="#apply" className={applied ? "btn-secondary border-emerald-200 bg-emerald-50 text-emerald-700" : "btn-primary"}>
                  <CheckCircleIcon className="h-4 w-4" />
                  {applied ? "Applied" : "Apply now"}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8 p-6">
            <section>
              <h3 className="section-title">Job description</h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{job.description}</p>
            </section>

            <section>
              <h3 className="section-title">Skills and requirements</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {(job.skills || []).length > 0 ? (
                  job.skills.map((skill) => (
                    <span key={skill} className="badge border-slate-200 bg-slate-50 text-slate-700">{skill}</span>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Skills not specified.</p>
                )}
              </div>
            </section>

            <section>
              <h3 className="section-title">Benefits</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(job.benefits || ["Competitive pay", "Growth opportunities"]).map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm font-medium text-slate-700">
                    <CheckCircleIcon className="h-5 w-5 text-teal-600" />
                    {benefit}
                  </div>
                ))}
              </div>
            </section>

            {role === "user" && (
              <section id="apply" className="panel bg-slate-50 p-5">
                <h3 className="section-title">{applied ? "Application submitted" : "Apply for this role"}</h3>
                {applied ? (
                  <p className="muted mt-2">You can track this role from your Applications page.</p>
                ) : (
                  <form onSubmit={submitApplication} className="mt-5 space-y-4">
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
                    <button type="submit" disabled={applying} className="btn-primary">
                      {applying ? "Submitting..." : "Submit application"}
                    </button>
                  </form>
                )}
              </section>
            )}
          </div>

          <aside className="border-t border-slate-200 bg-slate-50 p-6 lg:border-l lg:border-t-0">
            <h3 className="section-title">Role overview</h3>
            <dl className="mt-5 space-y-4 text-sm">
              <Row label="Job type" value={job.jobType} />
              <Row label="Work mode" value={job.workMode} />
              <Row label="Experience" value={job.experience} />
              <Row label="Education" value={job.education} />
              <Row label="Openings" value={job.openings} />
              <Row label="Department" value={job.department || "Not specified"} />
              <Row label="Closing date" value={job.closingDate ? formatDate(job.closingDate) : "Rolling"} />
            </dl>

            <div className="mt-8 rounded-lg bg-white p-4">
              <CalendarDaysIcon className="h-6 w-6 text-indigo-600" />
              <p className="mt-3 text-sm font-semibold text-slate-950">Hiring flow</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Applications move through screening, interview, approval, and hire decisions.
              </p>
            </div>

            {role === "hr" && (
              <Link to="/manage-jobs" className="btn-primary mt-5 w-full">Manage listing</Link>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-semibold text-slate-950">{value || "Not specified"}</dd>
    </div>
  );
}
