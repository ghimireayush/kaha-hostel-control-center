import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import React, { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, User, Calendar, DollarSign, CreditCard, TrendingUp, TrendingDown } from "lucide-react";
import { studentService } from "@/services/studentService.js";
import { mockData } from "@/data/mockData.js";



export const Dashboard = memo(() => {
  const navigate = useNavigate();
  
  // Simple state management
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    totalCollected: 0,
    totalDues: 0,
    thisMonthCollection: 0,
    advanceBalances: 0,
    overdueInvoices: 0
  });
  const [checkedOutWithDues, setCheckedOutWithDues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load students data (for future use)
        await studentService.getStudents();
        
        // Use mock dashboard stats
        setDashboardStats(mockData.dashboardStats);
        
        // Use mock checked out students with dues
        setCheckedOutWithDues(mockData.checkedOutWithDues);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Simple stats calculation
  const stats = {
    ...dashboardStats,
    checkedOutWithDues: checkedOutWithDues.length,
    checkedOutDuesAmount: checkedOutWithDues.reduce((sum, student) => sum + (student.outstandingDues || 0), 0)
  };



  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#07A64F]/5 via-[#1295D0]/5 to-[#07A64F]/5 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl shadow-black/5">
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#07A64F] to-[#1295D0] rounded-2xl flex items-center justify-center shadow-lg shadow-[#07A64F]/30">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-[#07A64F] via-[#1295D0] to-[#07A64F] bg-clip-text text-transparent tracking-tight">
                    Financial Dashboard
                  </h1>
                  <p className="text-slate-600 font-medium text-lg">
                    Real-time Analytics & Insights
                  </p>
                </div>
              </div>


            </div>


          </div>
        </div>
      </div>

      {/* Premium Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1295D0]/20 to-[#0ea5e9]/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <Card className="relative bg-white/70 backdrop-blur-xl border border-white/20 shadow-2xl shadow-[#1295D0]/10 hover:shadow-[#1295D0]/20 transition-all duration-500 group-hover:scale-[1.02] overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1295D0]/10 via-transparent to-[#0ea5e9]/10"></div>
            <CardHeader className="relative z-10 pb-2">
              <CardTitle className="text-sm font-semibold flex justify-between items-center text-slate-700">
                <span className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#1295D0] to-[#0ea5e9] rounded-xl flex items-center justify-center">
                    <span className="text-white text-sm">👥</span>
                  </div>
                  Total Students
                </span>
                <Button size="sm" variant="ghost" className="text-[#1295D0] hover:bg-[#1295D0]/10 rounded-xl">
                  Manage
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-slate-800 mb-2">{stats.totalStudents || 0}</div>
              <p className="text-slate-600 text-sm font-medium">Active residents</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#1295D0] rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-500">Live count</span>
              </div>
            </CardContent>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/20 to-transparent rounded-full -mr-16 -mt-16"></div>
          </Card>
        </div>

        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#07A64F]/20 to-[#059669]/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <Card className="relative bg-white/70 backdrop-blur-xl border border-white/20 shadow-2xl shadow-[#07A64F]/10 hover:shadow-[#07A64F]/20 transition-all duration-500 group-hover:scale-[1.02] overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#07A64F]/10 via-transparent to-[#059669]/10"></div>
            <CardHeader className="relative z-10 pb-2">
              <CardTitle className="text-sm font-semibold flex justify-between items-center text-slate-700">
                <span className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#07A64F] to-[#059669] rounded-xl flex items-center justify-center">
                    <span className="text-white text-sm">💰</span>
                  </div>
                  Total Collected
                </span>
                <Button size="sm" variant="ghost" className="text-[#07A64F] hover:bg-[#07A64F]/10 rounded-xl">
                  Reports
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-slate-800 mb-2">₨{(stats.totalCollected || 0).toLocaleString()}</div>
              <p className="text-slate-600 text-sm font-medium">All time collection</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#07A64F] rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-500">Updated now</span>
              </div>
            </CardContent>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/20 to-transparent rounded-full -mr-16 -mt-16"></div>
          </Card>
        </div>

        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <Card className="relative bg-white/70 backdrop-blur-xl border border-white/20 shadow-2xl shadow-red-500/10 hover:shadow-red-500/20 transition-all duration-500 group-hover:scale-[1.02] overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-red-600/10"></div>
            <CardHeader className="relative z-10 pb-2">
              <CardTitle className="text-sm font-semibold flex justify-between items-center text-slate-700">
                <span className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-sm">🚨</span>
                  </div>
                  Outstanding Dues
                </span>
                <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 rounded-xl">
                  Follow Up
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-slate-800 mb-2">₨{(stats.totalDues || 0).toLocaleString()}</div>
              <p className="text-slate-600 text-sm font-medium">{stats.overdueInvoices || 0} overdue invoices</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-500">Needs attention</span>
              </div>
            </CardContent>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/20 to-transparent rounded-full -mr-16 -mt-16"></div>
          </Card>
        </div>
      </div>

      {/* Students with Outstanding Dues - Compact Version */}
      {loading ? (
        <Card className="border-orange-200 bg-orange-50/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
              <span className="ml-2 text-orange-700 text-sm">Loading students with dues...</span>
            </div>
          </CardContent>
        </Card>
      ) : checkedOutWithDues && checkedOutWithDues.length > 0 ? (
        <Card className="border-orange-200/50 bg-gradient-to-br from-orange-50/30 to-red-50/30 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Students with Outstanding Dues</h3>
                  <p className="text-slate-600 text-xs">Checked out but payment pending</p>
                </div>
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 px-2 py-1 text-xs">
                  {checkedOutWithDues?.length || 0} Student{(checkedOutWithDues?.length || 0) !== 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-red-600">
                  NPR {(checkedOutWithDues || []).reduce((sum, student) => sum + (student.outstandingDues || 0), 0).toLocaleString()}
                </div>
                <div className="text-xs text-slate-500">Total Outstanding</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(checkedOutWithDues || []).map((student, index) => (
              <div key={student.studentId || index} className="bg-white/60 backdrop-blur-sm rounded-lg border border-white/50 p-4 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {student.studentName?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{student.studentName}</h4>
                      <div className="flex items-center gap-4 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {student.studentId}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {student.roomNumber}
                        </span>
                        <span>
                          Checkout: {new Date(student.checkoutDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">
                        NPR {student.outstandingDues?.toLocaleString() || '0'}
                      </div>
                      <div className="text-xs text-slate-500">Outstanding</div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-[#07A64F] to-[#059669] hover:from-[#07A64F]/90 hover:to-[#059669]/90 text-white border-0 text-xs px-3 py-1 h-8"
                        onClick={() => {
                          // Navigate to payment recording page with student pre-selected
                          navigate(`/ledger?student=${encodeURIComponent(student.studentId)}&section=payments&amount=${student.outstandingDues}&type=outstanding`);
                        }}
                      >
                        <CreditCard className="h-3 w-3 mr-1" />
                        Pay
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#1295D0]/30 text-[#1295D0] hover:bg-[#1295D0]/10 text-xs px-3 py-1 h-8"
                        onClick={() => {
                          // Navigate to ledger page with student filter
                          navigate(`/ledger?student=${encodeURIComponent(student.studentId)}&section=ledger`);
                        }}
                      >
                        📋 Ledger
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="bg-gradient-to-r from-orange-100/50 to-red-100/50 rounded-lg p-3 border border-orange-200/50 mt-4">
              <div className="flex items-center gap-2 text-xs text-orange-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">
                  These students have completed checkout but have pending dues. Follow up for payment collection.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-green-900 text-sm mb-1">No Outstanding Dues</h3>
              <p className="text-xs text-green-700">
                All checked-out students have cleared their dues.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});