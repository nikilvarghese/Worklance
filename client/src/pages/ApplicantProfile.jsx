import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import axios from "../utils/axios";
import { useToast } from "../components/Toast";
import { formatDate, formatSalary, pipelineStatuses, statusStyles } from "../utils/format";

export default function ApplicantProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    interviewDate: "",
    interviewTime: "",
    contactInfo: "",
    description: "",
  });

  const fetchApplicant = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/applications/${id}`);
      setApplication(res.data);
    } catch (err) {
      addToast("Could not load applicant", "error");
      navigate("/applicants");
    } finally {
      setLoading(false);
    }
  }, [addToast, id, navigate]);

  useEffect(() => {
    fetchApplicant();
  }, [fetchApplicant]);

  const openInterview = () => {
    setInterviewForm({
      interviewDate: application?.interviewDate || "",
      interviewTime: application?.interviewTime || "",
      contactInfo: application?.contactInfo || "",
      description: application?.description || "",
    });
    setShowInterviewModal(true);
  };

  const submitInterview = (e) => {
    e.preventDefault();
    const now = new Date();
    const interviewDateTime = new Date(`${interviewForm.interviewDate}T${interviewForm.interviewTime}`);
    const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    if (interviewDateTime < threeHoursFromNow) {
      addToast("Interview must be scheduled at least 3 hours in the future", "error");
      return;
    }

    updateStatus("Interview", interviewForm);
    setShowInterviewModal(false);
  };

  const updateStatus = async (status, extra = {}) => {
    try {
      await axios.put(`/applications/${id}/status`, { status, ...extra });
      addToast(`Moved to ${status}`, "success");
      fetchApplicant();
    } catch (err) {
      addToast("Could not update status", "error");
    }
  };

  if (loading || !application) {
    return (
      <div className="page-wrap">
        <div className="panel h-96 animate-pulse" />
      </div>
    );
  }

  const applicant = application.userId || {};
  const job = application.jobId || {};

  return (
    <div className="page-wrap space-y-6">
      <button type="button" onClick={() => navigate("/applicants")} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">
        <ArrowLeftIcon className="h-4 w-4" />
        Back to applicants
      </button>

      <section className="panel overflow-hidden">
        <div className="bg-slate-950 p-6 text-white">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div>
              <span className={`badge ${statusStyles[application.status]}`}>{application.status}</span>
              <h2 className="mt-4 text-3xl font-bold">{applicant.name}</h2>
              <p className="mt-2 text-slate-300">{applicant.headline || "Candidate profile"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {pipelineStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    if (status === "Interview") {
                      openInterview();
                    } else {
                      updateStatus(status);
                    }
                  }}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    application.status === status ? "bg-white text-slate-950" : "border border-white/15 bg-white/10 text-white hover:bg-white/15"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6 p-6">
            <section>
              <h3 className="section-title">Candidate details</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Info icon={EnvelopeIcon} label="Email" value={applicant.email} />
                <Info icon={PhoneIcon} label="Phone" value={applicant.phone || "Not added"} />
                <Info icon={MapPinIcon} label="Location" value={[applicant.city, applicant.state, applicant.pincode].filter(Boolean).join(", ") || "Not added"} />
                <Info label="Experience" value={applicant.experienceLevel || "Not added"} />
                <Info label="Education" value={[applicant.education, applicant.specialization].filter(Boolean).join(" - ") || "Not added"} />
                <Info label="Desired salary" value={applicant.desiredSalary ? `INR ${Number(applicant.desiredSalary).toLocaleString("en-IN")}` : "Not added"} />
              </div>
            </section>

            <Block title="Skills" items={applicant.skills} empty="No skills added" />
            <Block title="Preferred roles" items={applicant.preferredRoles} empty="No preferred roles added" />
            <Block title="Languages" items={applicant.languages} empty="No languages added" />

            <section className="rounded-lg bg-slate-50 p-5">
              <h3 className="section-title">Cover note</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{application.coverLetter || "No cover note submitted."}</p>
            </section>
          </div>

          <aside className="border-t border-slate-200 bg-slate-50 p-6 lg:border-l lg:border-t-0">
            <h3 className="section-title">Applied role</h3>
            <div className="mt-4 rounded-lg bg-white p-4">
              <p className="font-semibold text-slate-950">{job.title}</p>
              <p className="mt-1 text-sm text-slate-500">{job.company} · {job.location}</p>
              <p className="mt-3 text-sm font-semibold text-slate-950">{formatSalary(job)}</p>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <Info icon={BriefcaseIcon} label="Applied" value={formatDate(application.createdAt)} />
              <Info label="Expected salary" value={application.expectedSalary ? `INR ${Number(application.expectedSalary).toLocaleString("en-IN")}` : "Not specified"} />
              <Info label="Availability" value={application.availability || "Not specified"} />
              <Info label="Interview" value={application.interviewDate ? `${application.interviewDate} ${application.interviewTime || ""}` : "Not scheduled"} />
            </div>

            {applicant.resume && (
              <a
                href={`${process.env.REACT_APP_API_URL.replace('/api','')}/uploads/${applicant.resume}`}
                target="_blank"
                rel="noreferrer"
                className="btn-primary mt-5 w-full"
              >
                <DocumentTextIcon className="h-4 w-4" />
                View resume
              </a>
            )}
          </aside>
        </div>
      </section>

      {showInterviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <form onSubmit={submitInterview} className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label">Interview</p>
                <h3 className="mt-1 text-xl font-bold text-slate-950">{applicant.name}</h3>
              </div>
              <button type="button" onClick={() => setShowInterviewModal(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Date"><input type="date" className="input" value={interviewForm.interviewDate} onChange={(e) => setInterviewForm({ ...interviewForm, interviewDate: e.target.value })} min={new Date().toISOString().split('T')[0]} required /></Field>
              <Field label="Time"><input type="time" className="input" value={interviewForm.interviewTime} onChange={(e) => setInterviewForm({ ...interviewForm, interviewTime: e.target.value })} required /></Field>
              <Field label="Contact link or phone"><input className="input" value={interviewForm.contactInfo} onChange={(e) => setInterviewForm({ ...interviewForm, contactInfo: e.target.value })} /></Field>
              <Field label="Notes"><input className="input" value={interviewForm.description} onChange={(e) => setInterviewForm({ ...interviewForm, description: e.target.value })} /></Field>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowInterviewModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Schedule interview</button>
            </div>
          </form>
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

function Info({ icon: Icon, label, value }) {
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
      <h3 className="section-title">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {items?.length ? (
          items.map((item) => <span key={item} className="badge border-indigo-200 bg-indigo-50 text-indigo-700">{item}</span>)
        ) : (
          <p className="text-sm text-slate-500">{empty}</p>
        )}
      </div>
    </section>
  );
}
