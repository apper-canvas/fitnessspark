import React, { useState, useEffect } from "react";
import DashboardStats from "@/components/organisms/DashboardStats";
import BookingCard from "@/components/molecules/BookingCard";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { useNavigate } from "react-router-dom";
import { bookingService } from "@/services/api/bookingService";
import { timeSlotService } from "@/services/api/timeSlotService";
import { toast } from "react-toastify";
import { format } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const [todayBookings, setTodayBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTodayBookings();
  }, []);

  const loadTodayBookings = async () => {
    try {
      setError(null);
      setLoading(true);
      const bookings = await bookingService.getAll();
      const today = format(new Date(), "yyyy-MM-dd");
      const todayBookings = bookings.filter(booking => booking.date === today);
      setTodayBookings(todayBookings);
    } catch (err) {
      setError(err.message || "Failed to load today's bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const booking = todayBookings.find(b => b.Id === bookingId);
      if (!booking) return;

      // Find and update the corresponding time slot
      const timeSlots = await timeSlotService.getAll();
      const timeSlot = timeSlots.find(slot => 
        slot.facilityId === booking.facilityId &&
        slot.date === booking.date &&
        slot.startTime === booking.startTime
      );

      if (timeSlot) {
        await timeSlotService.update(timeSlot.Id, { isAvailable: true });
      }

      // Delete the booking
      await bookingService.delete(bookingId);
      
      // Refresh bookings
      await loadTodayBookings();
      
      toast.success("Booking cancelled successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to cancel booking");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-outfit font-bold text-3xl text-gray-900 mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-600">
            Ready for your workout? Check your bookings and reserve facilities.
          </p>
        </div>
        <Button 
          onClick={() => navigate("/book-facility")}
          className="hidden sm:flex items-center gap-2"
        >
          <ApperIcon name="Plus" size={20} />
          Book Facility
        </Button>
      </div>

      <DashboardStats />

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-outfit font-bold text-xl text-gray-900">
              Today's Bookings
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/my-bookings")}
              className="text-primary hover:bg-primary/10"
            >
              View All
            </Button>
          </div>

          {loading ? (
            <Loading />
          ) : error ? (
            <Error message={error} onRetry={loadTodayBookings} />
          ) : todayBookings.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="Calendar" size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">No bookings for today</p>
              <Button onClick={() => navigate("/book-facility")}>
                Book a Facility
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {todayBookings.slice(0, 3).map((booking) => (
                <BookingCard
                  key={booking.Id}
                  booking={booking}
                  onCancel={handleCancelBooking}
                />
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="font-outfit font-bold text-xl text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="space-y-4">
            <Button
              variant="primary"
              className="w-full justify-start gap-3 p-4"
              onClick={() => navigate("/book-facility")}
            >
              <ApperIcon name="Calendar" size={20} />
              <div className="text-left">
                <div className="font-medium">Book a Facility</div>
                <div className="text-sm opacity-90">Reserve your workout space</div>
              </div>
            </Button>
            
            <Button
              variant="secondary"
              className="w-full justify-start gap-3 p-4"
              onClick={() => navigate("/my-bookings")}
            >
              <ApperIcon name="BookOpen" size={20} />
              <div className="text-left">
                <div className="font-medium">My Bookings</div>
                <div className="text-sm text-gray-500">View and manage reservations</div>
              </div>
            </Button>
          </div>
        </Card>
      </div>

      {/* Mobile Quick Action Button */}
      <div className="sm:hidden fixed bottom-20 right-4">
        <Button 
          onClick={() => navigate("/book-facility")}
          className="rounded-full w-14 h-14 shadow-lg"
        >
          <ApperIcon name="Plus" size={24} />
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;