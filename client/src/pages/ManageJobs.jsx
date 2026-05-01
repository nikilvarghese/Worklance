import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import axios from "../utils/axios";
import { useToast } from "../components/Toast";
import { formatSalary } from "../utils/format";
import { jobCategories } from "../data/categories";

export default function ManageJobs() {
  const { addToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [editingJob, setEditingJob] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/jobs/my-jobs");
      setJobs(res.data);
    } catch (err) {
      addToast("Could not load jobs", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const startEdit = (job) => {
    setEditingJob(job);
    setForm({
      ...job,
      skills: (job.skills || []).join(", "),
      benefits: (job.benefits || []).join(", "),
    });
  };

  const updateJob = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/jobs/${editingJob._id}`, {
        ...form,
        salary: Number(form.salaryMax || form.salaryMin || form.salary || 0),
        salaryMin: Number(form.salaryMin || 0),
        salaryMax: Number(form.salaryMax || 0),
      });
      addToast("Job updated", "success");
      setEditingJob(null);
      fetchJobs();
    } catch (err) {
      addToast(err.response?.data?.message || "Could not update job", "error");
    }
  };

  const deleteJob = async () => {
    if (!jobToDelete) return;
    try {
      const res = await axios.delete(`/jobs/${jobToDelete._id}`);
      addToast(res.data?.message || "Job removed", "success");
      fetchJobs();
    } catch (err) {
      addToast(err.response?.data?.message || "Could not delete job", "error");
    } finally {
      setDeleteModalOpen(false);
      setJobToDelete(null);
    }
  };

  const openDeleteModal = (job) => {
    setJobToDelete(job);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setJobToDelete(null);
  };

  return (
    <div className="page-wrap space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Manage jobs</h2>
          <p className="muted mt-1">Edit listings, review performance, and archive roles cleanly.</p>
        </div>
        <Link to="/post-job" className="btn-primary">Post job</Link>
      </div>

      {loading ? (
        <div className="panel h-96 animate-pulse" />
      ) : jobs.length === 0 ? (
        <div className="panel p-12 text-center">
          <p className="text-lg font-semibold text-slate-950">No jobs posted yet</p>
          <Link to="/post-job" className="btn-primary mt-5">Post first job</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <article key={job._id} className="panel p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <span className="badge border-indigo-200 bg-indigo-50 text-indigo-700">{job.jobType}</span>
                    <span className="badge border-teal-200 bg-teal-50 text-teal-700">{job.workMode}</span>
                    {job.urgentHiring && <span className="badge border-rose-200 bg-rose-50 text-rose-700">Urgent</span>}
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-slate-950">{job.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{job.company} · {job.location} · {formatSalary(job)}</p>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{job.description}</p>
                </div>
                <div className="flex gap-2">
                  <Link to={`/job/${job._id}`} className="btn-secondary">View</Link>
                  <button type="button" onClick={() => startEdit(job)} className="btn-secondary">
                    <PencilSquareIcon className="h-4 w-4" />
                    Edit
                  </button>
                  <button type="button" onClick={() => openDeleteModal(job)} className="btn-secondary text-rose-700">
                    <TrashIcon className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <form onSubmit={updateJob} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label">Editing listing</p>
                <h3 className="mt-1 text-xl font-bold text-slate-950">{editingJob.title}</h3>
              </div>
              <button type="button" onClick={() => setEditingJob(null)} className="btn-secondary">Cancel</button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Title"><input className="input" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
              <Field label="Company"><input className="input" value={form.company || ""} onChange={(e) => setForm({ ...form, company: e.target.value })} required /></Field>
              <Field label="Location"><input className="input" value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></Field>
              <Field label="Category">
                <select className="input" value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {jobCategories.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </Field>
              <Field label="Salary min"><input type="number" className="input" value={form.salaryMin || ""} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} /></Field>
              <Field label="Salary max"><input type="number" className="input" value={form.salaryMax || ""} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} /></Field>
              <Field label="Job type"><select className="input" value={form.jobType || "Full-time"} onChange={(e) => setForm({ ...form, jobType: e.target.value })}>{["Full-time", "Part-time", "Contract", "Internship"].map((item) => <option key={item}>{item}</option>)}</select></Field>
              <Field label="Work mode"><select className="input" value={form.workMode || "Office"} onChange={(e) => setForm({ ...form, workMode: e.target.value })}>{["Office", "Remote", "Hybrid"].map((item) => <option key={item}>{item}</option>)}</select></Field>
              <Field label="Skills"><input className="input" value={form.skills || ""} onChange={(e) => setForm({ ...form, skills: e.target.value })} /></Field>
              <Field label="Benefits"><input className="input" value={form.benefits || ""} onChange={(e) => setForm({ ...form, benefits: e.target.value })} /></Field>
            </div>
            <div className="mt-4">
              <Field label="Description"><textarea className="input min-h-32" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></Field>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setEditingJob(null)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Save changes</button>
            </div>
          </form>
        </div>
      )}

      {deleteModalOpen && jobToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <TrashIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Delete job</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Are you sure you want to delete this job? Jobs with applications will be archived.
                </p>
              </div>
            </div>
            <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Job</p>
              <p className="font-semibold text-slate-950">{jobToDelete.title}</p>
              <p className="text-sm text-slate-600">{jobToDelete.company}</p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={closeDeleteModal} className="btn-secondary w-full">
                Cancel
              </button>
              <button type="button" onClick={deleteJob} className="btn-danger w-full">
                Confirm delete
              </button>
            </div>
          </div>
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
