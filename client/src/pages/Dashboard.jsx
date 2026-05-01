import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookmarkIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import axios from "../utils/axios";
import JobCard from "../components/JobCard";
import OverviewCard from "../components/OverviewCard";
import { formatSalary, statusStyles } from "../utils/format";
import { useToast } from "../components/Toast";

export default function Dashboard() {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const savedIds = useMemo(
    () => new Set(savedJobs.map((item) => item.jobId?._id)),
    [savedJobs]
  );

  const appliedIds = useMemo(
    () =>
      new Set(
        applications.map((item) => item.jobId?._id || item.jobId)
      ),
    [applications]
  );

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [dashboardRes, appRes, savedRes] = await Promise.all([
        axios.get("/dashboard"),
        axios.get("/applications"),
        axios.get("/saved"),
      ]);
      setStats(dashboardRes.data);
      setApplications(appRes.data);
      setSavedJobs(savedRes.data);
    } catch (err) {
      addToast("Could not load dashboard", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const applyJob = async (job) => {
    try {
      await axios.post("/applications", { jobId: job._id });
      addToast("Application submitted", "success");
      fetchDashboard();
    } catch (err) {
      addToast(
        err.response?.data?.message || "Could not apply",
        "error"
      );
    }
  };

  const saveJob = async (job) => {
    try {
      const isSaved = savedIds.has(job._id);

      if (isSaved) {
        const savedRecord = savedJobs.find(
          (item) => item.jobId?._id === job._id
        );
        if (savedRecord) {
          await axios.delete(`/saved/${savedRecord._id}`);
          addToast("Job removed from saved", "success");
        }
      } else {
        await axios.post("/saved", { jobId: job._id });
        addToast("Job saved", "success");
      }

      fetchDashboard();
    } catch (err) {
      addToast(
        err.response?.data?.message || "Could not save job",
        "error"
      );
    }
  };

  if (loading) {
    return (
      <div className="page-wrap max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="panel h-32 animate-pulse bg-white"
            />
          ))}
        </div>
      </div>
    );
  }

  const recommendedJobs = stats?.recommendedJobs || [];
  const latestApplications =
    stats?.latestApplications || applications.slice(0, 5);

  return (
    <div className="page-wrap max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* TOP STATS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <OverviewCard
          icon={BriefcaseIcon}
          number={stats?.totalJobs || 0}
          label="Open roles"
          accent="indigo"
          helper="Across active listings"
        />
        <OverviewCard
          icon={ClipboardDocumentListIcon}
          number={stats?.appliedCount || 0}
          label="Applications"
          accent="teal"
          helper="Submitted by you"
        />
        <OverviewCard
          icon={BookmarkIcon}
          number={stats?.savedCount || 0}
          label="Saved jobs"
          accent="amber"
          helper="Ready to revisit"
        />
        <OverviewCard
          icon={CalendarDaysIcon}
          number={stats?.interviewCount || 0}
          label="Interview signals"
          accent="rose"
          helper="Interview or approved"
        />
      </section>

      {/* MAIN CONTENT */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT SIDE */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="section-title">Recommended jobs</h2>
              <p className="muted mt-1">
                Fresh roles sorted by featured and urgent hiring signals.
              </p>
            </div>
            <Link
              to="/browse"
              className="btn-secondary hidden sm:inline-flex"
            >
              Browse all
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {recommendedJobs.length > 0 ? (
              recommendedJobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  applied={appliedIds.has(job._id)}
                  saved={savedIds.has(job._id)}
                  onApply={applyJob}
                  onSave={saveJob}
                  compact
                />
              ))
            ) : (
              <div className="panel p-10 text-center text-slate-500 col-span-2">
                No active jobs yet.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky top-6">
          {/* APPLICATION STATUS */}
          <div className="panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="section-title">Application status</h2>
              <Link
                to="/applied"
                className="text-sm font-semibold text-indigo-600 hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {latestApplications.length > 0 ? (
                latestApplications.map((application) => (
                  <div
                    key={application._id}
                    className="rounded-xl border border-slate-100 p-4 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {application.jobId?.title ||
                            application.jobSnapshot?.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {application.jobId?.company ||
                            application.jobSnapshot?.company}{" "}
                          ·{" "}
                          {formatSalary(
                            application.jobId ||
                            application.jobSnapshot
                          )}
                        </p>
                      </div>

                      <span
                        className={`badge ${statusStyles[application.status] ||
                          "border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                      >
                        {application.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-10 text-center text-sm text-slate-500">
                  No applications yet.
                </p>
              )}
            </div>
          </div>

          {/* PREMIUM CARD */}
          <div className="panel bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white rounded-2xl shadow-lg">
            <p className="text-sm font-semibold text-teal-300">
              Premium idea
            </p>
            <h3 className="mt-2 text-xl font-bold">
              Candidate Boost
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Monetize with priority applications, profile insights,
              featured resumes, and saved-search alerts.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}