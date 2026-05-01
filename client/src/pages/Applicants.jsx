import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDaysIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import axios from "../utils/axios";
import { useToast } from "../components/Toast";
import { formatDate, pipelineStatuses, statusStyles } from "../utils/format";

export default function Applicants() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [interviewApp, setInterviewApp] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
    interviewDate: "",
    interviewTime: "",
    contactInfo: "",
    description: "",
  });

  const fetchApplicants = useCallback(async (jobId) => {
    if (!jobId) {
      setApplicants([]);
      return;
    }
    try {
      const res = await axios.get(`/applications/job/${jobId}/applicants`);
      setApplicants(res.data);
    } catch (err) {
      addToast("Could not load applicants", "error");
      setApplicants([]);
    }
  }, [addToast]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/jobs/my-jobs");
      setJobs(res.data);
      if (res.data[0]) {
        setSelectedJob(res.data[0]._id);
        await fetchApplicants(res.data[0]._id);
      }
    } catch (err) {
      addToast("Could not load jobs", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast, fetchApplicants]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const filteredApplicants = useMemo(() => {
    return applicants.filter((application) => {
      const matchesStatus = statusFilter === "All" || application.status === statusFilter;
      const text = `${application.userId?.name || ""} ${application.userId?.email || ""} ${application.userId?.headline || ""}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [applicants, statusFilter, search]);

  const updateStatus = async (application, status, extra = {}) => {
    try {
      await axios.put(`/applications/${application._id}/status`, { status, ...extra });
      addToast(`Moved to ${status}`, "success");
      await fetchApplicants(selectedJob);
      setInterviewApp(null);
    } catch (err) {
      addToast("Could not update status", "error");
    }
  };

  const openInterview = (application) => {
    setInterviewApp(application);
    setInterviewForm({
      interviewDate: application.interviewDate || "",
      interviewTime: application.interviewTime || "",
      contactInfo: application.contactInfo || "",
      description: application.description || "",
    });
  };

  const submitInterview = (e) => {
    e.preventDefault();
    const now = new Date();
    const interviewDateTime = new Date(`${interviewForm.interviewDate}T${interviewForm.interviewTime}`);
    const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    if (interviewDateTime < threeHoursFromNow) {
      addToast("Interview must be scheduled at least 3 hours in the future", "error");
      return;
    }

    updateStatus(interviewApp, "Interview", interviewForm);
  };

  return (
    <div className="page-wrap space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">Applicants</h2>
        <p className="muted mt-1">Review candidate details and move applications through your hiring pipeline.</p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <aside className="panel p-4">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Jobs</h3>
          <div className="mt-4 space-y-2">
            {loading ? (
              <div className="h-40 animate-pulse rounded-lg bg-slate-100" />
            ) : jobs.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No posted jobs yet.</p>
            ) : (
              jobs.map((job) => (
                <button
                  key={job._id}
                  type="button"
                  onClick={() => {
                    setSelectedJob(job._id);
                    fetchApplicants(job._id);
                  }}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    selectedJob === job._id ? "border-indigo-200 bg-indigo-50" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <p className="font-semibold text-slate-950">{job.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{job.location}</p>
                </button>
              ))
            )}
          </div>
        </aside>

        <div className="space-y-4">
          <div className="panel p-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  className="input pl-9"
                  placeholder="Search candidate"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {["All", ...pipelineStatuses].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                      statusFilter === status ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="panel overflow-hidden">
            {filteredApplicants.length === 0 ? (
              <div className="p-12 text-center">
                <UsersIcon className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 font-semibold text-slate-950">No applicants found</p>
                <p className="muted mt-1">Applications will appear here after candidates apply.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {filteredApplicants.map((application) => (
                  <article key={application._id} className="p-5 hover:bg-slate-50">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                      <button
                        type="button"
                        onClick={() => navigate(`/hr/applicant/${application._id}`)}
                        className="min-w-0 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                            {(application.userId?.name || "A").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-950">{application.userId?.name}</h3>
                            <p className="text-sm text-slate-500">{application.userId?.email}</p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-slate-600">{application.userId?.headline || "No headline added"}</p>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Applied {formatDate(application.createdAt)}
                        </p>
                      </button>

                      <div className="flex flex-col gap-3">
                        <span className={`badge justify-center ${statusStyles[application.status]}`}>{application.status}</span>
                        <div className="flex flex-wrap gap-2">
                          {application.status === "Pending" && (
                            <button type="button" onClick={() => updateStatus(application, "Screening")} className="btn-secondary px-3 py-2">Screen</button>
                          )}
                          {application.status === "Screening" && (
                            <>
                              <button type="button" onClick={() => openInterview(application)} className="btn-secondary px-3 py-2">
                                <CalendarDaysIcon className="h-4 w-4" />
                                Interview
                              </button>
                              <button type="button" onClick={() => updateStatus(application, "Rejected")} className="btn-secondary px-3 py-2 text-rose-700">Reject</button>
                            </>
                          )}
                          {application.status === "Interview" && (
                            <>
                              <button type="button" onClick={() => updateStatus(application, "Hired")} className="btn-secondary px-3 py-2">Hire</button>
                              <button type="button" onClick={() => updateStatus(application, "Rejected")} className="btn-secondary px-3 py-2 text-rose-700">Reject</button>
                            </>
                          )}
                          <button type="button" onClick={() => navigate(`/hr/applicant/${application._id}`)} className="rounded-lg p-2 text-slate-500 hover:bg-white">
                            <ChevronRightIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {interviewApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <form onSubmit={submitInterview} className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label">Interview</p>
                <h3 className="mt-1 text-xl font-bold text-slate-950">{interviewApp.userId?.name}</h3>
              </div>
              <button type="button" onClick={() => setInterviewApp(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Date"><input type="date" className="input" value={interviewForm.interviewDate} onChange={(e) => setInterviewForm({ ...interviewForm, interviewDate: e.target.value })} min={new Date().toISOString().split('T')[0]} required /></Field>
              <Field label="Time"><input type="time" className="input" value={interviewForm.interviewTime} onChange={(e) => setInterviewForm({ ...interviewForm, interviewTime: e.target.value })} required /></Field>
              <Field label="Contact link or phone"><input className="input" value={interviewForm.contactInfo} onChange={(e) => setInterviewForm({ ...interviewForm, contactInfo: e.target.value })} /></Field>
              <Field label="Notes"><input className="input" value={interviewForm.description} onChange={(e) => setInterviewForm({ ...interviewForm, description: e.target.value })} /></Field>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setInterviewApp(null)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Schedule interview</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="label mb-1 block">{label}</span>
      {children}
    </label>
  );
}
