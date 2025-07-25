import React, { createContext, useContext, useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { notificationService } from "@/services/api/notificationService";
import "@/index.css";
import BookFacility from "@/components/pages/BookFacility";
import MyBookings from "@/components/pages/MyBookings";
import Dashboard from "@/components/pages/Dashboard";
import FacilityDetail from "@/components/pages/FacilityDetail";
import Layout from "@/components/organisms/Layout";
import Error from "@/components/ui/Error";

// Notification Context
const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  useEffect(() => {
    loadUnreadCount();

    const handleNotificationUpdate = () => {
      loadUnreadCount();
    };

    window.addEventListener('notificationUpdated', handleNotificationUpdate);
    return () => window.removeEventListener('notificationUpdated', handleNotificationUpdate);
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, loadUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

function AppComponent() {
  return (
    <NotificationProvider>
    <div className="min-h-screen bg-white">
        <Layout>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/book-facility" element={<BookFacility />} />
                <Route path="/facility/:id" element={<FacilityDetail />} />
                <Route path="/my-bookings" element={<MyBookings />} />
            </Routes>
        </Layout>
        <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            style={{
                zIndex: 9999
            }} />
    </div></NotificationProvider>
  );
}

export default AppComponent;