import { useCallback, useEffect, useRef, useState } from "react";
import { BuildingOffice2Icon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import axios from "../utils/axios";
import { useToast } from "../components/Toast";
import DeleteAccountModal from "../components/DeleteAccountModal";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { initials } from "../utils/format";
import IntlTelInput from "@intl-tel-input/react";
import "intl-tel-input/styles";

const getPhoneErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 0:
    case "INVALID_COUNTRY_CODE":
      return "The country code is invalid.";
    case 1:
    case "TOO_SHORT":
      return "The phone number is too short.";
    case 2:
    case "TOO_LONG":
      return "The phone number is too long.";
    case 3:
    case "INVALID_LENGTH":
      return "The phone number has an invalid length.";
    default:
      return "Please enter a valid phone number.";
  }
};

export default function HrProfile() {
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const phoneInputRef = useRef(null);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const res = await axios.get("/auth/me");
      setProfile(res.data);
      setForm(res.data);
    } catch (err) {
      addToast("Could not load employer profile", "error");
    }
  }, [addToast]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (!editing) {
      setPhoneTouched(false);
      setErrors({});
    }
  }, [editing]);

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

  const openDeleteModal = () => {
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const validateForm = () => {
    const newErrors = {};

    // 📞 Phone validation
    if (form.phone) {
      const itiInstance = phoneInputRef.current?.getInstance();
      if (itiInstance && !itiInstance.isValidNumber()) {
        const errCode = itiInstance.getValidationError();
        newErrors.phone = getPhoneErrorMessage(errCode);
      }
    }

    // 🌐 Website validation
    if (form.website) {
      const urlPattern = /^(https?:\/\/)[^\s$.?#].[^\s]*$/;
      if (!urlPattern.test(form.website)) {
        newErrors.website = "Enter a valid website link (https://...)";
      }
    }

    setErrors(newErrors);
    setPhoneTouched(true);
    return Object.keys(newErrors).length === 0;
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; //
    setSaving(true);
    try {
      const res = await axios.put("/auth/me", form);
      setProfile(res.data);
      setEditing(false);
      addToast("Employer profile updated", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Could not save profile", "error");
    } finally {
      setSaving(false);
    }
  };


  if (!profile) {
    return (
      <div className="page-wrap">
        <div className="panel h-96 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="page-wrap space-y-6">
      <section className="panel overflow-hidden">
        <div className="bg-slate-950 p-6 text-white">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white text-xl font-bold text-slate-950">
                {initials(profile.company || profile.name)}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{profile.company || "Company profile"}</h2>
                <p className="mt-1 text-slate-300">{profile.name} · {profile.designation}</p>
              </div>
            </div>
            <button type="button" onClick={() => setEditing(true)} className="btn-secondary border-white/15 bg-white/10 text-white hover:bg-white/15">
              <PencilSquareIcon className="h-4 w-4" />
              Edit profile
            </button>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
          <aside className="border-b border-slate-200 bg-slate-50 p-6 lg:border-b-0 lg:border-r">
            <BuildingOffice2Icon className="h-8 w-8 text-indigo-600" />
            <div className="mt-5 space-y-4">
              <Info label="Email" value={profile.email} />
              <Info label="Phone" value={profile.phone || "Not added"} />
              <Info label="Location" value={profile.location || "Not added"} />
              <Info label="Website" value={profile.website || "Not added"} />
            </div>
          </aside>
          <div className="space-y-5 p-6">
            <Info label="Industry" value={profile.industry || "Not added"} />
            <Info label="Team size" value={profile.teamSize || "Not added"} />
            <div className="rounded-lg border border-slate-100 bg-white p-4">
              <p className="label">About</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{profile.about || "Add a company description to help candidates understand your team."}</p>
            </div>
            <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setChangePasswordModalOpen(true)} className="btn-secondary">
                Reset password
              </button>
              <button type="button" onClick={openDeleteModal} className="btn-danger">
                <TrashIcon className="h-4 w-4" />
                Delete account
              </button>
            </div>
          </div>
        </div>
      </section>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <form onSubmit={saveProfile} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label">Employer settings</p>
                <h3 className="mt-1 text-xl font-bold text-slate-950">Edit company profile</h3>
              </div>
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Name *"><input className="input" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
              <Field label="Company *"><input className="input" value={form.company || ""} onChange={(e) => setForm({ ...form, company: e.target.value })} required /></Field>
              <Field label="Designation *"><input className="input" value={form.designation || ""} onChange={(e) => setForm({ ...form, designation: e.target.value })} required /></Field>
              <Field label="Phone">
                <IntlTelInput
                  ref={phoneInputRef}
                  value={form.phone || ""}
                  onChangeNumber={(val) => {
                    setForm({ ...form, phone: val });
                    if (!val) {
                      setErrors((prev) => ({ ...prev, phone: "" }));
                    } else {
                      const itiInstance = phoneInputRef.current?.getInstance();
                      if (itiInstance) {
                        const isValid = itiInstance.isValidNumber();
                        if (isValid) {
                          setErrors((prev) => ({ ...prev, phone: "" }));
                        } else if (phoneTouched) {
                          const errCode = itiInstance.getValidationError();
                          setErrors((prev) => ({ ...prev, phone: getPhoneErrorMessage(errCode) }));
                        }
                      }
                    }
                  }}
                  initialCountry="in"
                  loadUtils={() => import("intl-tel-input/utils")}
                  containerClass="w-full"
                  inputProps={{
                    className: "input",
                    placeholder: "Enter phone number",
                    onBlur: () => {
                      setPhoneTouched(true);
                      const itiInstance = phoneInputRef.current?.getInstance();
                      if (itiInstance && form.phone) {
                        const isValid = itiInstance.isValidNumber();
                        if (!isValid) {
                          const errCode = itiInstance.getValidationError();
                          setErrors((prev) => ({ ...prev, phone: getPhoneErrorMessage(errCode) }));
                        } else {
                          setErrors((prev) => ({ ...prev, phone: "" }));
                        }
                      }
                    },
                    onPaste: () => {
                      setPhoneTouched(true);
                      setTimeout(() => {
                        const itiInstance = phoneInputRef.current?.getInstance();
                        const currentVal = phoneInputRef.current?.getInput()?.value || "";
                        if (itiInstance && currentVal) {
                          const isValid = itiInstance.isValidNumber();
                          if (!isValid) {
                            const errCode = itiInstance.getValidationError();
                            setErrors((prev) => ({ ...prev, phone: getPhoneErrorMessage(errCode) }));
                          } else {
                            setErrors((prev) => ({ ...prev, phone: "" }));
                          }
                        }
                      }, 50);
                    }
                  }}
                />
                {errors.phone && (
                  <p className="text-sm text-rose-600 mt-1">{errors.phone}</p>
                )}
              </Field>
              <Field label="Website">
  <input
    type="text"
    className="input"
    value={form.website || ""}
    onChange={(e) => setForm({ ...form, website: e.target.value })}
    placeholder="https://example.com"
  />
  {errors.website && (
    <p className="text-sm text-rose-600 mt-1">{errors.website}</p>
  )}
</Field>
              <Field label="Location *"><input className="input" value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></Field>
              <Field label="Industry *"><input className="input" value={form.industry || ""} onChange={(e) => setForm({ ...form, industry: e.target.value })} required /></Field>
              <Field label="Team size">
  <input
    type="number"
    className="input"
    value={form.teamSize || ""}
    onChange={(e) => setForm({ ...form, teamSize: e.target.value })}
    min={1}
    placeholder="e.g. 50"
  />
</Field>
            </div>
            <Field label="About"><textarea className="input mt-1 min-h-32" value={form.about || ""} onChange={(e) => setForm({ ...form, about: e.target.value })} /></Field>


            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save profile"}</button>
            </div>
          </form>
        </div>
      )}

      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
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

function Field({ label, children }) {
  return (
    <label className="mt-4 block">
      <span className="label mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-4">
      <p className="label">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}
