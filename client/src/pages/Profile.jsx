import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  DocumentArrowUpIcon,
  LinkIcon,
  PencilSquareIcon,
  TrashIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import axios from "../utils/axios";
import cities from "../data/cities.json";
import { useToast } from "../components/Toast";
import DeleteAccountModal from "../components/DeleteAccountModal";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { initials } from "../utils/format";

const educationOptions = ["10th", "12th", "Diploma", "Bachelor", "Master", "PhD"];

/**
 * Reusable Chip Input for Skills, Languages, etc.
 */
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

export default function Profile() {
  const { addToast } = useToast();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  // Memoized State List
  const states = useMemo(
    () => [...new Set(cities.map((item) => item.state?.trim()).filter(Boolean))].sort(),
    []
  );

  // Memoized City List based on selected State
  const selectedCities = useMemo(() => {
    const selectedState = (formData.state || "").trim().toLowerCase();
    return [
      ...new Set(
        cities
          .filter((item) => item.state?.trim().toLowerCase() === selectedState)
          .map((item) => item.city || item.name)
          .filter(Boolean)
      ),
    ].sort();
  }, [formData.state]);

  const loadProfile = useCallback(async () => {
    try {
      const res = await axios.get("/auth/profile");
      const profile = res.data;
      setUser(profile);
      setFormData({
        ...profile,
        skills: profile.skills || [],
        languages: profile.languages || [],
        preferredRoles: profile.preferredRoles || [],
        specializationList: profile.specialization ? profile.specialization.split(",").map((item) => item.trim()).filter(Boolean) : [],
        portfolio: profile.portfolio
          ? profile.portfolio.split(",").map((item) => item.trim()).filter(Boolean)
          : [],
      });
    } catch (err) {
      addToast("Could not load profile", "error");
    }
  }, [addToast]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const completion = useMemo(() => {
    const data = user || {};
    const fields = [
      data.name,
      data.headline,
      data.dob,
      data.state,
      data.city,
      data.pincode,
      data.education,
      data.skills?.length,
      data.languages?.length,
      data.preferredRoles?.length,
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [user]);

  const updateField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "state" ? { city: "" } : {}),
    }));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      const fields = {
        ...formData,
        specialization: (formData.specializationList || []).join(","),
      };

      Object.entries(fields).forEach(([key, value]) => {
        if (key === "specializationList" || value === undefined || value === null || value === "") return;
        if (Array.isArray(value)) {
          payload.append(key, value.join(","));
        } else {
          payload.append(key, value);
        }
      });

      const res = await axios.put("/auth/profile", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data);
      setEditing(false);
      addToast("Profile updated", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Could not save profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async (password) => {
    if (!password) return;
    setIsDeleting(true);
    try {
      await axios.delete("/auth/delete", { data: { password } });
      localStorage.clear();
      window.location.href = "/login";
    } catch (err) {
      addToast(err.response?.data?.message || "Could not delete account", "error");
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="page-wrap">
        <div className="panel h-96 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="page-wrap space-y-6">
      {/* Header Section */}
      <section className="panel overflow-hidden">
        <div className="bg-slate-950 p-6 text-white">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white text-xl font-bold text-slate-950">
                {initials(user.name)}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="mt-1 text-slate-300">{user.headline || "Open to new opportunities"}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="btn-secondary border-white/15 bg-white/10 text-white hover:bg-white/15"
            >
              <PencilSquareIcon className="h-4 w-4" />
              Edit profile
            </button>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
          {/* Sidebar */}
          <aside className="border-b border-slate-200 bg-slate-50 p-6 lg:border-b-0 lg:border-r">
            <p className="label">Profile completion</p>
            <div className="mt-3 h-3 rounded-full bg-slate-200">
              <div className="h-3 rounded-full bg-teal-500" style={{ width: `${completion}%` }} />
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-700">{completion}% complete</p>

            <div className="mt-6 space-y-4 text-sm">
              <Info label="Email" value={user.email} />
              <Info label="Phone" value={user.phone || "Not added"} />
              <Info label="Location" value={[user.city, user.state].filter(Boolean).join(", ") || "Not added"} />
              <Info label="Experience" value={user.experienceLevel || "Not added"} />
              <Info label="Education" value={user.education || "Not added"} />
            </div>

            {user.resume && (
              <a
                href={`${process.env.REACT_APP_API_ORIGIN || "http://localhost:5000"}/uploads/${user.resume}`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary mt-6 w-full"
              >
                <DocumentArrowUpIcon className="h-4 w-4" />
                View resume
              </a>
            )}
          </aside>

          {/* Main Profile Details */}
          <div className="space-y-6 p-6">
            <Block title="Skills" items={user.skills} empty="No skills added" />
            <Block title="Preferred roles" items={user.preferredRoles} empty="No preferred roles added" />
            <Block title="Languages" items={user.languages} empty="No languages added" />

            <div className="grid gap-4 sm:grid-cols-2">
              <Block title="Portfolio" items={user.portfolio ? user.portfolio.split(",") : []} empty="No portfolio added" />
              <Info label="Desired salary" value={user.desiredSalary ? `INR ${Number(user.desiredSalary).toLocaleString("en-IN")}` : "Not added"} />
            </div>

            {/* Account Management Section (Outside Edit Modal) */}
            <div className="flex flex-wrap gap-4 pt-6 mt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setChangePasswordModalOpen(true)}
                className="btn-secondary"
              >
                <KeyIcon className="h-4 w-4" />
                Reset password
              </button>

              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="btn-danger"
              >
                <TrashIcon className="h-4 w-4" />
                Delete account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Edit Profile Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <form onSubmit={saveProfile} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label">Profile settings</p>
                <h3 className="mt-1 text-xl font-bold text-slate-950">Edit candidate profile</h3>
              </div>
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Name"><input className="input" value={formData.name || ""} onChange={(e) => updateField("name", e.target.value)} required /></Field>
              <Field label="Headline"><input className="input" value={formData.headline || ""} onChange={(e) => updateField("headline", e.target.value)} /></Field>
              <Field label="Phone"><input className="input" value={formData.phone || ""} onChange={(e) => updateField("phone", e.target.value)} /></Field>
              <Field label="Date of birth"><input type="date" className="input" value={formData.dob || ""} onChange={(e) => updateField("dob", e.target.value)} required /></Field>
              <Field label="State">
                <select className="input" value={formData.state || ""} onChange={(e) => updateField("state", e.target.value)} required>
                  <option value="">Select state</option>
                  {states.map((state) => <option key={state}>{state}</option>)}
                </select>
              </Field>
              <Field label="City">
                <select className="input" value={formData.city || ""} onChange={(e) => updateField("city", e.target.value)} required>
                  <option value="">Select city</option>
                  {selectedCities.map((city) => <option key={city}>{city}</option>)}
                </select>
              </Field>
              <Field label="Pincode"><input className="input" value={formData.pincode || ""} onChange={(e) => updateField("pincode", e.target.value)} required /></Field>
              <Field label="Education">
                <select className="input" value={formData.education || ""} onChange={(e) => updateField("education", e.target.value)} required>
                  <option value="">Select education</option>
                  {educationOptions.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Specialization"><ChipInput value={formData.specializationList || []} onChange={(value) => updateField("specializationList", value)} placeholder="Add specialization" /></Field>
              <Field label="Experience level"><input className="input" value={formData.experienceLevel || ""} onChange={(e) => updateField("experienceLevel", e.target.value)} /></Field>
              <Field label="Desired salary"><input type="number" className="input" value={formData.desiredSalary || ""} onChange={(e) => updateField("desiredSalary", e.target.value)} /></Field>
              <Field label="Portfolio"><ChipInput value={formData.portfolio || []} onChange={(value) => updateField("portfolio", value)} placeholder="Add portfolio link and press Enter" /></Field>
              <Field label="Skills"><ChipInput value={formData.skills || []} onChange={(value) => updateField("skills", value)} placeholder="Add skill" /></Field>
              <Field label="Preferred roles"><ChipInput value={formData.preferredRoles || []} onChange={(value) => updateField("preferredRoles", value)} placeholder="Add preferred role" /></Field>
              <Field label="Languages"><ChipInput value={formData.languages || []} onChange={(value) => updateField("languages", value)} placeholder="Add language" /></Field>
              <Field label="Resume">
                <input
                  type="file"
                  className="input"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={(e) => updateField("resume", e.target.files[0])}
                />
              </Field>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save profile"}</button>
            </div>
          </form>
        </div>
      )}

      {/* Modals */}
      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={deleteAccount}
        isDeleting={isDeleting}
      />

      <ChangePasswordModal
        isOpen={changePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
      />
    </div>
  );
}

/**
 * UI Components
 */
function Field({ label, children }) {
  return (
    <label className="block">
      <span className="label mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function Info({ label, value, icon: Icon }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function Block({ title, items = [], empty }) {
  return (
    <section>
      <h3 className="section-title text-lg font-bold text-slate-800">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {items?.length ? (
          items.map((item) => (
            <span key={item} className="badge border border-indigo-200 bg-indigo-50 px-3 py-1 rounded-full text-indigo-700 text-sm">
              {item}
            </span>
          ))
        ) : (
          <p className="text-sm text-slate-500">{empty}</p>
        )}
      </div>
    </section>
  );
}