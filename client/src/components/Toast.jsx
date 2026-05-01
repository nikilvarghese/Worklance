import { createContext, useContext, useMemo, useState } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const value = useMemo(() => {
    const removeToast = (id) => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    const addToast = (message, type = "success") => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      window.setTimeout(() => removeToast(id), 4200);
    };

    return { addToast, removeToast };
  }, []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={() => value.removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const styles = {
  success: {
    icon: CheckCircleIcon,
    className: "border-emerald-200 bg-emerald-50 text-emerald-900",
  },
  error: {
    icon: ExclamationTriangleIcon,
    className: "border-rose-200 bg-rose-50 text-rose-900",
  },
  warning: {
    icon: ExclamationTriangleIcon,
    className: "border-amber-200 bg-amber-50 text-amber-900",
  },
  info: {
    icon: InformationCircleIcon,
    className: "border-sky-200 bg-sky-50 text-sky-900",
  },
};

const Toast = ({ toast, onClose }) => {
  const toastStyle = styles[toast.type] || styles.info;
  const Icon = toastStyle.icon;

  return (
    <div className={`flex items-start gap-3 rounded-lg border p-4 shadow-soft ${toastStyle.className}`}>
      <Icon className="mt-0.5 h-5 w-5 flex-none" />
      <p className="min-w-0 flex-1 text-sm font-medium">{toast.message}</p>
      <button
        type="button"
        onClick={onClose}
        className="rounded-md p-1 transition hover:bg-black/5"
        aria-label="Dismiss notification"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};
