import { apiService } from './apiService';
import { API_ENDPOINTS } from '../config/api';

// Dashboard Types
export interface DashboardStats {
  totalStudents: number;
  availableRooms: number;
  monthlyRevenue: {
    value: string;
    amount: number;
  };
  pendingPayments: number;
  occupancyPercentage: number;
}

export interface RecentActivity {
  id: string;
  type: 'booking' | 'payment' | 'checkin' | 'checkout' | 'maintenance';
  message: string;
  time: string;
  timestamp: string;
  icon: string;
  color: string;
}

export interface MonthlyRevenueData {
  month: string;
  revenue: number;
  collections: number;
  pending: number;
}

export class DashboardApiService {
  private apiService = apiService;

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    console.log('📊 DashboardApiService.getDashboardStats called');
    
    const result = await this.apiService.get<DashboardStats>('/dashboard/stats');
    
    console.log('📊 Dashboard stats result:', result);
    return result;
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    console.log('📋 DashboardApiService.getRecentActivities called with limit:', limit);
    
    const queryParams = limit ? { limit } : {};
    const result = await this.apiService.get<RecentActivity[]>('/dashboard/recent-activity', queryParams);
    
    console.log('📋 Recent activities result:', result.length, 'activities found');
    return result;
  }

  /**
   * Get monthly revenue data
   */
  async getMonthlyRevenue(year: number, month: number): Promise<MonthlyRevenueData> {
    console.log('💰 DashboardApiService.getMonthlyRevenue called for:', { year, month });
    
    const result = await this.apiService.get<{ data: MonthlyRevenueData }>('/dashboard/monthly-revenue', {
      year,
      month
    });
    
    console.log('💰 Monthly revenue result:', result);
    
    // Handle the nested data structure
    if (result.data) {
      return result.data;
    }
    
    // Fallback for empty data
    return {
      month: `${year}-${month.toString().padStart(2, '0')}`,
      revenue: 0,
      collections: 0,
      pending: 0
    };
  }

  /**
   * Get dashboard overview (combines stats and recent activities)
   */
  async getDashboardOverview(): Promise<{
    stats: DashboardStats;
    recentActivities: RecentActivity[];
  }> {
    console.log('🏠 DashboardApiService.getDashboardOverview called');
    
    try {
      const [stats, recentActivities] = await Promise.all([
        this.getDashboardStats(),
        this.getRecentActivities(8)
      ]);

      return {
        stats,
        recentActivities
      };
    } catch (error) {
      console.error('❌ Error fetching dashboard overview:', error);
      throw error;
    }
  }

  /**
   * Refresh dashboard data (for real-time updates)
   */
  async refreshDashboard(): Promise<{
    stats: DashboardStats;
    recentActivities: RecentActivity[];
    timestamp: number;
  }> {
    console.log('🔄 DashboardApiService.refreshDashboard called');
    
    const overview = await this.getDashboardOverview();
    
    return {
      ...overview,
      timestamp: Date.now()
    };
  }
}

// Export singleton instance
export const dashboardApiService = new DashboardApiService();