import timeSlotsData from "@/services/mockData/timeSlots.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let timeSlots = [...timeSlotsData];

export const timeSlotService = {
  async getAll() {
    await delay(300);
    return [...timeSlots];
  },

  async getById(id) {
    await delay(200);
    const timeSlot = timeSlots.find(ts => ts.Id === parseInt(id));
    if (!timeSlot) {
      throw new Error("Time slot not found");
    }
    return { ...timeSlot };
  },

  async create(timeSlotData) {
    await delay(400);
    const maxId = timeSlots.length > 0 ? Math.max(...timeSlots.map(ts => ts.Id)) : 0;
    const newTimeSlot = {
      Id: maxId + 1,
      ...timeSlotData
    };
    timeSlots.push(newTimeSlot);
    return { ...newTimeSlot };
  },

  async update(id, updateData) {
    await delay(300);
    const index = timeSlots.findIndex(ts => ts.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Time slot not found");
    }
    timeSlots[index] = { ...timeSlots[index], ...updateData };
    return { ...timeSlots[index] };
  },

  async delete(id) {
    await delay(250);
    const index = timeSlots.findIndex(ts => ts.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Time slot not found");
    }
    const deleted = timeSlots.splice(index, 1)[0];
    return { ...deleted };
  }
};