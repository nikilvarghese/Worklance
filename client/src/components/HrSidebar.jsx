import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  HomeIcon,
  BriefcaseIcon,
  PlusCircleIcon,
  UsersIcon,
  CalendarIcon,
  ChartBarIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

export default function HrSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const menuItems = [
    {
      path: "/hr-dashboard",
      label: "Dashboard",
      icon: HomeIcon
    },
    {
      path: "/post-job",
      label: "Post Job",
      icon: PlusCircleIcon
    },
    {
      path: "/manage-jobs",
      label: "Manage Jobs",
      icon: BriefcaseIcon
    },
    {
      path: "/applicants",
      label: "Applicants",
      icon: UsersIcon
    },
    {
      path: "/interviews",
      label: "Interviews",
      icon: CalendarIcon
    },
    {
      path: "/reports",
      label: "Reports",
      icon: ChartBarIcon
    },
    {
      path: "/hr-profile",
      label: "Profile",
      icon: UserIcon
    }
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BriefcaseIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">HR Portal</h2>
            <p className="text-sm text-gray-500">Manage your jobs</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRightIcon className="w-4 h-4 ml-auto" />}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}