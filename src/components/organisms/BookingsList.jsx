import React, { useState, useEffect } from "react";
import BookingCard from "@/components/molecules/BookingCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { bookingService } from "@/services/api/bookingService";
import { timeSlotService } from "@/services/api/timeSlotService";
import { toast } from "react-toastify";

const BookingsList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await bookingService.getAll();
      // Filter for upcoming bookings only
      const today = new Date().toISOString().split("T")[0];
      const upcomingBookings = data.filter(booking => booking.date >= today);
      setBookings(upcomingBookings);
    } catch (err) {
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const booking = bookings.find(b => b.Id === bookingId);
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
      await loadBookings();
      
      toast.success("Booking cancelled successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to cancel booking");
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadBookings} />;
  if (bookings.length === 0) return <Empty message="No upcoming bookings" />;

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <BookingCard
          key={booking.Id}
          booking={booking}
          onCancel={handleCancelBooking}
        />
      ))}
    </div>
  );
};

export default BookingsList;