
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Dashboard = () => {
  // Mock data - in real app, this would come from API
  const stats = {
    totalStudents: 156,
    totalCollected: 450000,
    totalDues: 85000,
    thisMonthCollection: 120000
  };

  const highestDueStudents = [
    { name: "Ram Sharma", room: "A-101", due: 15000 },
    { name: "Sita Poudel", room: "B-205", due: 12500 },
    { name: "Hari Thapa", room: "C-301", due: 10000 }
  ];

  const recentActivities = [
    { type: "payment", student: "Ram Sharma", amount: 8000, time: "2 hours ago" },
    { type: "invoice", student: "Sita Poudel", amount: 12000, time: "4 hours ago" },
    { type: "discount", student: "Hari Thapa", amount: 2000, time: "1 day ago" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <div className="flex space-x-2">
          <Button>📝 Quick Invoice</Button>
          <Button variant="outline">💰 Record Payment</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalStudents}</div>
            <p className="text-blue-100 text-sm">Active residents</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₨{stats.totalCollected.toLocaleString()}</div>
            <p className="text-green-100 text-sm">All time collection</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Dues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₨{stats.totalDues.toLocaleString()}</div>
            <p className="text-red-100 text-sm">Pending payments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₨{stats.thisMonthCollection.toLocaleString()}</div>
            <p className="text-purple-100 text-sm">Monthly collection</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Highest Due Students */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              🚨 Highest Due Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highestDueStudents.map((student, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-gray-500">Room: {student.room}</div>
                  </div>
                  <Badge variant="destructive">₨{student.due.toLocaleString()}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              🕒 Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">
                      {activity.type === 'payment' && '💰'} 
                      {activity.type === 'invoice' && '🧾'} 
                      {activity.type === 'discount' && '🏷️'} 
                      {activity.student}
                    </div>
                    <div className="text-sm text-gray-500">{activity.time}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">₨{activity.amount.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 capitalize">{activity.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
