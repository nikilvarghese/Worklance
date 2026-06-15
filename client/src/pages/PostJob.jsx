import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PaperAirplaneIcon, ExclamationTriangleIcon, FolderIcon, TrashIcon } from "@heroicons/react/24/outline";
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
  skills: [],
  openings: "1",
  workMode: "Hybrid",
  shift: "Day",
  benefits: [],
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
  const [drafts, setDrafts] = useState([]);
  const [showDrafts, setShowDrafts] = useState(false);

  useEffect(() => {
    // Load drafts from localStorage and filter by age (less than 3 days)
    const savedDrafts = JSON.parse(localStorage.getItem("jobDrafts") || "[]");

    // Migrate old single draft if it exists
    const legacyDraft = localStorage.getItem("jobDraft");
    if (legacyDraft) {
      try {
        const parsedLegacy = JSON.parse(legacyDraft);
        if (parsedLegacy && parsedLegacy.form) {
          const newDraft = {
            id: `draft-${parsedLegacy.timestamp || Date.now()}`,
            timestamp: parsedLegacy.timestamp || Date.now(),
            title: parsedLegacy.form.title || "Legacy Draft",
            form: parsedLegacy.form,
          };
          savedDrafts.unshift(newDraft);
        }
      } catch (e) {
        console.error("Error migrating legacy draft", e);
      }
      localStorage.removeItem("jobDraft");
    }

    const activeDrafts = savedDrafts.filter(
      (d) => Date.now() - d.timestamp < 3 * 24 * 60 * 60 * 1000
    );
    setDrafts(activeDrafts);
    localStorage.setItem("jobDrafts", JSON.stringify(activeDrafts));

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

  const handleFormKeyDown = (e) => {
    if (e.key === "Enter" && e.target.tagName === "INPUT" && e.target.type !== "submit") {
      e.preventDefault();
    }
  };

  const handleSaveDraft = () => {
    const newDraft = {
      id: `draft-${Date.now()}`,
      timestamp: Date.now(),
      title: form.title || "Untitled Draft",
      form,
    };
    const updated = [newDraft, ...drafts];
    setDrafts(updated);
    localStorage.setItem("jobDrafts", JSON.stringify(updated));
    addToast("Draft saved successfully", "success");
  };

  const handleLoadDraft = (draft) => {
    const loadedForm = draft.form || {};
    setForm({
      ...initialForm,
      ...loadedForm,
      skills: Array.isArray(loadedForm.skills)
        ? loadedForm.skills
        : (loadedForm.skills ? loadedForm.skills.split(",").map((s) => s.trim()).filter(Boolean) : []),
      benefits: Array.isArray(loadedForm.benefits)
        ? loadedForm.benefits
        : (loadedForm.benefits ? loadedForm.benefits.split(",").map((s) => s.trim()).filter(Boolean) : []),
    });
    setShowDrafts(false);
    addToast("Draft loaded successfully", "success");
  };

  const handleDeleteDraft = (id) => {
    const updated = drafts.filter((d) => d.id !== id);
    setDrafts(updated);
    localStorage.setItem("jobDrafts", JSON.stringify(updated));
    addToast("Draft deleted", "success");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const salaryMin = Number(form.salaryMin || 0);
    const salaryMax = Number(form.salaryMax || salaryMin || 0);

    if (salaryMin < 0 || salaryMax < 0) {
      addToast("Salary values cannot be negative", "error");
      return;
    }

    if (salaryMax < salaryMin) {
      addToast("Max salary cannot be less than Min salary", "error");
      return;
    }

    setLoading(true);
    try {
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
      <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="panel overflow-hidden">
        <div className="border-b border-slate-200 bg-white p-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="label">New listing</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">Post a job</h2>
            <p className="muted mt-2">Create a complete listing with compensation, skills, benefits, and work model.</p>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDrafts((prev) => !prev)}
              className="btn-secondary flex items-center gap-2"
            >
              <FolderIcon className="h-4 w-4" />
              Draft Folder ({drafts.length})
            </button>

            {showDrafts && (
              <div className="absolute right-0 mt-2 z-10 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Saved Drafts</p>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {drafts.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No drafts saved</p>
                  ) : (
                    drafts.map((d) => (
                      <div key={d.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 p-2 hover:bg-slate-50">
                        <button
                          type="button"
                          onClick={() => handleLoadDraft(d)}
                          className="flex-1 min-w-0 text-left"
                        >
                          <p className="truncate text-sm font-semibold text-slate-950">{d.title || "Untitled Draft"}</p>
                          <p className="text-[10px] text-slate-400">{new Date(d.timestamp).toLocaleString("en-IN")}</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDraft(d.id)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
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
                <Field label="Min Monthly Salary"><input type="number" min="0" className="input" value={form.salaryMin} onChange={(e) => update("salaryMin", e.target.value)} required /></Field>
                <Field label="Max Monthly Salary"><input type="number" min="0" className="input" value={form.salaryMax} onChange={(e) => update("salaryMax", e.target.value)} required /></Field>
                <Field label="Experience"><select className="input" value={form.experience} onChange={(e) => update("experience", e.target.value)}>{["0-1 years", "1-3 years", "3-5 years", "5+ years"].map((item) => <option key={item}>{item}</option>)}</select></Field>
                <Field label="Education"><select className="input" value={form.education} onChange={(e) => update("education", e.target.value)}>{["High School", "Bachelor's", "Master's", "PhD"].map((item) => <option key={item}>{item}</option>)}</select></Field>
                <div className="sm:col-span-2 space-y-4">
                  <ChipInput label="Skills" value={form.skills || []} onChange={(val) => update("skills", val)} placeholder="Add skill and press Enter" />
                  <ChipInput label="Benefits" value={form.benefits || []} onChange={(val) => update("benefits", val)} placeholder="Add benefit and press Enter" />
                </div>
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

function ChipInput({ label, value = [], onChange, placeholder }) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) {
        onChange([...value, inputValue.trim()]);
        setInputValue("");
      }
    }
  };

  const removeChip = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <label className="block">
      <span className="label mb-1 block">{label}</span>
      <div className="flex flex-wrap gap-2 p-2 border border-slate-300 rounded-lg bg-white">
        {value.map((chip, index) => (
          <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
            {chip}
            <button type="button" onClick={() => removeChip(index)} className="text-indigo-600 hover:text-indigo-800">×</button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 min-w-0 outline-none bg-transparent"
        />
      </div>
    </label>
  );
}
