import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import axios from "../utils/axios";
import OverviewCard from "../components/OverviewCard";
import { formatSalary, pipelineStatuses, statusStyles } from "../utils/format";
import { useToast } from "../components/Toast";

export default function HrDashboard() {
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [dashboardRes, applicationsRes] = await Promise.all([
        axios.get("/dashboard"),
        axios.get("/applications"),
      ]);
      setData(dashboardRes.data);
      setApplications(applicationsRes.data);
    } catch (err) {
      addToast("Could not load employer dashboard", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const pipeline = useMemo(() => {
    return pipelineStatuses.map((status) => ({
      status,
      count: applications.filter((item) => item.status === status).length,
    }));
  }, [applications]);

  if (loading) {
    return (
      <div className="page-wrap">
        <div className="dashboard-grid">
          {[1, 2, 3, 4].map((item) => <div key={item} className="panel h-32 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap space-y-8">
      <section className="dashboard-grid">
        <OverviewCard icon={BriefcaseIcon} number={data?.totalJobs || 0} label="Active jobs" helper="Published listings" accent="indigo" />
        <OverviewCard icon={UsersIcon} number={data?.applicants || 0} label="Applicants" helper="Across all jobs" accent="teal" />
        <OverviewCard icon={CalendarDaysIcon} number={data?.interviews || 0} label="Interviews" helper="In pipeline" accent="amber" />
        <OverviewCard icon={CheckBadgeIcon} number={data?.hires || 0} label="Approved/Hired" helper="Positive outcomes" accent="rose" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Pipeline health</h2>
            <Link to="/applicants" className="text-sm font-semibold text-indigo-700">Applicants</Link>
          </div>
          <div className="mt-5 space-y-4">
            {pipeline.map((item) => {
              const max = Math.max(...pipeline.map((entry) => entry.count), 1);
              return (
                <div key={item.status}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className={`badge ${statusStyles[item.status]}`}>{item.status}</span>
                    <span className="font-semibold text-slate-700">{item.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${(item.count / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Recent applicants</h2>
            <Link to="/post-job" className="btn-primary">Post job</Link>
          </div>
          <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
            {applications.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">No applicants yet.</div>
            ) : (
              <div className="divide-y divide-slate-200">
                {applications.slice(0, 8).map((application) => (
                  <div key={application._id} className="grid gap-3 p-4 hover:bg-slate-50 md:grid-cols-[1fr_1fr_auto] md:items-center">
                    <div>
                      <p className="font-semibold text-slate-950">{application.userId?.name || "Applicant"}</p>
                      <p className="text-sm text-slate-500">{application.userId?.email}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{application.jobId?.title}</p>
                      <p className="text-sm text-slate-500">{formatSalary(application.jobId)}</p>
                    </div>
                    <span className={`badge ${statusStyles[application.status]}`}>{application.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {(data?.jobs || []).map((job) => (
          <Link key={job._id} to={`/job/${job._id}`} className="panel p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
            <p className="text-sm font-semibold text-slate-500">{job.category || "General"}</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-950">{job.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{job.location} · {formatSalary(job)}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
