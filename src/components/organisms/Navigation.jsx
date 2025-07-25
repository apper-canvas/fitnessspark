import React from "react";
import NavItem from "@/components/molecules/NavItem";

const Navigation = () => {
  return (
    <nav className="hidden lg:flex bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center gap-8">
        <NavItem to="/" icon="LayoutDashboard">
          Dashboard
        </NavItem>
        <NavItem to="/book-facility" icon="Calendar">
          Book Facility
        </NavItem>
        <NavItem to="/my-bookings" icon="BookOpen">
          My Bookings
        </NavItem>
      </div>
    </nav>
  );
};

export default Navigation;