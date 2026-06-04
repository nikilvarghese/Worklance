import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { KeyIcon } from "@heroicons/react/24/outline";
import axios from "../utils/axios";
import { AuthFrame } from "./UserLogin";
import PasswordInput from "../components/PasswordInput";

const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export default function SetPassword() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    company: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    company: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");
  const role = searchParams.get("role");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const decoded = decodeToken(token);
    if (decoded) {
      setForm((prev) => ({
        ...prev,
        firstName: prev.firstName || decoded.firstName || "",
        lastName: prev.lastName || decoded.lastName || "",
      }));
    }
  }, [token, navigate]);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleFieldChange = (field, value, cleaningFn) => {
    const finalVal = cleaningFn ? cleaningFn(value) : value;
    setForm((prev) => ({ ...prev, [field]: finalVal }));
  };

  const passChecks = {
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /\d/.test(form.password),
  };

  const isFormValid =
    form.firstName.trim() !== "" &&
    form.lastName.trim() !== "" &&
    (role !== "hr" || form.company.trim() !== "") &&
    passChecks.length &&
    passChecks.upper &&
    passChecks.lower &&
    passChecks.number &&
    form.password === form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "/auth/set-password",
        {
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          company: form.company,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const finalToken = response.data.token || token;
      const finalRole = response.data.role || role || "user";

      // Successfully set password, now we can log them in properly
      localStorage.clear();
      localStorage.setItem("token", finalToken);
      localStorage.setItem("role", finalRole);

      // Redirect to the appropriate dashboard
      navigate(finalRole === "hr" ? "/hr-dashboard" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to set password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame
      eyebrow="Secure your account"
      title="Set your password"
      summary="Please set a secure password for your account to continue."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

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

        {role === "hr" && (
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
              required
            />
            {touched.company && form.company.trim() === "" && (
              <p className="text-xs text-rose-600 font-medium">Company name is required. Please fill it.</p>
            )}
          </div>
        )}

        <PasswordInput
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="New Password"
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

        <PasswordInput
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          placeholder="Confirm Password"
          required
        />
        {form.confirmPassword && form.password !== form.confirmPassword && (
          <p className="text-sm text-rose-600 mt-1">Passwords do not match</p>
        )}
        <button
          type="submit"
          disabled={loading || !isFormValid}
          className="btn-primary w-full"
        >
          <KeyIcon className="h-4 w-4" />
          {loading ? "Saving..." : "Set Password"}
        </button>
      </form>
    </AuthFrame>
  );
}
