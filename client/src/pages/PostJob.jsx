import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PaperAirplaneIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import axios from "../utils/axios";
import { useEffect } from "react";
import { useToast } from "../components/Toast";
import { jobCategories } from "../data/categories";

const initialForm = {
  title: "",
  description: "",
  company: "",
  location: "",
  salaryMin: "",
  salaryMax: "",
  jobType: "Full-time",
  experience: "1-3 years",
  education: "Bachelor's",
  skills: "",
  openings: "1",
  workMode: "Hybrid",
  shift: "Day",
  benefits: "",
  department: "",
  category: "Engineering",
  urgentHiring: false,
  featured: false,
  closingDate: "",
};

export default function PostJob() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [hrProfile, setHrProfile] = useState(null);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);

  useEffect(() => {
    // Load draft if it exists and is less than 3 days old
    const savedDraft = localStorage.getItem("jobDraft");
    if (savedDraft) {
      try {
        const draftObj = JSON.parse(savedDraft);
        if (new Date().getTime() - draftObj.timestamp < 3 * 24 * 60 * 60 * 1000) {
          setForm(draftObj.form);
        } else {
          localStorage.removeItem("jobDraft");
        }
      } catch (e) {
        console.error("Error parsing draft", e);
      }
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get("/auth/me");
        setHrProfile(res.data);
        setForm((prev) => ({
          ...prev,
          company: prev.company || res.data.company || "",
          location: prev.location || res.data.location || "",
        }));
      } catch (err) {
        console.error("Could not fetch HR profile", err);
      }
    };
    fetchProfile();
  }, []);

  const isHRProfileComplete = Boolean(
    hrProfile?.company &&
    hrProfile?.about &&
    hrProfile?.location &&
    hrProfile?.email
  );

  const handleNavigateToHRProfile = () => {
    setShowIncompleteModal(false);
    navigate("/hr-profile");
  };

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveDraft = () => {
    const draftObj = {
      timestamp: new Date().getTime(),
      form,
    };
    localStorage.setItem("jobDraft", JSON.stringify(draftObj));
    addToast("Draft saved successfully", "success");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const salaryMin = Number(form.salaryMin || 0);
    const salaryMax = Number(form.salaryMax || salaryMin || 0);

    if (salaryMax < salaryMin) {
      addToast("Max salary cannot be less than Min salary", "error");
      return;
    }

    setLoading(true);
    try {
      const salaryMin = Number(form.salaryMin || 0);
      const salaryMax = Number(form.salaryMax || salaryMin || 0);
      await axios.post("/jobs", {
        ...form,
        salary: salaryMax || salaryMin,
        salaryMin,
        salaryMax,
        openings: Number(form.openings || 1),
        skills: form.skills,
        benefits: form.benefits,
      });
      addToast("Job posted successfully", "success");
      setForm(initialForm);
      navigate("/manage-jobs");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to post job", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrap">
      <form onSubmit={handleSubmit} className="panel overflow-hidden">
        <div className="border-b border-slate-200 bg-white p-6">
          <p className="label">New listing</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">Post a job</h2>
          <p className="muted mt-2">Create a complete listing with compensation, skills, benefits, and work model.</p>
        </div>

        <div className="grid gap-8 p-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <Section title="Role basics">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Job title"><input className="input" value={form.title} onChange={(e) => update("title", e.target.value)} required /></Field>
                <Field label="Company"><input className="input" value={form.company} onChange={(e) => update("company", e.target.value)} required /></Field>
                <Field label="Location"><input className="input" value={form.location} onChange={(e) => update("location", e.target.value)} required /></Field>
                <Field label="Department"><input className="input" value={form.department} onChange={(e) => update("department", e.target.value)} /></Field>
              </div>
            </Section>

            <Section title="Description">
              <textarea
                className="input min-h-40"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Describe responsibilities, team context, expectations, and impact."
                required
              />
            </Section>

            <Section title="Compensation and requirements">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Min Monthly Salary"><input type="number" className="input" value={form.salaryMin} onChange={(e) => update("salaryMin", e.target.value)} required /></Field>
                <Field label="Max Monthly Salary"><input type="number" className="input" value={form.salaryMax} onChange={(e) => update("salaryMax", e.target.value)} required /></Field>
                <Field label="Experience"><select className="input" value={form.experience} onChange={(e) => update("experience", e.target.value)}>{["0-1 years", "1-3 years", "3-5 years", "5+ years"].map((item) => <option key={item}>{item}</option>)}</select></Field>
                <Field label="Education"><select className="input" value={form.education} onChange={(e) => update("education", e.target.value)}>{["High School", "Bachelor's", "Master's", "PhD"].map((item) => <option key={item}>{item}</option>)}</select></Field>
                <Field label="Skills"><input className="input" value={form.skills} onChange={(e) => update("skills", e.target.value)} placeholder="React, Node.js, SQL" /></Field>
                <Field label="Benefits"><input className="input" value={form.benefits} onChange={(e) => update("benefits", e.target.value)} placeholder="Health insurance, ESOPs" /></Field>
              </div>
            </Section>
          </div>

          <aside className="space-y-5">
            <Section title="Publishing settings">
              <div className="space-y-4">
                <Field label="Category">
                  <select className="input" value={form.category} onChange={(e) => update("category", e.target.value)}>
                    {jobCategories.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Job type"><select className="input" value={form.jobType} onChange={(e) => update("jobType", e.target.value)}>{["Full-time", "Part-time", "Contract", "Internship"].map((item) => <option key={item}>{item}</option>)}</select></Field>
                <Field label="Work mode"><select className="input" value={form.workMode} onChange={(e) => update("workMode", e.target.value)}>{["Office", "Remote", "Hybrid"].map((item) => <option key={item}>{item}</option>)}</select></Field>
                <Field label="Shift"><select className="input" value={form.shift} onChange={(e) => update("shift", e.target.value)}>{["Day", "Night", "Flexible"].map((item) => <option key={item}>{item}</option>)}</select></Field>
                <Field label="Openings"><input type="number" min="1" className="input" value={form.openings} onChange={(e) => update("openings", e.target.value)} /></Field>
                <Field label="Closing date"><input type="date" className="input" value={form.closingDate} onChange={(e) => update("closingDate", e.target.value)} min={new Date().toISOString().split('T')[0]} /></Field>
                <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={form.urgentHiring} onChange={(e) => update("urgentHiring", e.target.checked)} />
                  Urgent hiring
                </label>
                <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} />
                  Featured listing
                </label>
              </div>
            </Section>

            <div className="space-y-3">
              <button
                type={isHRProfileComplete ? "submit" : "button"}
                onClick={(e) => {
                  if (!isHRProfileComplete) {
                    e.preventDefault();
                    setShowIncompleteModal(true);
                  }
                }}
                disabled={loading}
                className="btn-primary w-full"
                title={!isHRProfileComplete ? "Complete your profile to post jobs" : ""}
              >
                <PaperAirplaneIcon className="h-4 w-4" />
                {loading ? "Publishing..." : "Publish job"}
              </button>
              
              <button
                type="button"
                onClick={handleSaveDraft}
                className="btn-secondary w-full"
              >
                Save as Draft
              </button>
              <p className="text-xs text-center text-slate-500">Draft will be deleted in 3 days</p>
            </div>
          </aside>
        </div>
      </form>

      {showIncompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-amber-100">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-950">Incomplete Profile</h3>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              Complete your company profile before posting jobs. A complete profile builds trust and attracts better candidates.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowIncompleteModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={handleNavigateToHRProfile} className="btn-primary bg-amber-500 hover:bg-amber-600 border-transparent text-white">
                Complete Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h3>
      {children}
    </section>
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
