import { apiService } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { 
  MonthlyRevenueData, 
  GuestTypeData, 
  PerformanceMetrics, 
  CollectionStats, 
  AnalyticsTrends, 
  DashboardAnalytics 
} from '../types/api';

export class AnalyticsApiService {
  private apiService = apiService;

  /**
   * Get comprehensive dashboard analytics data
   */
  async getDashboardData(): Promise<DashboardAnalytics> {
    console.log('🔍 AnalyticsApiService.getDashboardData called');
    console.log('🔍 API endpoint:', API_ENDPOINTS.ANALYTICS.DASHBOARD);

    const result = await this.apiService.get<DashboardAnalytics>(
      API_ENDPOINTS.ANALYTICS.DASHBOARD
    );
    
    console.log('🔍 Raw API result:', result);
    
    // Handle backend API response structure: { status: 200, data: {...} }
    if (result.data) {
      return result.data;
    }
    
    return result;
  }

  /**
   * Get monthly revenue data for charts
   */
  async getMonthlyRevenue(): Promise<MonthlyRevenueData[]> {
    console.log('🔍 AnalyticsApiService.getMonthlyRevenue called');
    console.log('🔍 API endpoint:', API_ENDPOINTS.ANALYTICS.MONTHLY_REVENUE);

    const result = await this.apiService.get<MonthlyRevenueData[]>(
      API_ENDPOINTS.ANALYTICS.MONTHLY_REVENUE
    );
    
    console.log('🔍 Raw API result:', result);
    
    // Handle backend API response structure - return ONLY real data
    if (result.data) {
      return Array.isArray(result.data) ? result.data : [result.data];
    }
    
    return Array.isArray(result) ? result : [result];
  }

  /**
   * Get student status distribution data
   */
  async getGuestTypeData(): Promise<GuestTypeData[]> {
    // Return hostel-relevant student status distribution
    // This can be updated to call a real API endpoint when available
    return [
      { name: "Active Students", value: 78, color: "#07A64F" },
      { name: "Pending Configuration", value: 15, color: "#1295D0" },
      { name: "Graduated/Inactive", value: 7, color: "#FF6B6B" },
    ];
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    console.log('🔍 AnalyticsApiService.getPerformanceMetrics called');
    console.log('🔍 API endpoint:', API_ENDPOINTS.ANALYTICS.PERFORMANCE_METRICS);

    const result = await this.apiService.get<PerformanceMetrics>(
      API_ENDPOINTS.ANALYTICS.PERFORMANCE_METRICS
    );
    
    console.log('🔍 Raw API result:', result);
    
    // Handle backend API response structure
    if (result.data) {
      return result.data;
    }
    
    return result;
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats(): Promise<CollectionStats> {
    try {
      const performanceMetrics = await this.getPerformanceMetrics();
      
      // Return only real data from API
      return {
        collectionRate: performanceMetrics.collectionRate || 0,
        totalCollected: 0, // Will be calculated from real payment data when available
        totalOutstanding: 0, // Will be calculated from real invoice data when available
      };
    } catch (error) {
      console.error('Error getting collection stats:', error);
      return {
        collectionRate: 0,
        totalCollected: 0,
        totalOutstanding: 0,
      };
    }
  }

  /**
   * Calculate trends from monthly data - DISABLED for production
   */
  async calculateTrends(): Promise<AnalyticsTrends> {
    // Return zero trends - no percentage calculations needed
    return {
      revenueGrowth: 0,
      bookingGrowth: 0,
      occupancyGrowth: 0,
    };
  }

  /**
   * Get all analytics data (comprehensive)
   */
  async getAllAnalytics(): Promise<DashboardAnalytics> {
    return this.getDashboardData();
  }
}

// Export singleton instance
export const analyticsApiService = new AnalyticsApiService();