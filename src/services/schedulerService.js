import { billingService } from './billingService.js';

export const schedulerService = {
  // Initialize the billing scheduler
  init() {
    console.log('🕐 Billing Scheduler initialized');
    
    // Check if today is 1st of month and run billing
    this.checkAndRunMonthlyBilling();
    
    // Set up daily check (in real app, this would be a proper cron job)
    this.setupDailyCheck();
  },

  // Check if today is 1st of month and run billing
  async checkAndRunMonthlyBilling() {
    const today = new Date();
    const isFirstOfMonth = today.getDate() === 1;
    
    if (isFirstOfMonth) {
      console.log('📅 Today is 1st of the month - Running automatic billing...');
      try {
        const generatedInvoices = await billingService.generateMonthlyInvoices(today);
        console.log(`✅ Monthly billing completed: ${generatedInvoices.length} invoices generated`);
        return generatedInvoices;
      } catch (error) {
        console.error('❌ Monthly billing failed:', error);
        return [];
      }
    } else {
      console.log(`📅 Today is ${today.getDate()}${this.getOrdinalSuffix(today.getDate())} - Next billing on 1st of next month`);
      return [];
    }
  },

  // Setup daily check (simulated - in real app use proper cron)
  setupDailyCheck() {
    // Check every hour if it's a new day and 1st of month
    setInterval(() => {
      this.checkAndRunMonthlyBilling();
    }, 60 * 60 * 1000); // Check every hour
    
    console.log('⏰ Daily billing check scheduled');
  },

  // Get ordinal suffix for dates (1st, 2nd, 3rd, etc.)
  getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  },

  // Manual trigger for testing
  async triggerMonthlyBilling(month, year) {
    console.log(`🔧 Manual trigger: Generating invoices for ${month}/${year}`);
    return await billingService.triggerMonthlyBilling(month, year);
  },

  // Get next billing date
  getNextBillingDate() {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return nextMonth;
  },

  // Get billing status
  getBillingStatus() {
    const today = new Date();
    const nextBilling = this.getNextBillingDate();
    const daysUntilBilling = Math.ceil((nextBilling - today) / (1000 * 60 * 60 * 24));
    
    return {
      today: today.toDateString(),
      nextBillingDate: nextBilling.toDateString(),
      daysUntilBilling: daysUntilBilling,
      isFirstOfMonth: today.getDate() === 1
    };
  }
};