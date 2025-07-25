import React from "react";
import { NavLink } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const MobileNavigation = () => {
  const navItems = [
    { to: "/", icon: "LayoutDashboard", label: "Dashboard" },
    { to: "/book-facility", icon: "Calendar", label: "Book" },
    { to: "/my-bookings", icon: "BookOpen", label: "Bookings" }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-gray-600 hover:text-primary hover:bg-surface"
              )
            }
          >
            <ApperIcon name={item.icon} size={20} />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNavigation;