const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize user with 10 credits
let userCredits = 10;

export const creditService = {
  async getCredits() {
    await delay(100);
    return userCredits;
  },

  async deductCredit(amount = 1) {
    await delay(200);
    if (userCredits < amount) {
      throw new Error("Insufficient credits");
    }
    userCredits -= amount;
    return userCredits;
  },

  async addCredits(amount) {
    await delay(200);
    userCredits += amount;
    return userCredits;
  }
};