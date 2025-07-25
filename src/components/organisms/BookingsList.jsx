import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { bookingService } from "@/services/api/bookingService";
import { timeSlotService } from "@/services/api/timeSlotService";
import Button from "@/components/atoms/Button";
import BookingCard from "@/components/molecules/BookingCard";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
const BookingsList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

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
      
// Trigger facility availability refresh
      if (typeof window !== 'undefined' && window.dispatchEvent && typeof CustomEvent !== 'undefined') {
        window.dispatchEvent(new CustomEvent('refreshFacilityAvailability'));
      }
    } catch (err) {
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = (bookingId) => {
    const booking = bookings.find(b => b.Id === bookingId);
    if (booking) {
      setBookingToCancel(booking);
      setShowConfirmDialog(true);
    }
  };

const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;
    
    try {
      setCancelling(true);
      
      // Find and update the corresponding time slot
      const timeSlots = await timeSlotService.getAll();
      const timeSlot = timeSlots.find(slot => 
        slot.facilityId === bookingToCancel.facilityId &&
        slot.date === bookingToCancel.date &&
        slot.startTime === bookingToCancel.startTime
      );

      if (timeSlot) {
        await timeSlotService.update(timeSlot.Id, { isAvailable: true });
      }

      // Delete the booking (this will also refund the credit and notify availability change)
      await bookingService.delete(bookingToCancel.Id);
      
      // Refresh bookings and trigger facility availability update
      await loadBookings();
      
// Additional immediate refresh trigger for facility list
      if (typeof window !== 'undefined' && window.dispatchEvent && typeof CustomEvent !== 'undefined') {
        window.dispatchEvent(new CustomEvent('facilityAvailabilityChanged', {
          detail: { 
            facilityId: bookingToCancel.facilityId, 
            change: 1,
            immediate: true
          }
        }));
      }
      toast.success(`Booking cancelled successfully! Your credit has been refunded and the ${bookingToCancel.facilityName} slot is now available for others.`);
      setShowConfirmDialog(false);
      setBookingToCancel(null);
    } catch (err) {
      toast.error(err.message || "Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  const closeConfirmDialog = () => {
    if (!cancelling) {
      setShowConfirmDialog(false);
      setBookingToCancel(null);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadBookings} />;
  if (bookings.length === 0) return <Empty message="No upcoming bookings" />;

  return (
    <>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <BookingCard
            key={booking.Id}
            booking={booking}
            onCancel={handleCancelBooking}
          />
        ))}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cancel Booking
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this booking? Your credit will be refunded and the time slot will become available for others to book.
            </p>
            {bookingToCancel && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">
                  <strong>Facility:</strong> {bookingToCancel.facilityName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Date:</strong> {bookingToCancel.date}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Time:</strong> {bookingToCancel.startTime} - {bookingToCancel.endTime}
                </p>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={closeConfirmDialog}
                disabled={cancelling}
              >
                Keep Booking
              </Button>
              <Button
                variant="ghost"
                onClick={confirmCancelBooking}
                disabled={cancelling}
                className="text-error hover:bg-error/10"
              >
                {cancelling ? "Cancelling..." : "Cancel Booking"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingsList;