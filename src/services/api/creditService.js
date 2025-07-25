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

  async getActivityStats() {
    await delay(200);
    const bookingEntries = usageHistory.filter(entry => entry.type === 'booking');
    const purchaseEntries = usageHistory.filter(entry => entry.type === 'purchase');
    
    const totalSessions = bookingEntries.length;
    const totalCreditsSpent = bookingEntries.reduce((sum, entry) => sum + Math.abs(entry.credits), 0);
    const totalCreditsPurchased = purchaseEntries.reduce((sum, entry) => sum + entry.credits, 0);
    
    const now = new Date();
    const membershipDays = Math.floor((now - new Date(membershipStatus.joinDate)) / (1000 * 60 * 60 * 1000));
    
    return {
      totalSessions,
      totalCreditsSpent,
      totalCreditsPurchased,
      membershipDays,
      averageSessionsPerWeek: Math.round(totalSessions / Math.max(membershipDays / 7, 1)),
      averageCreditsPerSession: totalSessions > 0 ? Math.round(totalCreditsSpent / totalSessions) : 0
    };
  },

  async getMonthlyUsagePattern() {
    await delay(150);
    const monthlyData = {};
    const now = new Date();
    
    // Get last 6 months of data
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = month.toISOString().slice(0, 7);
      monthlyData[monthKey] = 0;
    }
    
    usageHistory
      .filter(entry => entry.type === 'booking')
      .forEach(entry => {
        const monthKey = entry.date.slice(0, 7);
        if (monthlyData.hasOwnProperty(monthKey)) {
          monthlyData[monthKey]++;
        }
      });
    
    return monthlyData;
  },

  async getPeakUsageTimes() {
    await delay(100);
    // Mock peak usage data based on common gym patterns
    return [
      { time: '07:00', sessions: 15, percentage: 25 },
      { time: '18:00', sessions: 12, percentage: 20 },
      { time: '19:00', sessions: 10, percentage: 17 }
    ];
  },

  async getAchievements() {
    await delay(100);
    const stats = await this.getActivityStats();
    const achievements = [];
    
    // Session-based achievements
    if (stats.totalSessions >= 1) {
      achievements.push({
        id: 'first_session',
        name: 'First Steps',
        description: 'Completed your first session',
        icon: 'Star',
        unlocked: true,
        unlockedDate: usageHistory.find(entry => entry.type === 'booking')?.date
      });
    }
    
    if (stats.totalSessions >= 10) {
      achievements.push({
        id: 'regular_member',
        name: 'Regular Member',
        description: 'Completed 10 sessions',
        icon: 'Trophy',
        unlocked: true
      });
    }
    
    if (stats.totalSessions >= 25) {
      achievements.push({
        id: 'fitness_enthusiast',
        name: 'Fitness Enthusiast',
        description: 'Reached 25 sessions',
        icon: 'Award',
        unlocked: true
      });
    }
    
    // Consistency achievements
    if (stats.averageSessionsPerWeek >= 3) {
      achievements.push({
        id: 'consistency_pro',
        name: 'Consistency Pro',
        description: 'Average 3+ sessions per week',
        icon: 'Target',
        unlocked: true
      });
    }
    
    // Future goals
    if (stats.totalSessions < 50) {
      achievements.push({
        id: 'half_century',
        name: 'Half Century',
        description: 'Complete 50 sessions',
        icon: 'Medal',
        unlocked: false,
        progress: stats.totalSessions,
        target: 50
      });
    }
    
    if (stats.totalSessions < 100) {
      achievements.push({
        id: 'century_club',
        name: 'Century Club',
        description: 'Join the 100 session club',
        icon: 'Crown',
        unlocked: false,
        progress: stats.totalSessions,
        target: 100
      });
    }
    
    return achievements;
  },

  async updateMembershipStatus(newStatus) {
    await delay(200);
    membershipStatus = { ...membershipStatus, ...newStatus };
    return membershipStatus;
  }
};