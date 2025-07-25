import bookingsData from "@/services/mockData/bookings.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
    const maxId = bookings.length > 0 ? Math.max(...bookings.map(b => b.Id)) : 0;
    const newBooking = {
      Id: maxId + 1,
      ...bookingData
    };
    bookings.push(newBooking);
    return { ...newBooking };
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
    const deleted = bookings.splice(index, 1)[0];
    return { ...deleted };
  }
};