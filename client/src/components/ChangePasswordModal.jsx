import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import axios from "../utils/axios";
import { useToast } from "./Toast";

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { addToast } = useToast();
  const [data, setData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changing, setChanging] = useState(false);

  if (!isOpen) return null;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!data.oldPassword || !data.newPassword) return;
    if (data.newPassword !== data.confirmPassword) {
      addToast("New passwords do not match", "error");
      return;
    }
    
    setChanging(true);
    try {
      await axios.put("/auth/change-password", data);
      addToast("Password changed successfully", "success");
      setData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || "Could not change password", "error");
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
        <h3 className="text-xl font-bold text-slate-950 mb-4">Change Password</h3>
        
        <form onSubmit={handleChangePassword} className="space-y-4">
          <label className="block">
            <span className="label mb-1 block">Old Password</span>
            <input
              type="password"
              className="input w-full"
              value={data.oldPassword}
              onChange={(e) => setData({ ...data, oldPassword: e.target.value })}
              required
            />
          </label>
          <label className="block">
            <span className="label mb-1 block">New Password</span>
            <input
              type="password"
              className="input w-full"
              value={data.newPassword}
              onChange={(e) => setData({ ...data, newPassword: e.target.value })}
              required
            />
          </label>
          <label className="block">
            <span className="label mb-1 block">Confirm New Password</span>
            <input
              type="password"
              className="input w-full"
              value={data.confirmPassword}
              onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
              required
            />
          </label>

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
                disabled={changing || !data.oldPassword || !data.newPassword || data.newPassword !== data.confirmPassword}
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
