import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import axios from "../utils/axios";
import { AuthFrame } from "./UserLogin";
import PasswordInput from "../components/PasswordInput";

export default function ForgotPassword() {
  const [form, setForm] = useState({ email: "", otp: "", password: "" });
  const [stage, setStage] = useState("request");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (!form.email) return;

    const stored = localStorage.getItem(`otpCooldown_${form.email}`);

    if (stored) {
      const remaining = Math.max(0, Math.floor((stored - Date.now()) / 1000));
      setResendCooldown(remaining);
    }
  }, [form.email]);

  const requestOtp = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post("/auth/otp/request-reset", { email: form.email });
      setStage("verify");
      setMessage(res.data.message || "OTP sent to your email");
      const cooldown = res.data.resendCooldown || 120;

      setResendCooldown(cooldown);

      // 🔥 store expiry timestamp
      localStorage.setItem(
        `otpCooldown_${form.email}`,
        Date.now() + cooldown * 1000
      );
    } catch (err) {
      setError(err.response?.data?.message || "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setError("");

    try {
      await axios.post("/auth/otp/verify-reset", {
        email: form.email,
        otp: form.otp,
        password: form.password,
      });

      localStorage.removeItem(`otpCooldown_${form.email}`);

      navigate(from === "profile" ? "/profile" : "/login", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Could not verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resendCooldown > 0) return;
    setError("");
    await requestOtp();
  };

  const handleEmailChange = (e) => setForm({ ...form, email: e.target.value });
  const handleOtpChange = (e) => setForm({ ...form, otp: e.target.value.replace(/[^0-9]/g, "") });
  const handlePasswordChange = (e) => {
    setForm({ ...form, password: e.target.value });
  };

  const passChecks = {
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /\d/.test(form.password),
  };

  return (
    <AuthFrame
      eyebrow="Reset access"
      title="Forgot your password?"
      summary="Enter your email to receive a secure OTP and reset your account password."
    >
      <form onSubmit={stage === "request" ? requestOtp : (e) => e.preventDefault()} className="space-y-4">
        {error && <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</div>}
        {message && <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">{message}</div>}

        <input
          type="email"
          placeholder="Email"
          className="input"
          value={form.email}
          onChange={handleEmailChange}
          required
        />

        {stage === "verify" && (
          <>
            <input
              inputMode="numeric"
              maxLength={6}
              placeholder="OTP code"
              className="input"
              value={form.otp}
              onChange={handleOtpChange}
              required
            />
            <PasswordInput
              value={form.password}
              onChange={handlePasswordChange}
              placeholder="New password"
              required
            />
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
          </>
        )}

        {stage === "request" && (
          <button type="submit" disabled={loading} className="btn-primary w-full">
            <LockClosedIcon className="h-4 w-4" />
            {loading ? "Sending…" : "Send OTP"}
          </button>
        )}

        {stage === "verify" && (
          <button
            type="button"
            onClick={verifyOtp}
            disabled={
              loading ||
              form.otp.length !== 6 ||
              !passChecks.length ||
              !passChecks.upper ||
              !passChecks.lower ||
              !passChecks.number
            }
            className="btn-secondary w-full"
          >
            {loading ? "Verifying…" : "Reset password"}
          </button>
        )}

        {stage === "verify" && (
          <button
            type="button"
            onClick={resendCooldown === 0 ? resendOtp : undefined}
            disabled={resendCooldown > 0 || loading}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
          </button>
        )}
      </form>
      <p className="mt-5 text-sm text-slate-600">
        Remembered your password? <Link to="/login" className="font-semibold text-indigo-700">Sign in</Link>
      </p>
    </AuthFrame>
  );
}
