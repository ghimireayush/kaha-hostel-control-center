
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { studentService } from "@/services/studentService.js";
import { invoiceService } from "@/services/invoiceService.js";
import { paymentService } from "@/services/paymentService.js";
import { ledgerService } from "@/services/ledgerService.js";

export const Dashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalCollected: 0,
    totalDues: 0,
    thisMonthCollection: 0,
    advanceBalances: 0,
    collectionRate: 0,
    overdueInvoices: 0
  });
  const [highestDueStudents, setHighestDueStudents] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  // Fetch real data from APIs
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from all services
      const [studentStats, invoiceStats, paymentStats, ledgerStats] = await Promise.all([
        studentService.getStudentStats(),
        invoiceService.getInvoiceStats(),
        paymentService.getPaymentStats(),
        ledgerService.getLedgerStats()
      ]);

      // Calculate dashboard metrics from real data
      const dashboardStats = {
        totalStudents: studentStats.total || 0,
        activeStudents: studentStats.active || 0,
        totalCollected: paymentStats.totalAmount || 0,
        totalDues: invoiceStats.outstandingAmount || 0,
        thisMonthCollection: paymentStats.monthlyAmount || 0,
        advanceBalances: ledgerStats.advanceAmount || (ledgerStats.totalCredits - ledgerStats.totalDebits) || 0,
        collectionRate: invoiceStats.collectionRate || 0,
        overdueInvoices: invoiceStats.overdueInvoices || 0
      };

      setStats(dashboardStats);

      // Get students with highest dues (from ledger stats)
      const studentsWithDues = await getStudentsWithHighestDues();
      setHighestDueStudents(studentsWithDues);

      // Get recent activities (from ledger recent entries)
      const activities = transformLedgerToActivities(ledgerStats.recentEntries || []);
      setRecentActivities(activities);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  // Get students with highest outstanding balances
  const getStudentsWithHighestDues = async () => {
    try {
      const students = await studentService.getAllStudents();
      const studentsWithDues = [];
      
      for (const student of students.slice(0, 3)) { // Get top 3
        try {
          const balance = await ledgerService.getStudentBalance(student.id);
          if (balance.rawBalance > 0) { // Only students with outstanding dues
            studentsWithDues.push({
              id: student.id,
              name: student.name,
              room: student.roomNumber,
              overdue: calculateOverduePeriod(balance.lastEntryDate),
              due: balance.currentBalance,
              months: calculateOverdueMonths(balance.lastEntryDate)
            });
          }
        } catch (error) {
          console.error(`Error fetching balance for student ${student.id}:`, error);
        }
      }
      
      return studentsWithDues.sort((a, b) => b.due - a.due).slice(0, 3);
    } catch (error) {
      console.error('Error fetching students with dues:', error);
      return [];
    }
  };

  // Transform ledger entries to activity format
  const transformLedgerToActivities = (ledgerEntries) => {
    return ledgerEntries.slice(0, 4).map((entry, index) => ({
      id: index + 1,
      student: entry.studentName || 'Unknown Student',
      type: entry.type.toLowerCase(),
      amount: entry.debit || entry.credit || 0,
      time: calculateTimeAgo(entry.createdAt),
      status: getActivityStatus(entry.type)
    }));
  };

  // Helper functions
  const calculateOverduePeriod = (lastEntryDate) => {
    if (!lastEntryDate) return 'Unknown';
    const daysDiff = Math.floor((new Date() - new Date(lastEntryDate)) / (1000 * 60 * 60 * 24));
    const months = Math.floor(daysDiff / 30);
    return months > 0 ? `${months} month${months > 1 ? 's' : ''}` : `${daysDiff} days`;
  };

  const calculateOverdueMonths = (lastEntryDate) => {
    if (!lastEntryDate) return 0;
    const daysDiff = Math.floor((new Date() - new Date(lastEntryDate)) / (1000 * 60 * 60 * 24));
    return Math.floor(daysDiff / 30);
  };

  const calculateTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const daysDiff = Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
    if (daysDiff === 0) return 'Today';
    if (daysDiff === 1) return '1 day ago';
    return `${daysDiff} days ago`;
  };

  const getActivityStatus = (type) => {
    const statusMap = {
      'Payment': 'completed',
      'Invoice': 'generated',
      'Discount': 'applied',
      'Adjustment': 'received'
    };
    return statusMap[type] || 'completed';
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#1295D0]" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Real-time Sync Status */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-[#231F20]">📊 Ledger Dashboard</h2>
          <div className="flex items-center space-x-2 mt-2">
            <div className="h-2 w-2 bg-[#07A64F] rounded-full animate-pulse"></div>
            <span className="text-sm text-[#07A64F]">Live sync active • Last updated: now</span>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button className="bg-[#1295D0] hover:bg-[#1295D0]/90 text-white border-0">
            📝 Generate Monthly Invoices
          </Button>
          <Button variant="outline" className="border-[#07A64F]/30 text-[#07A64F] hover:bg-[#07A64F]/10">
            💰 Bulk Payment Entry
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards with Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-[#1295D0] to-[#1295D0]/80 text-white relative overflow-hidden border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex justify-between items-center">
              Total Students
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                👥 Manage
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalStudents}</div>
            <p className="text-white/80 text-sm">Active residents</p>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
        </Card>

        <Card className="bg-gradient-to-r from-[#07A64F] to-[#07A64F]/80 text-white relative overflow-hidden border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex justify-between items-center">
              Total Collected
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                📊 Reports
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₨{stats.totalCollected.toLocaleString()}</div>
            <p className="text-white/80 text-sm">All time collection</p>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white relative overflow-hidden border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex justify-between items-center">
              Outstanding Dues
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                🚨 Follow Up
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₨{stats.totalDues.toLocaleString()}</div>
            <p className="text-red-100 text-sm">{stats.overdueInvoices} overdue invoices</p>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
        </Card>

        <Card className="bg-gradient-to-r from-[#1295D0]/80 to-[#07A64F]/80 text-white relative overflow-hidden border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₨{stats.thisMonthCollection.toLocaleString()}</div>
            <p className="text-white/80 text-sm">Current month progress</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-[#07A64F]/80 to-[#1295D0]/80 text-white relative overflow-hidden border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Advance Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₨{stats.advanceBalances.toLocaleString()}</div>
            <p className="text-white/80 text-sm">Student prepayments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-[#1295D0] to-[#07A64F] text-white relative overflow-hidden border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.collectionRate}%</div>
            <p className="text-white/80 text-sm">Monthly avg collection</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Enhanced Highest Due Students with Actions */}
        <Card className="border-red-200/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-[#231F20]">
              <span className="flex items-center">
                🚨 Highest Due Students
              </span>
              <Button size="sm" variant="outline" className="border-[#1295D0]/30 text-[#1295D0] hover:bg-[#1295D0]/10">
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highestDueStudents.map((student, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-red-50 rounded-lg border border-red-100 hover:border-red-200 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{student.name}</div>
                    <div className="text-sm text-gray-500">Room: {student.room}</div>
                    <div className="text-xs text-red-600 mt-1">
                      {student.months} month{student.months > 1 ? 's' : ''} overdue
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive" className="mb-2">
                      ₨{student.due.toLocaleString()}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                        💰 Pay
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                        📋 Ledger
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Recent Activities with Status */}
        <Card className="border-[#1295D0]/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-[#231F20]">
              <span className="flex items-center">
                🕒 Recent Activities
              </span>
              <Button size="sm" variant="outline" className="border-[#1295D0]/30 text-[#1295D0] hover:bg-[#1295D0]/10">
                Activity Log
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span>
                        {activity.type === 'payment' && '💰'} 
                        {activity.type === 'invoice' && '🧾'} 
                        {activity.type === 'discount' && '🏷️'}
                        {activity.type === 'advance' && '⬆️'}
                      </span>
                      <span className="font-medium text-gray-900">{activity.student}</span>
                      <Badge 
                        variant={activity.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {activity.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{activity.time}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">₨{activity.amount.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 capitalize">{activity.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Panel */}
      <Card className="border-[#07A64F]/20">
        <CardHeader>
          <CardTitle className="text-[#231F20]">⚡ Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col space-y-2 bg-[#1295D0] hover:bg-[#1295D0]/90 text-white border-0 shadow-lg">
              <span className="text-2xl">📝</span>
              <span className="text-sm">Create Invoice</span>
            </Button>
            <Button className="h-20 flex-col space-y-2 bg-[#07A64F] hover:bg-[#07A64F]/90 text-white border-0 shadow-lg">
              <span className="text-2xl">💰</span>
              <span className="text-sm">Record Payment</span>
            </Button>
            <Button className="h-20 flex-col space-y-2 bg-gradient-to-r from-[#1295D0] to-[#07A64F] hover:from-[#1295D0]/90 hover:to-[#07A64F]/90 text-white border-0 shadow-lg">
              <span className="text-2xl">👥</span>
              <span className="text-sm">Add Student</span>
            </Button>
            <Button className="h-20 flex-col space-y-2 bg-gradient-to-r from-[#07A64F] to-[#1295D0] hover:from-[#07A64F]/90 hover:to-[#1295D0]/90 text-white border-0 shadow-lg">
              <span className="text-2xl">📊</span>
              <span className="text-sm">View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
