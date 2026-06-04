import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import axios from "../utils/axios";
import { useToast } from "./Toast";
import PasswordInput from "../components/PasswordInput";

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { addToast } = useToast();
  const [data, setData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changing, setChanging] = useState(false);

  const passChecks = {
    length: data.newPassword.length >= 8,
    upper: /[A-Z]/.test(data.newPassword),
    lower: /[a-z]/.test(data.newPassword),
    number: /\d/.test(data.newPassword),
  };

  if (!isOpen) return null;

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!data.oldPassword || !data.newPassword) return;

    if (data.newPassword !== data.confirmPassword) {
      addToast("New passwords do not match", "error");
      return;
    }

    if (!passChecks.length || !passChecks.upper || !passChecks.lower || !passChecks.number) {
      addToast("Password must be at least 8 characters and include uppercase, lowercase, and a number", "error");
      return;
    }

    setChanging(true);

    try {
      await axios.put("/auth/change-password", data);
      addToast("Password changed successfully", "success");

      setData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      onClose();
    } catch (err) {
      addToast(
        err.response?.data?.message || "Could not change password",
        "error"
      );
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        {/* Title */}
        <h3 className="mb-4 text-xl font-bold text-slate-950">
          Change Password
        </h3>

        {/* Form */}
        <form onSubmit={handleChangePassword} className="space-y-4">

          {/* Old Password */}
          <label className="block">
            <span className="label mb-1 block">Old Password</span>
            <PasswordInput
              value={data.oldPassword}
              onChange={(e) =>
                setData({ ...data, oldPassword: e.target.value })
              }
              placeholder="Old Password"
              required
            />
          </label>

          {/* New Password */}
          <label className="block">
            <span className="label mb-1 block">New Password</span>
            <PasswordInput
              value={data.newPassword}
              onChange={(e) =>
                setData({ ...data, newPassword: e.target.value })
              }
              placeholder="New Password"
              required
            />
          </label>

          {/* Checklist */}
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

          {/* Confirm Password */}
          <label className="block">
            <span className="label mb-1 block">Confirm New Password</span>
            <PasswordInput
              value={data.confirmPassword}
              onChange={(e) =>
                setData({ ...data, confirmPassword: e.target.value })
              }
              placeholder="Confirm Password"
              required
            />
          </label>

          {/* Mismatch Warning */}
          {data.confirmPassword &&
            data.newPassword !== data.confirmPassword && (
              <p className="text-sm text-rose-600">
                Passwords do not match
              </p>
            )}

          {/* Footer */}
          <div className="mt-6 flex items-center justify-between">
            <Link
              to="/forgot-password"
              state={{ from: "profile" }}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
              onClick={onClose}
            >
              Forgot old password?
            </Link>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  changing ||
                  !data.oldPassword ||
                  !data.newPassword ||
                  !passChecks.length ||
                  !passChecks.upper ||
                  !passChecks.lower ||
                  !passChecks.number ||
                  data.newPassword !== data.confirmPassword
                }
                className="btn-primary"
              >
                {changing ? "Changing..." : "Reset Password"}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}