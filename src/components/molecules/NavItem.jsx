import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const NavItem = ({ to, icon, children, className }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg",
          isActive
            ? "bg-primary text-white shadow-md"
            : "text-gray-600 hover:bg-surface hover:text-primary",
          className
        )
      }
    >
      <ApperIcon name={icon} size={20} />
      {children}
    </NavLink>
  );
};

export default NavItem;