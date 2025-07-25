const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize user with 10 credits
let userCredits = 10;

// Mock membership data
let membershipStatus = {
  status: 'active',
  renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  joinDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString() // 180 days ago
};

// Mock usage history
let usageHistory = [
  {
    id: 1,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'booking',
    description: 'Gym - Main Floor booking',
    credits: -1,
    balance: 9
  },
  {
    id: 2,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'purchase',
    description: 'Purchased 10 credit package',
    credits: 10,
    balance: 10
  },
  {
    id: 3,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'booking',
    description: 'Swimming Pool booking',
    credits: -1,
    balance: 0
  }
];

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
    
    // Add to usage history
    const historyEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      type: 'booking',
      description: 'Facility booking',
      credits: -amount,
      balance: userCredits
    };
    usageHistory.unshift(historyEntry);
    
    return userCredits;
  },

  async addCredits(amount) {
    await delay(200);
    userCredits += amount;
    
    // Add to usage history
    const historyEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      type: 'purchase',
      description: `Added ${amount} credits`,
      credits: amount,
      balance: userCredits
    };
    usageHistory.unshift(historyEntry);
    
    return userCredits;
  },

  async getMembershipStatus() {
    await delay(150);
    return { ...membershipStatus };
  },

  async getUsageHistory() {
    await delay(200);
    return [...usageHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async purchaseCredits(amount, price) {
    await delay(1000); // Simulate payment processing
    
    // Simulate payment success (90% success rate)
    if (Math.random() < 0.1) {
      throw new Error('Payment processing failed. Please try again.');
    }
    
    userCredits += amount;
    
    // Add to usage history
    const historyEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      type: 'purchase',
      description: `Purchased ${amount} credit package for $${price}`,
      credits: amount,
      balance: userCredits
    };
    usageHistory.unshift(historyEntry);
    
    return {
      success: true,
      newBalance: userCredits,
      transactionId: `TXN-${Date.now()}`
    };
  },

  async updateMembershipStatus(newStatus) {
    await delay(200);
    membershipStatus = { ...membershipStatus, ...newStatus };
    return membershipStatus;
  }
};