
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export const Dashboard = () => {
  // Mock data - in real app, this would come from API with real-time updates
  const stats = {
    totalStudents: 156,
    totalCollected: 450000,
    totalDues: 85000,
    thisMonthCollection: 120000,
    advanceBalances: 25000,
    overdueInvoices: 12
  };

  const highestDueStudents = [
    { name: "Ram Sharma", room: "A-101", due: 15000, months: 2 },
    { name: "Sita Poudel", room: "B-205", due: 12500, months: 1 },
    { name: "Hari Thapa", room: "C-301", due: 10000, months: 3 }
  ];

  const recentActivities = [
    { type: "payment", student: "Ram Sharma", amount: 8000, time: "2 hours ago", status: "completed" },
    { type: "invoice", student: "Sita Poudel", amount: 12000, time: "4 hours ago", status: "generated" },
    { type: "discount", student: "Hari Thapa", amount: 2000, time: "1 day ago", status: "applied" },
    { type: "advance", student: "Maya Gurung", amount: 15000, time: "2 days ago", status: "received" }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Real-time Sync Status */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Ledger Dashboard</h2>
          <div className="flex items-center space-x-2 mt-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600">Live sync active • Last updated: now</span>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button className="bg-blue-600 hover:bg-blue-700">
            📝 Generate Monthly Invoices
          </Button>
          <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
            💰 Bulk Payment Entry
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards with Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white relative overflow-hidden">
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
            <p className="text-blue-100 text-sm">Active residents</p>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white relative overflow-hidden">
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
            <p className="text-green-100 text-sm">All time collection</p>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white relative overflow-hidden">
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

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₨{stats.thisMonthCollection.toLocaleString()}</div>
            <p className="text-purple-100 text-sm">Current month progress</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Advance Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₨{stats.advanceBalances.toLocaleString()}</div>
            <p className="text-yellow-100 text-sm">Student prepayments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">84%</div>
            <p className="text-teal-100 text-sm">Monthly avg collection</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Enhanced Highest Due Students with Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                🚨 Highest Due Students
              </span>
              <Button size="sm" variant="outline">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                🕒 Recent Activities
              </span>
              <Button size="sm" variant="outline">
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
      <Card>
        <CardHeader>
          <CardTitle>⚡ Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col space-y-2 bg-blue-600 hover:bg-blue-700">
              <span className="text-2xl">📝</span>
              <span className="text-sm">Create Invoice</span>
            </Button>
            <Button className="h-20 flex-col space-y-2 bg-green-600 hover:bg-green-700">
              <span className="text-2xl">💰</span>
              <span className="text-sm">Record Payment</span>
            </Button>
            <Button className="h-20 flex-col space-y-2 bg-purple-600 hover:bg-purple-700">
              <span className="text-2xl">👥</span>
              <span className="text-sm">Add Student</span>
            </Button>
            <Button className="h-20 flex-col space-y-2 bg-orange-600 hover:bg-orange-700">
              <span className="text-2xl">📊</span>
              <span className="text-sm">View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
