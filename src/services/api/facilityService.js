import facilitiesData from "@/services/mockData/facilities.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let facilities = [...facilitiesData];

export const facilityService = {
  async getAll() {
    await delay(300);
    return [...facilities];
  },

async getById(id) {
    await delay(200);
    const facility = facilities.find(f => f.Id === parseInt(id));
    if (!facility) {
      throw new Error("Facility not found");
    }
    return { ...facility };
  },

  async getDetailedById(id) {
    await delay(300);
    const facility = facilities.find(f => f.Id === parseInt(id));
    if (!facility) {
      throw new Error("Facility not found");
    }
    return { ...facility };
  },

  async create(facilityData) {
    await delay(400);
    const maxId = facilities.length > 0 ? Math.max(...facilities.map(f => f.Id)) : 0;
    const newFacility = {
      Id: maxId + 1,
      ...facilityData
    };
    facilities.push(newFacility);
    return { ...newFacility };
  },

  async update(id, updateData) {
    await delay(300);
    const index = facilities.findIndex(f => f.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Facility not found");
    }
    facilities[index] = { ...facilities[index], ...updateData };
    return { ...facilities[index] };
  },

  async delete(id) {
    await delay(250);
    const index = facilities.findIndex(f => f.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Facility not found");
    }
    const deleted = facilities.splice(index, 1)[0];
    return { ...deleted };
  }
};