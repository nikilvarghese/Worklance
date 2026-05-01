import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import { ToastProvider } from "./components/Toast";
import Landing from "./pages/Landing";
import UserLogin from "./pages/UserLogin";
import HRLogin from "./pages/HRLogin";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import SetPassword from "./pages/SetPassword";
import Dashboard from "./pages/Dashboard";
import BrowseJobs from "./pages/BrowseJobs";
import AppliedJobs from "./pages/AppliedJobs";
import SavedJobs from "./pages/SavedJobs";
import Profile from "./pages/Profile";
import PostJob from "./pages/PostJob";
import HrDashboard from "./pages/HrDashboard";
import JobDetails from "./pages/JobDetails";
import Applicants from "./pages/Applicants";
import ApplicantProfile from "./pages/ApplicantProfile";
import ManageJobs from "./pages/ManageJobs";
import Reports from "./pages/Reports";
import HrProfile from "./pages/HrProfile";

function RequireRole({ role, children }) {
  const token = localStorage.getItem("token");
  const currentRole = localStorage.getItem("role");

  if (!token) {
    return <Navigate to={role === "hr" ? "/hr-login" : "/login"} replace />;
  }

  if (currentRole !== role) {
    return <Navigate to={currentRole === "hr" ? "/hr-dashboard" : "/dashboard"} replace />;
  }

  return <AppShell role={role}>{children}</AppShell>;
}

function RequireAnyRole({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <AppShell role={role === "hr" ? "hr" : "user"}>{children}</AppShell>;
}
function App() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const role = params.get("role");

  if (token) {
    if (window.location.pathname !== "/set-password") {
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/hr-login" element={<HRLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/set-password" element={<SetPassword />} />

          <Route
            path="/dashboard"
            element={
              <RequireRole role="user">
                <Dashboard />
              </RequireRole>
            }
          />
          <Route
            path="/browse"
            element={
              <RequireRole role="user">
                <BrowseJobs />
              </RequireRole>
            }
          />
          <Route
            path="/applied"
            element={
              <RequireRole role="user">
                <AppliedJobs />
              </RequireRole>
            }
          />
          <Route
            path="/saved"
            element={
              <RequireRole role="user">
                <SavedJobs />
              </RequireRole>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireRole role="user">
                <Profile />
              </RequireRole>
            }
          />

          <Route
            path="/hr-dashboard"
            element={
              <RequireRole role="hr">
                <HrDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/post-job"
            element={
              <RequireRole role="hr">
                <PostJob />
              </RequireRole>
            }
          />
          <Route
            path="/manage-jobs"
            element={
              <RequireRole role="hr">
                <ManageJobs />
              </RequireRole>
            }
          />
          <Route
            path="/applicants"
            element={
              <RequireRole role="hr">
                <Applicants />
              </RequireRole>
            }
          />
          <Route
            path="/reports"
            element={
              <RequireRole role="hr">
                <Reports />
              </RequireRole>
            }
          />
          <Route
            path="/hr-profile"
            element={
              <RequireRole role="hr">
                <HrProfile />
              </RequireRole>
            }
          />
          <Route
            path="/hr/applicant/:id"
            element={
              <RequireRole role="hr">
                <ApplicantProfile />
              </RequireRole>
            }
          />

          <Route
            path="/job/:id"
            element={
              <RequireAnyRole>
                <JobDetails />
              </RequireAnyRole>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
