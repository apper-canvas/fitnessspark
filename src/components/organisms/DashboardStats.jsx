import React, { useState, useEffect } from "react";
import StatCard from "@/components/molecules/StatCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { bookingService } from "@/services/api/bookingService";
import { facilityService } from "@/services/api/facilityService";
import { creditService } from "@/services/api/creditService";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

const DashboardStats = () => {
  const [stats, setStats] = useState({
    todayBookings: 0,
    totalBookings: 0,
    weeklyBookings: 0,
    popularFacility: "Pool",
    credits: 0,
    mostUsedFacility: "Pool"
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
      
      const [bookings, facilities, credits] = await Promise.all([
        bookingService.getAll(),
        facilityService.getAll(),
        creditService.getCredits()
      ]);

      const now = new Date();
      const today = format(now, "yyyy-MM-dd");
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);
      
      // Filter bookings
      const todayBookings = bookings.filter(booking => booking.date === today);
      const weeklyBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return isWithinInterval(bookingDate, { start: weekStart, end: weekEnd });
      });
      
      // Find most popular facility (all time)
      const facilityBookings = {};
      bookings.forEach(booking => {
        facilityBookings[booking.facilityName] = (facilityBookings[booking.facilityName] || 0) + 1;
      });
      
      const popularFacility = Object.keys(facilityBookings).length > 0 
        ? Object.keys(facilityBookings).reduce((a, b) => 
            facilityBookings[a] > facilityBookings[b] ? a : b
          )
        : "Pool";

      // Find most used facility this week
      const weeklyFacilityBookings = {};
      weeklyBookings.forEach(booking => {
        weeklyFacilityBookings[booking.facilityName] = (weeklyFacilityBookings[booking.facilityName] || 0) + 1;
      });
      
      const mostUsedFacility = Object.keys(weeklyFacilityBookings).length > 0
        ? Object.keys(weeklyFacilityBookings).reduce((a, b) => 
            weeklyFacilityBookings[a] > weeklyFacilityBookings[b] ? a : b
          )
        : popularFacility;

      setStats({
        todayBookings: todayBookings.length,
        totalBookings: bookings.length,
        weeklyBookings: weeklyBookings.length,
        popularFacility,
        mostUsedFacility,
        credits
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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Credit Balance"
        value={stats.credits}
        icon="CreditCard"
        gradient={true}
      />
      <StatCard
        title="This Week"
        value={stats.weeklyBookings}
        icon="Calendar"
        gradient={true}
      />
      <StatCard
        title="Most Used"
        value={stats.mostUsedFacility}
        icon="Trophy"
      />
      <StatCard
        title="Total Sessions"
        value={stats.totalBookings}
        icon="BarChart3"
      />
    </div>
  );
};

export default DashboardStats;