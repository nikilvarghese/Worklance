import { XMarkIcon } from "@heroicons/react/24/outline";

export default function OtpModal({
  isOpen,
  title,
  email,
  value,
  onChange,
  onSubmit,
  onResend,
  resendCooldown,
  expiresAt,
  error,
  loading,
  success,
  onClose,
}) {
  if (!isOpen) return null;

  const now = Date.now();
  const expiresIn = expiresAt ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now) / 1000)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label">{title}</p>
            <p className="mt-2 text-sm text-slate-600">Enter the 6-digit code sent to {email}.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={value}
            onChange={onChange}
            placeholder="Enter OTP"
            className="input w-full text-center text-lg tracking-[0.4em]"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
            <span>{expiresIn > 0 ? `Expires in ${expiresIn}s` : "OTP expired"}</span>
            <button
              type="button"
              onClick={onResend}
              disabled={resendCooldown > 0}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${resendCooldown > 0 ? "bg-slate-100 text-slate-400" : "bg-slate-950 text-white hover:bg-slate-800"}`}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
            </button>
          </div>

          {error && <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
          {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>}

          <button type="button" onClick={onSubmit} disabled={loading} className="btn-primary w-full">
            {loading ? "Verifying…" : "Verify OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}
