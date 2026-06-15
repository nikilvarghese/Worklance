import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  BellIcon,
  Bars3Icon,
  BookmarkIcon,
  BriefcaseIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  PlusCircleIcon,
  UserCircleIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import axios from "../utils/axios";
import { initials, statusStyles } from "../utils/format";

const userNav = [
  { name: "Dashboard", path: "/dashboard", icon: HomeIcon },
  { name: "Browse Jobs", path: "/browse", icon: BriefcaseIcon },
  { name: "Applications", path: "/applied", icon: ClipboardDocumentListIcon },
  { name: "Saved Jobs", path: "/saved", icon: BookmarkIcon },
  { name: "Profile", path: "/profile", icon: UserCircleIcon },
];

const hrNav = [
  { name: "Dashboard", path: "/hr-dashboard", icon: HomeIcon },
  { name: "Post Job", path: "/post-job", icon: PlusCircleIcon },
  { name: "Manage Jobs", path: "/manage-jobs", icon: BriefcaseIcon },
  { name: "Applicants", path: "/applicants", icon: UsersIcon },
  { name: "Reports", path: "/reports", icon: ChartBarIcon },
  { name: "Profile", path: "/hr-profile", icon: UserCircleIcon },
];

export default function AppShell({ role, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const navItems = role === "hr" ? hrNav : userNav;
  const roleLabel = role === "hr" ? "Employer workspace" : "Job seeker workspace";

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    setNotifyOpen(false);
    setShowClearConfirm(false);
  }, [location.pathname]);

  useEffect(() => {
    const loadShellData = async () => {
      try {
        const [profileRes, appRes] = await Promise.all([
          axios.get("/auth/me"),
          axios.get("/applications").catch(() => ({ data: [] })),
        ]);

        setProfile(profileRes.data);
        const items = Array.isArray(appRes.data) ? appRes.data : [];
        const dismissed = JSON.parse(localStorage.getItem("dismissedNotifications") || "[]");
        const activeItems = items.filter((item) => !dismissed.includes(item._id));

        if (role === "hr") {
          setNotifications(
            activeItems.slice(0, 6).map((item) => ({
              id: item._id,
              title: item.userId?.name || "New applicant",
              body: `Applied for ${item.jobId?.title || "a job"}`,
              status: item.status,
            }))
          );
        } else {
          setNotifications(
            activeItems.slice(0, 6).map((item) => ({
              id: item._id,
              title: item.jobId?.title || item.jobSnapshot?.title || "Application update",
              body: `Status: ${item.status}`,
              status: item.status,
            }))
          );
        }
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login");
        }
      }
    };

    loadShellData();
  }, [navigate, role]);

  const pageTitle = useMemo(() => {
    const current = navItems.find((item) => item.path === location.pathname);
    if (current) return current.name;
    if (location.pathname.startsWith("/job/")) return "Job Details";
    if (location.pathname.startsWith("/hr/applicant/")) return "Applicant Profile";
    return "Worklance";
  }, [location.pathname, navItems]);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleNotificationClick = (item) => {
    const dismissed = JSON.parse(localStorage.getItem("dismissedNotifications") || "[]");
    if (!dismissed.includes(item.id)) {
      dismissed.push(item.id);
      localStorage.setItem("dismissedNotifications", JSON.stringify(dismissed));
    }
    setNotifications((prev) => prev.filter((n) => n.id !== item.id));
    setNotifyOpen(false);
    if (role === "hr") {
      navigate(`/hr/applicant/${item.id}`);
    } else {
      navigate("/applied");
    }
  };

  const handleClearAll = () => {
    const dismissed = JSON.parse(localStorage.getItem("dismissedNotifications") || "[]");
    notifications.forEach((item) => {
      if (!dismissed.includes(item.id)) {
        dismissed.push(item.id);
      }
    });
    localStorage.setItem("dismissedNotifications", JSON.stringify(dismissed));
    setNotifications([]);
    setShowClearConfirm(false);
  };

  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-slate-950 text-white lg:flex lg:flex-col">
        <SidebarContent navItems={navItems} role={role} roleLabel={roleLabel} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-80 max-w-[86vw] flex-col bg-slate-950 text-white shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
              aria-label="Close menu"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <SidebarContent navItems={navItems} role={role} roleLabel={roleLabel} />
          </aside>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg border border-slate-200 p-2 text-slate-700 lg:hidden"
              aria-label="Open menu"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{roleLabel}</p>
              <h1 className="truncate text-lg font-semibold text-slate-950">{pageTitle}</h1>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifyOpen((value) => {
                    if (value) {
                      setShowClearConfirm(false);
                    }
                    return !value;
                  });
                }}
                className="relative rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50"
                aria-label="Open notifications"
              >
                <BellIcon className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500" />
                )}
              </button>

              {notifyOpen && (
                <div className="absolute right-0 mt-3 w-80 rounded-lg border border-slate-200 bg-white p-2 shadow-soft">
                  <div className="flex items-center justify-between px-2 py-2 border-b border-slate-100 pb-2 mb-2">
                    <p className="font-semibold text-slate-950">Notifications</p>
                    {notifications.length > 0 && !showClearConfirm && (
                      <button
                        type="button"
                        onClick={() => setShowClearConfirm(true)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {showClearConfirm ? (
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg my-1 text-center">
                        <p className="text-xs font-medium text-rose-800">Clear all notifications?</p>
                        <div className="mt-2 flex justify-center gap-3">
                          <button
                            type="button"
                            onClick={handleClearAll}
                            className="px-3 py-1 bg-rose-600 text-white rounded text-xs font-semibold hover:bg-rose-700 transition"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowClearConfirm(false)}
                            className="px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded text-xs font-semibold hover:bg-slate-50 transition"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ) : notifications.length === 0 ? (
                      <p className="px-2 py-6 text-center text-sm text-slate-500">No updates yet</p>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleNotificationClick(item)}
                          className="rounded-lg px-2 py-3 hover:bg-slate-50 cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                              <p className="text-xs text-slate-500">{item.body}</p>
                            </div>
                            <span className={`badge ${statusStyles[item.status] || "border-slate-200 bg-slate-50 text-slate-600"}`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((value) => !value)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 transition hover:bg-slate-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                  {initials(profile?.name || profile?.company || "JP")}
                </span>
                <span className="hidden max-w-32 truncate text-sm font-semibold text-slate-800 sm:block">
                  {profile?.name || "Account"}
                </span>
                <ChevronDownIcon className="hidden h-4 w-4 text-slate-500 sm:block" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-soft">
                  <div className="border-b border-slate-100 px-3 py-3">
                    <p className="truncate text-sm font-semibold text-slate-950">{profile?.name || "Account"}</p>
                    <p className="truncate text-xs text-slate-500">{profile?.email}</p>
                  </div>
                  <Link
                    to={role === "hr" ? "/hr-profile" : "/profile"}
                    className="mt-2 block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Profile settings
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-rose-700 hover:bg-rose-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({ navItems, role, roleLabel }) {
  return (
    <>
      <div className="px-6 py-6">
        <Link to={role === "hr" ? "/hr-dashboard" : "/dashboard"} className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-950">
            <BriefcaseIcon className="h-6 w-6" />
          </span>
          <span>
            <span className="block text-lg font-bold">Worklance</span>
            <span className="block text-xs text-slate-400">{roleLabel}</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="m-4 rounded-lg border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-semibold text-white">{role === "hr" ? "Premium hiring" : "Career boost"}</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          {role === "hr"
            ? "Sponsor roles and unlock candidate analytics."
            : "Save searches and get priority application alerts."}
        </p>
      </div>
    </>
  );
}
