import React, { useState, useEffect } from "react";
import StatCard from "@/components/molecules/StatCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { bookingService } from "@/services/api/bookingService";
import { facilityService } from "@/services/api/facilityService";
import { format } from "date-fns";

const DashboardStats = () => {
  const [stats, setStats] = useState({
    todayBookings: 0,
    totalBookings: 0,
    popularFacility: "Pool"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const [bookings, facilities] = await Promise.all([
        bookingService.getAll(),
        facilityService.getAll()
      ]);

      const today = format(new Date(), "yyyy-MM-dd");
      const todayBookings = bookings.filter(booking => booking.date === today);
      
      // Find most popular facility
      const facilityBookings = {};
      bookings.forEach(booking => {
        facilityBookings[booking.facilityName] = (facilityBookings[booking.facilityName] || 0) + 1;
      });
      
      const popularFacility = Object.keys(facilityBookings).reduce((a, b) => 
        facilityBookings[a] > facilityBookings[b] ? a : b, "Pool"
      );

      setStats({
        todayBookings: todayBookings.length,
        totalBookings: bookings.length,
        popularFacility
      });
    } catch (err) {
      setError(err.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadStats} />;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Today's Bookings"
        value={stats.todayBookings}
        icon="Calendar"
        gradient={true}
      />
      <StatCard
        title="Total Bookings"
        value={stats.totalBookings}
        icon="BookOpen"
      />
      <StatCard
        title="Most Popular"
        value={stats.popularFacility}
        icon="Trophy"
      />
    </div>
  );
};

export default DashboardStats;