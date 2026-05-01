import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { KeyIcon } from "@heroicons/react/24/outline";
import axios from "../utils/axios";
import { AuthFrame } from "./UserLogin";
import PasswordInput from "../components/PasswordInput";

export default function SetPassword() {
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");
  const role = searchParams.get("role");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {

      await axios.post(
  "/auth/set-password",
  { password: form.password },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

      // Successfully set password, now we can log them in properly
      localStorage.clear();
      localStorage.setItem("token", token);
      localStorage.setItem("role", role || "user");
      
      // Clean up the URL and redirect
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate(role === "hr" ? "/hr-dashboard" : "/dashboard");
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
        <PasswordInput
  value={form.password}
  onChange={(e) => setForm({ ...form, password: e.target.value })}
  placeholder="New Password"
  required
/>

<PasswordInput
  value={form.confirmPassword}
  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
  placeholder="Confirm Password"
  required
/>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          <KeyIcon className="h-4 w-4" />
          {loading ? "Saving..." : "Set Password"}
        </button>
      </form>
    </AuthFrame>
  );
}
