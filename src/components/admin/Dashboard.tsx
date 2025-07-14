
import { 
  Users, 
  DollarSign, 
  Calendar, 
  TrendingUp,
  Bed,
  Building,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { useAppContext } from "@/contexts/AppContext";
import { useNavigation } from "@/hooks/useNavigation";

export const Dashboard = () => {
  const { translations } = useLanguage();
  const { state } = useAppContext();
  const { goToBookings, goToLedger, goToStudentLedger } = useNavigation();

  // Calculate real-time statistics
  const totalStudents = state.students.length;
  const activeStudents = state.students.filter(s => s.status === 'Active').length;
  const pendingBookings = state.bookingRequests.filter(r => r.status === 'Pending').length;
  const totalDues = state.students.reduce((sum, s) => sum + (s.currentBalance || 0), 0);
  const totalAdvances = state.students.reduce((sum, s) => sum + (s.advanceBalance || 0), 0);
  const paidInvoices = state.invoices.filter(i => i.status === 'Paid').length;
  const totalRevenue = state.invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.total, 0);

  const occupancyRate = totalStudents > 0 ? ((activeStudents / 100) * 100).toFixed(1) : "0";

  const stats = [
    {
      title: "Total Students",
      value: totalStudents.toString(),
      change: `${activeStudents} active`,
      icon: Users,
      color: "text-blue-600",
      onClick: () => goToLedger('students')
    },
    {
      title: "Total Revenue",
      value: `Rs ${totalRevenue.toLocaleString()}`,
      change: `${paidInvoices} paid invoices`,
      icon: DollarSign,
      color: "text-green-600",
      onClick: () => goToLedger('invoices')
    },
    {
      title: "Pending Bookings",
      value: pendingBookings.toString(),
      change: "Needs approval",
      icon: Calendar,
      color: "text-orange-600",
      onClick: goToBookings
    },
    {
      title: "Occupancy Rate",
      value: `${occupancyRate}%`,
      change: `${totalStudents}/100 beds`,
      icon: TrendingUp,
      color: "text-purple-600"
    }
  ];

  // Get students with highest dues
  const studentsWithDues = state.students
    .filter(s => s.currentBalance > 0)
    .sort((a, b) => b.currentBalance - a.currentBalance)
    .slice(0, 4);

  // Get recent bookings
  const recentBookings = state.bookingRequests
    .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
    .slice(0, 4);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index} 
              className={`hover:shadow-lg transition-all cursor-pointer ${stat.onClick ? 'hover:scale-105' : ''}`}
              onClick={stat.onClick}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students with Outstanding Dues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Outstanding Dues (Rs {totalDues.toLocaleString()})
              </span>
              <Button variant="outline" size="sm" onClick={() => goToLedger('payments')}>
                Record Payments
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentsWithDues.length > 0 ? (
                studentsWithDues.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-600">Room: {student.roomNumber}</p>
                      <p className="text-sm text-gray-600">Phone: {student.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600 text-lg">
                        Rs {student.currentBalance.toLocaleString()}
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => goToStudentLedger(student.id)}
                        className="mt-2"
                      >
                        View Ledger
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>All students are up to date with payments!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Booking Requests
              </span>
              <Button variant="outline" size="sm" onClick={goToBookings}>
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{booking.name}</p>
                      <p className="text-sm text-gray-600">Requested: {new Date(booking.requestDate).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">Preferred: {booking.preferredRoom}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{booking.id}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <p>No recent booking requests</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => goToLedger('students')}
            >
              <Users className="h-6 w-6" />
              Manage Students
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => goToLedger('invoices')}
            >
              <DollarSign className="h-6 w-6" />
              Generate Invoices
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => goToLedger('payments')}
            >
              <Calendar className="h-6 w-6" />
              Record Payments
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={goToBookings}
            >
              <Bed className="h-6 w-6" />
              Review Bookings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
