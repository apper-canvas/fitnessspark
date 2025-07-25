// Mock notification data
const mockNotifications = [
  {
    Id: 1,
    type: 'booking_confirmation',
    title: 'Booking Confirmed',
    message: 'Your Pool session is confirmed for Jan 15, 7:00 AM',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    actionUrl: '/my-bookings',
    facilityId: 1,
    bookingId: 1
  },
  {
    Id: 2,
    type: 'session_reminder',
    title: 'Session Starting Soon',
    message: 'Your Gym session starts in 30 minutes at 5:00 PM',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isRead: false,
    actionUrl: '/my-bookings',
    facilityId: 3,
    bookingId: 2
  },
  {
    Id: 3,
    type: 'waitlist_available',
    title: 'Spot Available',
    message: 'A spot opened up for Tennis Court tomorrow at 2:00 PM',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    isRead: true,
    actionUrl: '/book-facility',
    facilityId: 2,
    timeSlot: '14:00'
  }
];

let notifications = [...mockNotifications];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const notificationService = {
  async getAll() {
    await delay(200);
    return notifications.map(n => ({ ...n }));
  },

  async getUnreadCount() {
    await delay(100);
    return notifications.filter(n => !n.isRead).length;
  },

  async markAsRead(id) {
    await delay(150);
    const notification = notifications.find(n => n.Id === parseInt(id));
    if (notification) {
notification.isRead = true;
      // Dispatch custom event for real-time updates
      if (typeof window !== 'undefined' && window.CustomEvent) {
        window.dispatchEvent(new window.CustomEvent('notificationUpdated', {
          detail: { type: 'markRead', notificationId: id }
        }));
      }
      return { ...notification };
    }
    throw new Error('Notification not found');
  },

  async markAllAsRead() {
    await delay(200);
notifications.forEach(n => n.isRead = true);
    if (typeof window !== 'undefined' && window.CustomEvent) {
      window.dispatchEvent(new window.CustomEvent('notificationUpdated', {
        detail: { type: 'markAllRead' }
      }));
    }
    return { success: true };
  },

  async delete(id) {
    await delay(150);
    const index = notifications.findIndex(n => n.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Notification not found');
    }
    
const deleted = notifications.splice(index, 1)[0];
    if (typeof window !== 'undefined' && window.CustomEvent) {
      window.dispatchEvent(new window.CustomEvent('notificationUpdated', {
        detail: { type: 'delete', notificationId: id }
      }));
    }
    return { ...deleted };
  },

  async create(notificationData) {
    await delay(100);
    const maxId = notifications.length > 0 ? Math.max(...notifications.map(n => n.Id)) : 0;
    const newNotification = {
      Id: maxId + 1,
      timestamp: new Date().toISOString(),
      isRead: false,
      ...notificationData
    };
    
    notifications.unshift(newNotification);
// Dispatch event for real-time updates
    if (typeof window !== 'undefined' && window.CustomEvent) {
      window.dispatchEvent(new window.CustomEvent('notificationUpdated', {
        detail: { type: 'create', notification: { ...newNotification } }
      }));
    }
    
    return { ...newNotification };
  },

  // Helper methods for specific notification types
  async createBookingConfirmation(bookingData) {
    return this.create({
      type: 'booking_confirmation',
      title: 'Booking Confirmed',
      message: `Your ${bookingData.facilityName} session is confirmed for ${bookingData.date}, ${bookingData.startTime}`,
      actionUrl: '/my-bookings',
      facilityId: bookingData.facilityId,
      bookingId: bookingData.Id
    });
  },

  async createBookingCancellation(bookingData) {
    return this.create({
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `Your ${bookingData.facilityName} session on ${bookingData.date} has been cancelled`,
      actionUrl: '/book-facility',
      facilityId: bookingData.facilityId
    });
  },

  async createSessionReminder(bookingData) {
    return this.create({
      type: 'session_reminder',
      title: 'Session Starting Soon',
      message: `Your ${bookingData.facilityName} session starts in 30 minutes`,
      actionUrl: '/my-bookings',
      facilityId: bookingData.facilityId,
      bookingId: bookingData.Id
    });
  },

  async createWaitlistUpdate(facilityData, timeSlot) {
    return this.create({
      type: 'waitlist_available',
      title: 'Spot Available',
      message: `A spot opened up for ${facilityData.name} at ${timeSlot}`,
      actionUrl: '/book-facility',
      facilityId: facilityData.Id,
      timeSlot: timeSlot
    });
  }
};

export { notificationService };