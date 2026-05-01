import { useEffect, useMemo, useState } from "react";
import { ArrowTrendingUpIcon, CurrencyDollarIcon, MegaphoneIcon } from "@heroicons/react/24/outline";
import axios from "../utils/axios";
import { pipelineStatuses } from "../utils/format";

export default function Reports() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          axios.get("/jobs/my-jobs"),
          axios.get("/applications"),
        ]);
        setJobs(jobsRes.data);
        setApplications(appsRes.data);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  const statusData = useMemo(() => {
    const max = Math.max(...pipelineStatuses.map((status) => applications.filter((app) => app.status === status).length), 1);
    return pipelineStatuses.map((status) => {
      const count = applications.filter((app) => app.status === status).length;
      return { status, count, width: `${(count / max) * 100}%` };
    });
  }, [applications]);

  const avgApplicants = jobs.length ? (applications.length / jobs.length).toFixed(1) : "0.0";

  if (loading) {
    return (
      <div className="page-wrap">
        <div className="panel h-96 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="page-wrap space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">Reports</h2>
        <p className="muted mt-1">Hiring performance, pipeline distribution, and monetization-ready insights.</p>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        <Insight icon={ArrowTrendingUpIcon} label="Applicants per role" value={avgApplicants} />
        <Insight icon={MegaphoneIcon} label="Featured jobs" value={jobs.filter((job) => job.featured).length} />
        <Insight icon={CurrencyDollarIcon} label="Premium revenue idea" value="Sponsored posts" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <div className="panel p-5">
          <h3 className="section-title">Pipeline distribution</h3>
          <div className="mt-6 space-y-5">
            {statusData.map((item) => (
              <div key={item.status}>
                <div className="mb-2 flex justify-between text-sm font-semibold text-slate-700">
                  <span>{item.status}</span>
                  <span>{item.count}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div className="h-3 rounded-full bg-indigo-600" style={{ width: item.width }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-5">
          <h3 className="section-title">Monetization roadmap</h3>
          <div className="mt-5 space-y-3">
            {[
              ["Premium job posts", "Featured placement, urgent badges, and sponsor boosts."],
              ["Employer analytics", "Conversion reports, drop-off tracking, and applicant quality scores."],
              ["Candidate boost", "Priority applications, profile audits, and saved-search alerts."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="font-semibold text-slate-950">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Insight({ icon: Icon, label, value }) {
  return (
    <div className="panel p-5">
      <Icon className="h-7 w-7 text-indigo-600" />
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}
