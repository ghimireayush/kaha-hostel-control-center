
import analyticsData from '../data/analytics.json';

export const analyticsService = {
  // Get monthly revenue data
  async getMonthlyRevenue() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(analyticsData.monthlyRevenue), 100);
    });
  },

  // Get guest type distribution
  async getGuestTypeData() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(analyticsData.guestTypeData), 100);
    });
  },

  // Get performance metrics
  async getPerformanceMetrics() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(analyticsData.performanceMetrics), 100);
    });
  },

  // Get collection statistics
  async getCollectionStats() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(analyticsData.collectionStats), 100);
    });
  },

  // Get comprehensive analytics data
  async getAllAnalytics() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(analyticsData), 100);
    });
  },

  // Calculate trends
  async calculateTrends() {
    return new Promise((resolve) => {
      const revenue = analyticsData.monthlyRevenue;
      const lastMonth = revenue[revenue.length - 1];
      const previousMonth = revenue[revenue.length - 2];
      
      const trends = {
        revenueGrowth: ((lastMonth.revenue - previousMonth.revenue) / previousMonth.revenue * 100).toFixed(1),
        bookingGrowth: ((lastMonth.bookings - previousMonth.bookings) / previousMonth.bookings * 100).toFixed(1),
        occupancyGrowth: ((lastMonth.occupancy - previousMonth.occupancy) / previousMonth.occupancy * 100).toFixed(1)
      };
      
      setTimeout(() => resolve(trends), 100);
    });
  }
};
