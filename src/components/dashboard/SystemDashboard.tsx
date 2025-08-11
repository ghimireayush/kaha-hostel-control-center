import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/contexts/AppContext';
import { notificationService } from '@/services/notificationService';
import { 
  Users, 
  DollarSign, 
  Bell, 
  Gift, 
  Zap,
  Home,
  CheckCircle,
  Clock,
  Smartphone
} from 'lucide-react';

export const SystemDashboard = () => {
  const { state } = useAppContext();
  const [notificationStats, setNotificationStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const notifications = await notificationService.getNotificationStats();
      setNotificationStats(notifications);

      // Mock recent activity
      setRecentActivity([
        {
          id: 1,
          type: 'payment',
          message: 'Payment received from John Doe - NPR 8,500',
          time: '2 minutes ago',
          icon: DollarSign,
          color: 'text-green-600'
        },
        {
          id: 2,
          type: 'discount',
          message: 'Discount applied to Sarah Wilson - NPR 1,000',
          time: '15 minutes ago',
          icon: Gift,
          color: 'text-purple-600'
        },
        {
          id: 3,
          type: 'charge',
          message: 'Late fee charged to Mike Johnson - NPR 500',
          time: '1 hour ago',
          icon: Zap,
          color: 'text-orange-600'
        },
        {
          id: 4,
          type: 'notification',
          message: 'Welcome notification sent to new student',
          time: '2 hours ago',
          icon: Smartphone,
          color: 'text-blue-600'
        }
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  // Calculate key metrics with null checks
  const totalStudents = state.students?.length || 0;
  const activeStudents = state.students?.filter(s => s.status === 'Active').length || 0;
  const totalBalance = state.students?.reduce((sum, s) => sum + (s.currentBalance || 0), 0) || 0;
  const overdueStudents = state.students?.filter(s => (s.currentBalance || 0) > 0).length || 0;
  const occupancyRate = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#231F20]">🏠 Kaha Hostel Dashboard</h1>
          <p className="text-gray-600 mt-1">Complete hostel management system with integrated notifications</p>
        </div>
        <div className="flex items-center gap-2">


        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-[#1295D0]/10 to-[#1295D0]/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#1295D0] font-medium">Total Students</p>
                <p className="text-3xl font-bold text-[#1295D0]">{totalStudents}</p>
                <p className="text-xs text-[#1295D0] mt-1">{activeStudents} active</p>
              </div>
              <Users className="h-12 w-12 text-[#1295D0]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-[#07A64F]/10 to-[#07A64F]/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#07A64F] font-medium">Outstanding Balance</p>
                <p className="text-3xl font-bold text-[#07A64F]">NPR {totalBalance.toLocaleString()}</p>
                <p className="text-xs text-[#07A64F] mt-1">{overdueStudents} students</p>
              </div>
              <DollarSign className="h-12 w-12 text-[#07A64F]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-[#1295D0]/10 to-[#07A64F]/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#1295D0] font-medium">Occupancy Rate</p>
                <p className="text-3xl font-bold text-[#1295D0]">{occupancyRate}%</p>
                <p className="text-xs text-[#1295D0] mt-1">Room utilization</p>
              </div>
              <Home className="h-12 w-12 text-[#1295D0]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-[#07A64F]/10 to-[#1295D0]/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#07A64F] font-medium">Notifications Today</p>
                <p className="text-3xl font-bold text-[#07A64F]">{notificationStats?.todaySent || 0}</p>
                <p className="text-xs text-[#07A64F] mt-1">{notificationStats?.deliveryRate || 0}% delivered</p>
              </div>
              <Bell className="h-12 w-12 text-[#07A64F]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full bg-white ${activity.color}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full">
              View All Activity
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};