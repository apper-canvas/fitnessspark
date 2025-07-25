import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import NotificationsPanel from "@/components/organisms/NotificationsPanel";
import { notificationService } from "@/services/api/notificationService";
import { creditService } from "@/services/api/creditService";

const Header = () => {
const location = useLocation();
  const [credits, setCredits] = useState(10);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadCredits = async () => {
      try {
        const userCredits = await creditService.getCredits();
        setCredits(userCredits);
      } catch (error) {
        console.error("Failed to load credits:", error);
      }
    };
    loadCredits();
  }, []);
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Dashboard";
      case "/book-facility":
        return "Book Facility";
      case "/my-bookings":
        return "My Bookings";
      default:
        return "Fitness Hub";
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
            <ApperIcon name="Dumbbell" size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-outfit font-bold text-2xl text-gray-900">
              Fitness Hub
            </h1>
            <p className="text-sm text-gray-500">{getPageTitle()}</p>
          </div>
        </div>
<div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
            <ApperIcon name="Coins" size={16} className="text-amber-600" />
            <span className="text-sm font-semibold text-amber-700">{credits}</span>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 bg-surface rounded-lg hover:bg-gray-100 transition-colors relative"
            >
              <ApperIcon name="Bell" size={20} className="text-gray-600" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </button>
            
            <NotificationsPanel 
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
            />
          </div>
          
          <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
            <ApperIcon name="User" size={20} className="text-white" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;