import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import axios from "../utils/axios";
import { useToast } from "../components/Toast";
import { formatDate, formatSalary, pipelineStatuses, statusStyles } from "../utils/format";

export default function AppliedJobs() {
  const { addToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/applications");
      setApplications(res.data);
    } catch (err) {
      addToast("Could not load applications", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filteredApplications = useMemo(() => {
    if (statusFilter === "All") return applications;
    return applications.filter((item) => item.status === statusFilter);
  }, [applications, statusFilter]);

  return (
    <div className="page-wrap space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Applications</h2>
          <p className="muted mt-1">Track status changes and interview details in one place.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["All", ...pipelineStatuses].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                statusFilter === status ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="panel h-96 animate-pulse" />
      ) : filteredApplications.length === 0 ? (
        <div className="panel p-12 text-center">
          <p className="text-lg font-semibold text-slate-950">No applications found</p>
          <Link to="/browse" className="btn-primary mt-5">Browse jobs</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => {
            const job = application.jobId || application.jobSnapshot || {};
            return (
              <article key={application._id} className="panel p-5">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`badge ${statusStyles[application.status] || "border-slate-200 bg-slate-50 text-slate-600"}`}>
                        {application.status}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Applied {formatDate(application.createdAt)}
                      </span>
                    </div>
                    <h3 className="mt-3 text-xl font-semibold text-slate-950">{job.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{job.company} · {job.location} · {formatSalary(job)}</p>
                    {application.coverLetter && (
                      <p className="mt-4 max-w-3xl rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                        {application.coverLetter}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                    {job._id && (
                      <Link to={`/job/${job._id}`} className="btn-secondary">
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        View job
                      </Link>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
                  <Info label="Expected salary" value={application.expectedSalary ? `INR ${Number(application.expectedSalary).toLocaleString("en-IN")}` : "Not specified"} />
                  <Info label="Availability" value={application.availability || "Not specified"} />
                  <Info label="Interview Date & Time" value={application.interviewDate ? `${application.interviewDate} ${application.interviewTime || ""}` : "Not scheduled"} />
                  {application.interviewDate && (
                    <>
                      <Info label="Interview Contact" value={application.contactInfo || "Not provided"} />
                      <Info label="Interview Notes" value={application.description || "Not provided"} />
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}
