import { creditService } from "@/services/api/creditService";
import bookingsData from "@/services/mockData/bookings.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// CustomEvent polyfill for environments that don't support it
const safeCustomEvent = (eventName, detail) => {
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    if (typeof window.CustomEvent === 'function') {
      return new window.CustomEvent(eventName, detail);
    } else {
      // Fallback for older browsers
      const event = document.createEvent('CustomEvent');
      event.initCustomEvent(eventName, false, false, detail.detail);
      return event;
    }
  }
  return null;
};

let bookings = [...bookingsData];

export const bookingService = {
  async getAll() {
    await delay(300);
    return [...bookings];
  },

  async getById(id) {
    await delay(200);
    const booking = bookings.find(b => b.Id === parseInt(id));
    if (!booking) {
      throw new Error("Booking not found");
    }
    return { ...booking };
  },

  async create(bookingData) {
    await delay(400);
    
    try {
      // Import notification service dynamically to avoid circular dependency
      const { notificationService } = await import('@/services/api/notificationService');
      
      // Deduct credit before creating booking
      await creditService.deductCredit(1);
      
      const maxId = bookings.length > 0 ? Math.max(...bookings.map(b => b.Id)) : 0;
      const newBooking = {
        Id: maxId + 1,
        ...bookingData,
        familyMemberId: bookingData.familyMemberId || 1, // Default to first family member
        isCheckedIn: false
      };
      bookings.push(newBooking);
      
      // Create booking confirmation notification
      await notificationService.createBookingConfirmation(newBooking);
      
      // Notify availability change
      const event = safeCustomEvent('facilityAvailabilityChanged', {
        detail: { facilityId: bookingData.facilityId, change: -1 }
      });
      if (event) {
        window.dispatchEvent(event);
      }
      
      return { ...newBooking };
    } catch (error) {
      // If credit deduction fails, don't create the booking
      throw new Error(`Failed to create booking: ${error.message}`);
    }
  },

  async rebook(bookingId, bookingData = null) {
    await delay(400);
    
    try {
      let originalBooking;
      
      if (bookingId) {
        // Rebooking from existing booking
        originalBooking = bookings.find(b => b.Id === parseInt(bookingId));
        if (!originalBooking) {
          throw new Error("Original booking not found");
        }
      } else if (bookingData) {
        // Quick rebook from favorite times
        originalBooking = bookingData;
      } else {
        throw new Error("No booking information provided");
      }

      // Import services dynamically
      const { timeSlotService } = await import('@/services/api/timeSlotService');
      const { notificationService } = await import('@/services/api/notificationService');
      
      // Calculate next week's date
      const originalDate = new Date(originalBooking.date || new Date());
      const nextWeekDate = new Date(originalDate);
      nextWeekDate.setDate(nextWeekDate.getDate() + 7);
      const nextWeekDateStr = nextWeekDate.toISOString().split('T')[0];
      
      // Check if the time slot is available next week
      const timeSlots = await timeSlotService.getAll();
      const targetTimeSlot = timeSlots.find(slot => 
        slot.facilityId === originalBooking.facilityId &&
        slot.startTime === originalBooking.startTime
      );
      
      if (!targetTimeSlot) {
        throw new Error("Time slot not found");
      }
      
      // Check if slot is available on the target date
      const existingBooking = bookings.find(booking => 
        booking.facilityId === originalBooking.facilityId &&
        booking.date === nextWeekDateStr &&
        booking.startTime === originalBooking.startTime &&
        booking.status === 'confirmed'
      );
      
      if (existingBooking) {
        throw new Error("Time slot is already booked for next week");
      }
      
      // Create the new booking
      const newBookingData = {
        facilityId: originalBooking.facilityId,
        facilityName: originalBooking.facilityName,
        date: nextWeekDateStr,
        startTime: originalBooking.startTime,
        endTime: originalBooking.endTime || targetTimeSlot.endTime,
        familyMemberId: originalBooking.familyMemberId,
        status: 'confirmed'
      };
      
      const newBooking = await this.create(newBookingData);
      return newBooking;
      
    } catch (error) {
      throw new Error(`Failed to rebook: ${error.message}`);
    }
  },

  async update(id, updateData) {
    await delay(300);
    const index = bookings.findIndex(b => b.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Booking not found");
    }
    bookings[index] = { ...bookings[index], ...updateData };
    return { ...bookings[index] };
  },

  async delete(id) {
    await delay(250);
    const index = bookings.findIndex(b => b.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Booking not found");
    }
    
    // Store facility info before deletion
    const facilityId = bookings[index].facilityId;
    const deleted = { ...bookings[index] };
    
    try {
      // Import notification service dynamically to avoid circular dependency
      const { notificationService } = await import('@/services/api/notificationService');
      
      // Remove booking first, then refund credit
      bookings.splice(index, 1);
      
      // Create booking cancellation notification
      await notificationService.createBookingCancellation(deleted);
      
      // Refund credit after successful deletion
      await creditService.addCredit(1);
      
      // Notify availability change
      const event = safeCustomEvent('facilityAvailabilityChanged', {
        detail: { facilityId: facilityId, change: 1 }
      });
      if (event) {
        window.dispatchEvent(event);
      }
      
      return deleted;
    } catch (error) {
      // If credit refund fails, restore the booking
      bookings.splice(index, 0, deleted);
      throw new Error(`Failed to delete booking: ${error.message}`);
    }
  },

  async checkIn(id) {
    await delay(500);
    try {
      const bookingIndex = bookings.findIndex(b => b.Id === parseInt(id));
      if (bookingIndex === -1) {
        throw new Error('Booking not found');
      }

      const booking = bookings[bookingIndex];
      if (booking.isCheckedIn) {
        throw new Error('Already checked in');
      }

      bookings[bookingIndex] = {
        ...booking,
        isCheckedIn: true
      };

      safeCustomEvent('bookingUpdated', { booking: bookings[bookingIndex] });
      return bookings[bookingIndex];
    } catch (error) {
      throw new Error(`Failed to check in: ${error.message}`);
    }
  },

  async transferBooking(bookingId, newFamilyMemberId) {
    await delay(300);
    
    try {
      const bookingIndex = bookings.findIndex(b => b.Id === parseInt(bookingId));
      if (bookingIndex === -1) {
        throw new Error('Booking not found');
      }

      const booking = bookings[bookingIndex];
      if (booking.status !== 'confirmed') {
        throw new Error('Only confirmed bookings can be transferred');
      }

      if (booking.familyMemberId === parseInt(newFamilyMemberId)) {
        throw new Error('Booking is already assigned to this family member');
      }

      // Update the booking with new family member
      bookings[bookingIndex] = {
        ...booking,
        familyMemberId: parseInt(newFamilyMemberId)
      };

      // Import notification service dynamically
      const { notificationService } = await import('@/services/api/notificationService');
      
      // Create transfer notification
      await notificationService.create({
        type: 'booking_transferred',
        title: 'Booking Transferred',
        message: `${booking.facilityName} booking on ${booking.date} has been transferred`,
        actionUrl: '/my-bookings',
        facilityId: booking.facilityId,
        bookingId: booking.Id
      });

      return { ...bookings[bookingIndex] };
    } catch (error) {
      throw new Error(`Failed to transfer booking: ${error.message}`);
    }
  }
};