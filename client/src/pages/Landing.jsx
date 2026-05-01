import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  ChartBarIcon,
  CheckCircleIcon,
  SparklesIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { jobCategories } from "../data/categories";

export default function Landing() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const enterApp = () => {
    if (!token) {
      navigate("/login");
      return;
    }
    navigate(role === "hr" ? "/hr-dashboard" : "/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-950">
            <BriefcaseIcon className="h-6 w-6" />
          </span>
          <span className="text-lg font-bold">Worklance</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 sm:inline-flex" to="/hr-login">
            Employers
          </Link>
          <Link className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10" to="/login">
            Login
          </Link>
          <Link className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100" to="/register">
            Register
          </Link>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-semibold text-teal-100">
                <SparklesIcon className="h-4 w-4" />
                Hiring intelligence for modern teams
              </span>
              <h1 className="mt-6 max-w-4xl text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
                Worklance
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                A full-stack job marketplace where candidates discover better roles and employers manage every applicant from post to hire.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={enterApp} className="btn-primary bg-teal-500 text-slate-950 hover:bg-teal-400">
                  Open dashboard
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
                <Link to="/hr-login" className="btn-secondary border-white/15 bg-white/10 text-white hover:bg-white/15">
                  Post a job
                </Link>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
                <Metric value="12k+" label="Active roles" />
                <Metric value="4.8x" label="Faster shortlist" />
                <Metric value="96%" label="Profile match" />
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-[2rem] bg-teal-300/15 blur-3xl" />
              <div className="relative rounded-2xl border border-white/10 bg-white p-3 shadow-2xl">
                <div className="rounded-xl border border-slate-200 bg-surface p-4 text-slate-950">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Live marketplace</p>
                      <h2 className="text-xl font-bold">Role discovery and hiring pipeline</h2>
                    </div>
                    <span className="badge border-emerald-200 bg-emerald-50 text-emerald-700">Live</span>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.85fr]">
                    <div className="space-y-3">
                      {[
                        ["Senior Frontend Engineer", "NimbusWorks", "Hybrid", "INR 18L - 30L"],
                        ["Product Analyst", "BrightLoop", "Remote", "INR 10L - 17L"],
                        ["Talent Ops Specialist", "OrbitHR", "Office", "INR 7L - 11L"],
                      ].map((job) => (
                        <div key={job[0]} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-950">{job[0]}</p>
                              <p className="mt-1 text-sm text-slate-500">{job[1]} · {job[2]}</p>
                            </div>
                            <span className="rounded-lg bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">{job[3]}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-600">Pipeline</p>
                          <ChartBarIcon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="mt-4 space-y-3">
                          {[
                            ["Screening", "68%"],
                            ["Interview", "42%"],
                            ["Hired", "18%"],
                          ].map(([label, width]) => (
                            <div key={label}>
                              <div className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
                                <span>{label}</span>
                                <span>{width}</span>
                              </div>
                              <div className="h-2 rounded-full bg-slate-100">
                                <div className="h-2 rounded-full bg-teal-500" style={{ width }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-950 p-4 text-white">
                        <div className="flex items-center gap-3">
                          <UsersIcon className="h-8 w-8 text-teal-300" />
                          <div>
                            <p className="text-sm text-slate-300">Shortlist quality</p>
                            <p className="text-2xl font-bold">94%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white text-slate-950">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
            {[
              ["Smart job search", "Search by title, company, location, category, work mode, and salary range."],
              ["Applicant tracking", "Move candidates through screening, interviews, approvals, and hires."],
              ["Profile-first UX", "Candidates and employers manage rich profiles that power better matches."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-lg border border-slate-200 p-6">
                <CheckCircleIcon className="h-8 w-8 text-teal-600" />
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-100 text-slate-950">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-3">
              {jobCategories.map((category) => (
                <span key={category} className="badge border-slate-200 bg-white text-slate-700">
                  {category}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({ value, label }) {
  return (
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  );
}
