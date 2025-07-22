
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarCheck, Search, Filter, Eye, Edit, Trash2, Plus, Users, Clock, MapPin, Phone } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export const BookingManagement = () => {
  const { translations } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");

  const bookings = [
    {
      id: "BK001",
      guestName: "Rajesh Sharma",
      guestType: "Tourist",
      checkIn: "2024-01-15",
      checkOut: "2024-01-18",
      room: "Dorm A - Bed 3",
      status: "confirmed",
      amount: "Rs 3,600",
      phone: "+977-9841123456"
    },
    {
      id: "BK002",
      guestName: "Sarah Johnson",
      guestType: "Backpacker",
      checkIn: "2024-01-16",
      checkOut: "2024-01-20",
      room: "Private Room 2",
      status: "pending",
      amount: "Rs 4,800",
      phone: "+1-555-0123"
    },
    {
      id: "BK003",
      guestName: "Maya Gurung",
      guestType: "Student",
      checkIn: "2024-01-17",
      checkOut: "2024-01-19",
      room: "Dorm B - Bed 1",
      status: "confirmed",
      amount: "Rs 2,400",
      phone: "+977-9851234567"
    },
    {
      id: "BK004",
      guestName: "David Miller",
      guestType: "Digital Nomad",
      checkIn: "2024-01-18",
      checkOut: "2024-01-22",
      room: "Private Room 1",
      status: "confirmed",
      amount: "Rs 4,800",
      phone: "+44-20-7946-0958"
    },
    {
      id: "BK005",
      guestName: "Priya Tamang",
      guestType: "Volunteer",
      checkIn: "2024-01-19",
      checkOut: "2024-01-21",
      room: "Dorm A - Bed 5",
      status: "cancelled",
      amount: "Rs 2,400",
      phone: "+977-9861234567"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    const matchesRoom = roomFilter === "all" || booking.room.includes(roomFilter);
    
    return matchesSearch && matchesStatus && matchesRoom;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" />
            {translations.bookings}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search by guest name or booking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roomFilter} onValueChange={setRoomFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Room" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rooms</SelectItem>
                <SelectItem value="Dorm A">Dorm A</SelectItem>
                <SelectItem value="Dorm B">Dorm B</SelectItem>
                <SelectItem value="Private">Private Rooms</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Booking ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">{translations.guestName}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Guest Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">{translations.checkIn}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">{translations.checkOut}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Room</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">{translations.status}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">{translations.amount}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-blue-600">{booking.id}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{booking.guestName}</p>
                        <p className="text-sm text-gray-500">{booking.phone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{booking.guestType}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">{booking.checkIn}</td>
                    <td className="py-3 px-4 text-sm">{booking.checkOut}</td>
                    <td className="py-3 px-4 text-sm">{booking.room}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-medium">{booking.amount}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
