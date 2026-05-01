import React from "react";
import { NavLink } from "react-router-dom";
import { 
  HomeIcon, 
  BriefcaseIcon, 
  BookmarkIcon, 
  UserIcon, 
  ArrowRightOnRectangleIcon 
} from "@heroicons/react/24/outline";

const navLinks = [
  { name: "Dashboard", icon: HomeIcon, path: "/dashboard" },
  { name: "Browse Jobs", icon: BriefcaseIcon, path: "/browse" },
  { name: "Applied Jobs", icon: BriefcaseIcon, path: "/applied" },
  { name: "Saved Jobs", icon: BookmarkIcon, path: "/saved" },
  { name: "Profile", icon: UserIcon, path: "/profile" },
  { name: "Logout", icon: ArrowRightOnRectangleIcon, path: "/logout" },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-blue-700 text-white flex flex-col h-screen p-4">
      <div className="text-2xl font-bold mb-8">Worklance</div>
      <nav className="flex flex-col gap-4">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-2 rounded-xl transition ${
                isActive ? "bg-blue-900" : "hover:bg-blue-800"
              }`
            }
          >
            <link.icon className="h-5 w-5" />
            {link.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

