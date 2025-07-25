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
  }
};