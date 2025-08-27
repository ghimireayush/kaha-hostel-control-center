
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Calendar, Activity, BarChart3 } from "lucide-react";
import { analyticsService } from "@/services/analyticsService";

export const Analytics = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [guestTypeData, setGuestTypeData] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [collectionStats, setCollectionStats] = useState({});
  const [trends, setTrends] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const [monthly, guestTypes, performance, collection, trendData] = await Promise.all([
        analyticsService.getMonthlyRevenue(),
        analyticsService.getGuestTypeData(),
        analyticsService.getPerformanceMetrics(),
        analyticsService.getCollectionStats(),
        analyticsService.calculateTrends()
      ]);

      setMonthlyData(monthly);
      setGuestTypeData(guestTypes);
      setPerformanceMetrics(performance);
      setCollectionStats(collection);
      setTrends(trendData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentMonth = monthlyData[monthlyData.length - 1] || {};

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#231F20] flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#07A64F] to-[#1295D0] rounded-xl">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            Monthly Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Monthly performance insights and revenue trends</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rs {(monthlyData.reduce((sum, month) => sum + (month.revenue || 0), 0) / Math.max(monthlyData.length, 1)).toLocaleString()}
                </p>
                <p className={`text-sm mt-1 ${trends.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trends.revenueGrowth >= 0 ? '+' : ''}{trends.revenueGrowth}% from last month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Monthly Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(monthlyData.reduce((sum, month) => sum + (month.bookings || 0), 0) / Math.max(monthlyData.length, 1))}
                </p>
                <p className={`text-sm mt-1 ${trends.bookingGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trends.bookingGrowth >= 0 ? '+' : ''}{trends.bookingGrowth}% from last month
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Occupancy</p>
                <p className="text-2xl font-bold text-gray-900">{currentMonth.occupancy || 0}%</p>
                <p className={`text-sm mt-1 ${trends.occupancyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trends.occupancyGrowth >= 0 ? '+' : ''}{trends.occupancyGrowth}% from last month
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                <p className="text-2xl font-bold text-gray-900">{collectionStats.collectionRate || 0}%</p>
                <p className="text-sm text-gray-600 mt-1">
                  Rs {collectionStats.totalCollected?.toLocaleString() || '0'} collected
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gray-600" />
              Monthly Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`Rs ${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#07A64F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-600" />
              Occupancy Rate Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Occupancy']} />
                <Line 
                  type="monotone" 
                  dataKey="occupancy" 
                  stroke="#1295D0" 
                  strokeWidth={3}
                  dot={{ fill: '#1295D0', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-600" />
              Guest Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={guestTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {guestTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} guests`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-600" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span className="font-medium">Average Daily Rate (ADR)</span>
                <span className="text-xl font-bold text-blue-600">
                  Rs {performanceMetrics.averageDailyRate?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="font-medium">Revenue Per Available Bed</span>
                <span className="text-xl font-bold text-green-600">
                  Rs {performanceMetrics.revenuePerBed?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                <span className="font-medium">Average Length of Stay</span>
                <span className="text-xl font-bold text-orange-600">
                  {performanceMetrics.averageLengthOfStay || '0'} days
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <span className="font-medium">Repeat Guest Rate</span>
                <span className="text-xl font-bold text-purple-600">
                  {performanceMetrics.repeatGuestRate || '0'}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
