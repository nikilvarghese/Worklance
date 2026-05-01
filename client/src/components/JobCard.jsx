import { Link } from "react-router-dom";
import {
  BookmarkIcon,
  BriefcaseIcon,
  BuildingOffice2Icon,
  ClockIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { formatSalary } from "../utils/format";

export default function JobCard({
  job,
  applied = false,
  saved = false,
  onApply,
  onSave,
  loading = false,
  compact = false,
}) {
  if (loading) {
    return (
      <div className="panel animate-pulse p-5">
        <div className="h-4 w-2/3 rounded bg-slate-200" />
        <div className="mt-3 h-3 w-1/2 rounded bg-slate-200" />
        <div className="mt-6 h-20 rounded bg-slate-100" />
      </div>
    );
  }

  if (!job) return null;

  return (
    <article className="panel group p-5 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link to={`/job/${job._id}`} className="block">
            <h3 className="truncate text-lg font-semibold text-slate-950 group-hover:text-indigo-700">{job.title}</h3>
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1">
              <BuildingOffice2Icon className="h-4 w-4" />
              {job.company}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPinIcon className="h-4 w-4" />
              {job.location}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSave?.(job)}
          className={`rounded-lg border p-2 transition ${
            saved
              ? "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-100"
              : "border-slate-200 text-slate-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          }`}
          aria-label={saved ? "Unsave job" : "Save job"}
        >
          {saved ? <BookmarkSolidIcon className="h-5 w-5" /> : <BookmarkIcon className="h-5 w-5" />}
        </button>
      </div>

      {!compact && (
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
          {job.description}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {job.urgentHiring && <span className="badge border-rose-200 bg-rose-50 text-rose-700">Urgent</span>}
        {job.featured && <span className="badge border-amber-200 bg-amber-50 text-amber-700">Featured</span>}
        <span className="badge border-indigo-200 bg-indigo-50 text-indigo-700">{job.jobType || "Full-time"}</span>
        <span className="badge border-teal-200 bg-teal-50 text-teal-700">{job.workMode || "Office"}</span>
        {job.category && <span className="badge border-slate-200 bg-slate-50 text-slate-600">{job.category}</span>}
      </div>

      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1.5 font-medium text-slate-950">
          <BriefcaseIcon className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="whitespace-nowrap">{formatSalary(job)}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ClockIcon className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="whitespace-nowrap">{job.experience || "0-1 years"}</span>
        </span>
        <span className="whitespace-nowrap">
          {job.openings || 1} opening{Number(job.openings || 1) > 1 ? "s" : ""}
        </span>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={() => onApply?.(job)}
          disabled={applied}
          className={applied ? "btn-secondary flex-1 border-emerald-200 bg-emerald-50 text-emerald-700" : "btn-primary flex-1"}
        >
          {applied ? "Applied" : "Apply now"}
        </button>
        <Link to={`/job/${job._id}`} className="btn-secondary flex-1">
          View details
        </Link>
      </div>
    </article>
  );
}
