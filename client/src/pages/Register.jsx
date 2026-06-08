import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import axios from "../utils/axios";
import { AuthFrame } from "./UserLogin";
import PasswordInput from "../components/PasswordInput";

const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

const validatePassword = (password) =>
  typeof password === "string" &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /\d/.test(password) &&
  password.length >= 8;

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user",
    company: "",
  });
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [pendingAuth, setPendingAuth] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    company: false,
  });

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isFormValid =
    form.firstName.trim() !== "" &&
    form.lastName.trim() !== "" &&
    form.email.trim() !== "" &&
    validatePassword(form.password) &&
    (form.role !== "hr" || form.company.trim() !== "");

  const passChecks = {
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /\d/.test(form.password),
  };

  const [pendingChange, setPendingChange] = useState(null);

  const handleFieldChange = (field, value, cleaningFn) => {
    const finalVal = cleaningFn ? cleaningFn(value) : value;
    
    if (isOtpSent) {
      if (form[field] === finalVal) return;
      setPendingChange({ field, value: finalVal });
    } else {
      setForm((prev) => ({ ...prev, [field]: finalVal }));
      if (field === "email") {
        setIsOtpSent(false);
        setIsOtpVerified(false);
        setPendingAuth(null);
      }
    }
  };

  const confirmChange = () => {
    if (!pendingChange) return;
    const { field, value } = pendingChange;
    
    setIsOtpSent(false);
    setIsOtpVerified(false);
    setOtp("");
    setPendingAuth(null);
    
    setForm((prev) => ({ ...prev, [field]: value }));
    setPendingChange(null);
  };

  const cancelChange = () => {
    setPendingChange(null);
  };

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const resetMessages = () => {
    setMessage("");
    setMessageType("info");
  };

  const sendOtp = async () => {
    resetMessages();
    if (!validateEmail(form.email)) {
      setMessage("Enter a valid Gmail address.");
      setMessageType("error");
      return;
    }
    setLoadingSend(true);

    try {
      const response = await axios.post("/auth/otp/request-register", {
        ...form,
        name: `${form.firstName} ${form.lastName}`.trim(),
      });
      if (response.data?.success === false) {
        setMessage(response.data.message || "Unable to send OTP.");
        setMessageType("error");
      } else {
        setIsOtpSent(true);
        setMessage(response.data.message || "OTP sent to your email.");
        setMessageType("success");
        setCooldown(response.data.resendCooldown || 45);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send OTP.");
      setMessageType("error");
    } finally {
      setLoadingSend(false);
    }
  };

  const verifyOtp = async () => {
    resetMessages();
    if (!otp || otp.length !== 6) {
      setMessage("Enter the 6-digit OTP.");
      setMessageType("error");
      return;
    }
    setLoadingVerify(true);

    try {
      const response = await axios.post("/auth/otp/verify-register", {
        email: form.email,
        otp,
        role: form.role,
      });

      if (response.data?.success === false) {
        setMessage(response.data.message || "OTP verification failed.");
        setMessageType("error");
      } else {
        setIsOtpVerified(true);
        setPendingAuth(response.data);
        setMessage("OTP verified. You may now create your account.");
        setMessageType("success");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to verify OTP.");
      setMessageType("error");
    } finally {
      setLoadingVerify(false);
    }
  };

  const createAccount = () => {
    if (!isOtpVerified || !pendingAuth) return;
    localStorage.clear();
    localStorage.setItem("token", pendingAuth.token);
    localStorage.setItem("role", pendingAuth.user.role);
    navigate(pendingAuth.user.role === "hr" ? "/hr-dashboard" : "/dashboard");
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "ACCOUNT_EXISTS") {
      setMessage("Account already exists. Please sign in.");
      setMessageType("error");
    }
  }, []);

 const handleGoogleSignup = () => {
  window.location.href = `${process.env.REACT_APP_API_URL}/auth/google?role=${form.role}&action=register`;
};

  return (
    <AuthFrame
      eyebrow="Create workspace"
      title="Start with the right role and grow from there."
      summary="Choose candidate or employer access. Each role gets its own navigation, dashboard, data, and workflow."
    >
      <div className="flex flex-col gap-5">
        {message && (
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium border ${messageType === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5 rounded-2xl bg-slate-100/80 p-1.5 border border-slate-200/50">
          {[
            ["user", "Job seeker"],
            ["hr", "Employer"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm({ ...form, role: value })}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                form.role === value
                  ? "bg-white text-blue-600 shadow-md shadow-blue-500/5 border border-blue-500/10 scale-[1.01]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/40 border border-transparent"
              }`}
            >
              {value === "user" ? (
                <svg className="w-4 h-4 shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">First name</label>
            <input
              placeholder="First name"
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-4 ${
                touched.firstName && form.firstName.trim() === ""
                  ? "border-rose-300 bg-rose-50/10 focus:border-rose-500 focus:ring-rose-500/10"
                  : "border-slate-200 bg-slate-50 focus:border-indigo-500 focus:bg-white focus:ring-indigo-500/10"
              }`}
              value={form.firstName}
              onChange={(e) => handleFieldChange("firstName", e.target.value, (val) => val.replace(/[^a-zA-Z]/g, "").slice(0, 15))}
              onBlur={() => handleBlur("firstName")}
              required
            />
            {touched.firstName && form.firstName.trim() === "" && (
              <p className="text-xs text-rose-600 font-medium">First name is required. Please fill it.</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Last name</label>
            <input
              placeholder="Last name"
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-4 ${
                touched.lastName && form.lastName.trim() === ""
                  ? "border-rose-300 bg-rose-50/10 focus:border-rose-500 focus:ring-rose-500/10"
                  : "border-slate-200 bg-slate-50 focus:border-indigo-500 focus:bg-white focus:ring-indigo-500/10"
              }`}
              value={form.lastName}
              onChange={(e) => handleFieldChange("lastName", e.target.value, (val) => val.replace(/[^a-zA-Z]/g, "").slice(0, 15))}
              onBlur={() => handleBlur("lastName")}
              required
            />
            {touched.lastName && form.lastName.trim() === "" && (
              <p className="text-xs text-rose-600 font-medium">Last name is required. Please fill it.</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Email address</label>
          <div className="flex gap-3">
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              placeholder="name@example.com"
              className={`flex-1 w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-4 ${
                touched.email && form.email.trim() === ""
                  ? "border-rose-300 bg-rose-50/10 focus:border-rose-500 focus:ring-rose-500/10"
                  : "border-slate-200 bg-slate-50 focus:border-indigo-500 focus:bg-white focus:ring-indigo-500/10"
              }`}
            />
            <button
              type="button"
              onClick={sendOtp}
              disabled={loadingSend || cooldown > 0 || !isFormValid}
              className="w-[120px] shrink-0 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-indigo-600 disabled:text-white/80 disabled:border-none"
            >
              {loadingSend ? "Sending..." : cooldown > 0 ? `Resend ${cooldown}s` : "Send OTP"}
            </button>
          </div>
          {touched.email && form.email.trim() === "" && (
            <p className="text-xs text-rose-600 font-medium">Email address is required. Please fill it.</p>
          )}
          {!isFormValid && (
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 font-medium transition-all duration-300">
              <svg className="w-3.5 h-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Complete all required fields to enable OTP.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Verification code</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              className="flex-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm tracking-widest outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
            <button
              type="button"
              onClick={verifyOtp}
              disabled={!isOtpSent || loadingVerify}
              className="w-[120px] shrink-0 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-slate-900 disabled:text-white/80 disabled:border-none"
            >
              {loadingVerify ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        </div>

        <div className={`grid gap-4 ${form.role === "hr" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <PasswordInput
              value={form.password}
              onChange={(e) => handleFieldChange("password", e.target.value)}
              onBlur={() => handleBlur("password")}
              placeholder="••••••••"
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-4 ${
                touched.password && form.password.trim() === ""
                  ? "border-rose-300 bg-rose-50/10 focus:border-rose-500 focus:ring-rose-500/10"
                  : "border-slate-200 bg-slate-50 focus:border-indigo-500 focus:bg-white focus:ring-indigo-500/10"
              }`}
            />
            {touched.password && form.password.trim() === "" && (
              <p className="text-xs text-rose-600 font-medium">Password is required. Please fill it.</p>
            )}
            <div className="mt-2.5 space-y-1.5 bg-slate-50/60 p-3 rounded-xl border border-slate-200/50">
              <p className="text-xs font-semibold text-slate-500 mb-1">Password must contain:</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {[
                  [passChecks.length, "Min 8 characters"],
                  [passChecks.upper, "One uppercase letter"],
                  [passChecks.lower, "One lowercase letter"],
                  [passChecks.number, "One number"],
                ].map(([isValid, label], idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs transition-all duration-300">
                    {isValid ? (
                      <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <span className={isValid ? "text-emerald-700 font-medium" : "text-slate-500"}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {form.role === "hr" && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Company name</label>
              <input
                placeholder="e.g. Acme Corp"
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-4 ${
                  touched.company && form.company.trim() === ""
                    ? "border-rose-300 bg-rose-50/10 focus:border-rose-500 focus:ring-rose-500/10"
                    : "border-slate-200 bg-slate-50 focus:border-indigo-500 focus:bg-white focus:ring-indigo-500/10"
                }`}
                value={form.company}
                onChange={(e) => handleFieldChange("company", e.target.value)}
                onBlur={() => handleBlur("company")}
              />
              {touched.company && form.company.trim() === "" && (
                <p className="text-xs text-rose-600 font-medium">Company name is required. Please fill it.</p>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={!isOtpVerified}
          onClick={createAccount}
          className="mt-2 w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:bg-blue-800 hover:shadow-lg hover:shadow-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-blue-600 disabled:text-white/80 disabled:shadow-none"
        >
          <div className="flex items-center justify-center gap-2">
            <UserPlusIcon className="h-5 w-5" />
            Create account
          </div>
        </button>

        <div className="mt-2 flex items-center justify-center gap-4">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-sm font-medium text-slate-400 whitespace-nowrap">or continue with</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="mt-2 flex justify-center">
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-100"
            aria-label="Continue with Google"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.954 12.242c0-.816-.073-1.602-.209-2.362H12.24v4.467h6.448c-.278 1.48-1.106 2.73-2.356 3.57v2.965h3.808c2.238-2.064 3.518-5.09 3.518-8.64z" fill="#4285F4" />
              <path d="M12.24 24c3.24 0 5.957-1.076 7.944-2.924l-3.808-2.964c-1.06.713-2.415 1.13-4.136 1.13-3.183 0-5.885-2.15-6.848-5.041H1.551v3.164C3.503 21.678 7.602 24 12.24 24z" fill="#34A853" />
              <path d="M5.392 14.2a7.21 7.21 0 0 1 0-4.405V6.63H1.551a11.98 11.98 0 0 0 0 10.74l3.841-3.17z" fill="#FBBC05" />
              <path d="M12.24 4.797c1.75 0 3.31.604 4.545 1.79l3.41-3.41C18.192 1.295 15.48 0 12.24 0 7.602 0 3.503 2.322 1.551 5.63l3.841 3.164C6.355 6.945 9.057 4.797 12.24 4.797z" fill="#EA4335" />
            </svg>
            Google
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-slate-600">
          Already registered? <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">Sign in</Link>
        </p>
      </div>

      {pendingChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col gap-4 transform transition-all scale-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
              <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Change Registration Details?</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Modifying this detail will invalidate your current OTP. You will need to request and verify a new OTP to complete your registration.
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={cancelChange}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300"
              >
                No, keep
              </button>
              <button
                type="button"
                onClick={confirmChange}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20"
              >
                Yes, change
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthFrame>
  );
}
