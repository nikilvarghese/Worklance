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

  const isFormValid =
    form.firstName.trim() !== "" &&
    form.lastName.trim() !== "" &&
    form.email.trim() !== "" &&
    validatePassword(form.password) &&
    (form.role !== "hr" || form.company.trim() !== "");

  const handlePasswordChange = (newVal) => {
    if (isOtpSent) {
      const confirmChange = window.confirm(
        "Do you want to change your password? If yes, your sent OTP will no longer be valid and you will need to generate a new OTP."
      );
      if (!confirmChange) {
        return;
      }
      setIsOtpSent(false);
      setIsOtpVerified(false);
      setOtp("");
      setPendingAuth(null);
    }
    setForm((prev) => ({ ...prev, password: newVal }));
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

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          {[
            ["user", "Job seeker"],
            ["hr", "Employer"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm({ ...form, role: value })}
              className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${form.role === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">First name</label>
            <input
              placeholder="First name"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              value={form.firstName}
              onChange={(e) => {
                const cleanedVal = e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 15);
                setForm({ ...form, firstName: cleanedVal });
              }}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Last name</label>
            <input
              placeholder="Last name"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              value={form.lastName}
              onChange={(e) => {
                const cleanedVal = e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 15);
                setForm({ ...form, lastName: cleanedVal });
              }}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Email address</label>
          <div className="flex gap-3">
            <input
              type="email"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                setIsOtpSent(false);
                setIsOtpVerified(false);
                setPendingAuth(null);
              }}
              placeholder="name@example.com"
              className="flex-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
            <button
              type="button"
              onClick={sendOtp}
              disabled={loadingSend || cooldown > 0 || !isFormValid}
              className="w-[120px] shrink-0 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200"
            >
              {loadingSend ? "Sending..." : cooldown > 0 ? `Resend ${cooldown}s` : "Send OTP"}
            </button>
          </div>
          {!isFormValid && (
            <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1.5 font-medium transition-all duration-300">
              <svg className="w-3.5 h-3.5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              The "Send OTP" button will be available once all details (First name, Last name, Email, Password - min 8 chars, 1 uppercase, 1 lowercase, 1 number{form.role === "hr" ? ", and Company name" : ""}) are filled.
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
              className="w-[120px] shrink-0 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200"
            >
              {loadingVerify ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        </div>

        <div className={`grid gap-4 ${form.role === "hr" ? "grid-cols-2" : "grid-cols-1"}`}>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <PasswordInput
  value={form.password}
  onChange={(e) => handlePasswordChange(e.target.value)}
  placeholder="••••••••"
/>
          </div>
          {form.role === "hr" && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Company name</label>
              <input
                placeholder="e.g. Acme Corp"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={!isOtpVerified}
          onClick={createAccount}
          className="mt-2 w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 disabled:shadow-none"
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
            className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300"
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
    </AuthFrame>
  );
}
