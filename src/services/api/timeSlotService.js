import timeSlotsData from "@/services/mockData/timeSlots.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let timeSlots = [...timeSlotsData];

// Generate time slots for multiple dates
const generateTimeSlotsForDateRange = (startDate, days = 7) => {
  const slots = [];
  const facilities = [1, 2, 3, 4, 5]; // Facility IDs
  const timeSlotTemplates = [
    { startTime: "06:00", endTime: "07:00" },
    { startTime: "07:00", endTime: "08:00" },
    { startTime: "08:00", endTime: "09:00" },
    { startTime: "09:00", endTime: "10:00" },
    { startTime: "10:00", endTime: "11:00" },
    { startTime: "11:00", endTime: "12:00" },
    { startTime: "12:00", endTime: "13:00" },
    { startTime: "13:00", endTime: "14:00" },
    { startTime: "14:00", endTime: "15:00" },
    { startTime: "15:00", endTime: "16:00" },
    { startTime: "16:00", endTime: "17:00" },
    { startTime: "17:00", endTime: "18:00" },
    { startTime: "18:00", endTime: "19:00" },
    { startTime: "19:00", endTime: "20:00" },
    { startTime: "20:00", endTime: "21:00" }
  ];

  let idCounter = timeSlotsData.length > 0 ? Math.max(...timeSlotsData.map(ts => ts.Id)) + 1 : 1;

  for (let dayOffset = 0; dayOffset < days; dayOffset++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + dayOffset);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Skip if we already have data for this date
    const existingForDate = timeSlotsData.filter(slot => slot.date === dateStr);
    if (existingForDate.length > 0) {
      slots.push(...existingForDate);
      continue;
    }

    facilities.forEach(facilityId => {
      timeSlotTemplates.forEach(template => {
        // Create some realistic availability pattern (70% available)
        const isAvailable = Math.random() > 0.3;
        
        slots.push({
          Id: idCounter++,
          facilityId,
          startTime: template.startTime,
          endTime: template.endTime,
          date: dateStr,
          isAvailable
        });
      });
    });
  }

  return slots;
};

export const timeSlotService = {
  async getAll() {
    await delay(300);
    // Generate slots for 7 days starting from today if we don't have enough data
    const today = new Date();
    const generatedSlots = generateTimeSlotsForDateRange(today, 7);
    
    // Merge with existing data, preferring existing data
    const allSlots = [...timeSlotsData];
    generatedSlots.forEach(generatedSlot => {
      const exists = allSlots.find(existing => 
        existing.facilityId === generatedSlot.facilityId &&
        existing.date === generatedSlot.date &&
        existing.startTime === generatedSlot.startTime
      );
      if (!exists) {
        allSlots.push(generatedSlot);
      }
    });
    
    return allSlots;
  },

  async getByDateRange(startDate, endDate) {
    await delay(300);
    const start = startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate;
    const end = endDate instanceof Date ? endDate.toISOString().split('T')[0] : endDate;
    
    const allSlots = await this.getAll();
    return allSlots.filter(slot => slot.date >= start && slot.date <= end);
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