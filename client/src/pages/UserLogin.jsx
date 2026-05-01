import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BriefcaseIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import axios from "../utils/axios";
import PasswordInput from "../components/PasswordInput";

export default function UserLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "NO_ACCOUNT") {
      setError("No account found. Please register first.");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("/auth/user/login", form);
      localStorage.clear();
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", "user");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame
      eyebrow="Candidate access"
      title="Find roles that fit the way you work."
      summary="Track every saved job, application, interview, and profile update from one calm workspace."
    >
      <form onSubmit={handleLogin} className="space-y-4">
        {error && <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          className="input"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <PasswordInput
  value={form.password}
  onChange={(e) => setForm({ ...form, password: e.target.value })}
  placeholder="Password"
/>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          <LockClosedIcon className="h-4 w-4" />
          {loading ? "Signing in..." : "Sign in as job seeker"}
        </button>

        <div className="mt-3 flex items-center justify-center gap-4">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-sm text-slate-400 whitespace-nowrap">or login with</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => window.location.href = "http://localhost:5000/api/auth/google?role=user&action=login"}
            className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            aria-label="Continue with Google"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.954 12.242c0-.816-.073-1.602-.209-2.362H12.24v4.467h6.448c-.278 1.48-1.106 2.73-2.356 3.57v2.965h3.808c2.238-2.064 3.518-5.09 3.518-8.64z" fill="#4285F4"/>
              <path d="M12.24 24c3.24 0 5.957-1.076 7.944-2.924l-3.808-2.964c-1.06.713-2.415 1.13-4.136 1.13-3.183 0-5.885-2.15-6.848-5.041H1.551v3.164C3.503 21.678 7.602 24 12.24 24z" fill="#34A853"/>
              <path d="M5.392 14.2a7.21 7.21 0 0 1 0-4.405V6.63H1.551a11.98 11.98 0 0 0 0 10.74l3.841-3.17z" fill="#FBBC05"/>
              <path d="M12.24 4.797c1.75 0 3.31.604 4.545 1.79l3.41-3.41C18.192 1.295 15.48 0 12.24 0 7.602 0 3.503 2.322 1.551 5.63l3.841 3.164C6.355 6.945 9.057 4.797 12.24 4.797z" fill="#EA4335"/>
            </svg>
          </button>
        </div>
      </form>
      <div className="mt-5 flex flex-col gap-2 text-sm text-slate-600">
        <Link to="/forgot-password" state={{ from: "login" }} className="font-semibold text-indigo-700">Forgot password?</Link>
        <p>
          New here? <Link to="/register" className="font-semibold text-indigo-700">Create an account</Link>
        </p>
        <p>
          Hiring? <Link to="/hr-login" className="font-semibold text-teal-700">Use employer login</Link>
        </p>
      </div>
    </AuthFrame>
  );
}

export function AuthFrame({ eyebrow, title, summary, children }) {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1fr_520px]">
        <section className="hidden flex-col justify-between px-10 py-10 text-white lg:flex">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-950">
              <BriefcaseIcon className="h-6 w-6" />
            </span>
            <span className="text-lg font-bold">Worklance</span>
          </Link>
          <div className="max-w-xl">
            <span className="text-sm font-semibold uppercase tracking-wide text-teal-200">{eyebrow}</span>
            <h1 className="mt-4 text-5xl font-bold leading-tight">{title}</h1>
            <p className="mt-5 text-lg leading-8 text-slate-300">{summary}</p>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8 text-sm text-slate-300">
            <span>JWT auth</span>
            <span>Role routing</span>
            <span>Pipeline UI</span>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <Link to="/" className="mb-8 flex items-center gap-3 lg:hidden">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
                <BriefcaseIcon className="h-6 w-6" />
              </span>
              <span className="text-lg font-bold text-slate-950">Worklance</span>
            </Link>
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
