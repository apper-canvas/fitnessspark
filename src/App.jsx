import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Layout from '@/components/organisms/Layout';
import Dashboard from '@/components/pages/Dashboard';
import BookFacility from '@/components/pages/BookFacility';
import FacilityDetail from '@/components/pages/FacilityDetail';
import MyBookings from "@/components/pages/MyBookings";

function App() {
  return (
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
        style={{ zIndex: 9999 }}
      />
    </div>
  );
}

export default App;