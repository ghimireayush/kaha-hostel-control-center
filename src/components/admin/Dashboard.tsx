
import { 
  Users, 
  DollarSign, 
  Calendar, 
  TrendingUp,
  Bed,
  Building,
  MapPin
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";

export const Dashboard = () => {
  const { translations } = useLanguage();

  const stats = [
    {
      title: translations.occupancyRate,
      value: "78.5%",
      change: "+12%",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: translations.totalRevenue,
      value: "Rs 2,45,000",
      change: "+8%",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: translations.totalBookings,
      value: "156",
      change: "+15%",
      icon: Calendar,
      color: "text-orange-600"
    },
    {
      title: translations.avgDailyRate,
      value: "Rs 1,200",
      change: "+5%",
      icon: TrendingUp,
      color: "text-purple-600"
    }
  ];

  const recentBookings = [
    { id: "BK001", guest: "Rajesh Sharma", checkIn: "2024-01-15", checkOut: "2024-01-18", status: "confirmed", amount: "Rs 3,600" },
    { id: "BK002", guest: "Sarah Johnson", checkIn: "2024-01-16", checkOut: "2024-01-20", status: "pending", amount: "Rs 4,800" },
    { id: "BK003", guest: "Maya Gurung", checkIn: "2024-01-17", checkOut: "2024-01-19", status: "confirmed", amount: "Rs 2,400" },
    { id: "BK004", guest: "David Miller", checkIn: "2024-01-18", checkOut: "2024-01-22", status: "confirmed", amount: "Rs 4,800" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {translations.recentBookings}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{booking.guest}</p>
                    <p className="text-sm text-gray-600">{booking.checkIn} to {booking.checkOut}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{booking.amount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Hostel Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bed className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Total Beds</span>
                </div>
                <span className="text-xl font-bold text-blue-600">24</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">Current Guests</span>
                </div>
                <span className="text-xl font-bold text-orange-600">18</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Location</span>
                </div>
                <span className="font-medium text-green-600">Thamel, Kathmandu</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
