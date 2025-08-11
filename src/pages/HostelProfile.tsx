
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, Phone, Mail, Wifi, Car, Utensils, Shirt, Shield, Clock, Save } from "lucide-react";

const HostelProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [hostelData, setHostelData] = useState({
    name: "Kaha Hostel",
    description: "A premium hostel providing comfortable accommodation for students and travelers in the heart of Kathmandu.",
    address: "Thamel, Kathmandu, Nepal",
    phone: "+977-1-4123456",
    email: "info@kahahostel.com",
    website: "www.kahahostel.com",
    establishedYear: "2020",
    totalRooms: 25,
    totalBeds: 100,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    policies: [
      "No smoking in rooms",
      "Quiet hours: 10 PM - 7 AM",
      "No outside guests after 10 PM",
      "Payment due on 1st of every month"
    ],
    amenities: [
      { name: "Free Wi-Fi", icon: Wifi, available: true },
      { name: "Parking", icon: Car, available: true },
      { name: "Laundry Service", icon: Shirt, available: true, price: 1500 },
      { name: "Meal Service", icon: Utensils, available: true, price: 8000 },
      { name: "24/7 Security", icon: Shield, available: true },
    ],
    roomTypes: [
      { type: "Single Room", basePrice: 15000, beds: 1, available: 5 },
      { type: "Shared Room", basePrice: 12000, beds: 2, available: 8 },
      { type: "Dormitory", basePrice: 8000, beds: 6, available: 12 }
    ]
  });

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
    console.log("Saving hostel data:", hostelData);
  };

  return (
    <MainLayout activeTab="profile">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">🏢 Hostel Profile</h2>
            <p className="text-gray-600 mt-1">Manage your hostel information and settings</p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                ✏️ Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Basic Information */}
        <Card className="max-w-2xl mx-auto border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="bg-gradient-to-r from-[#07A64F] to-[#1295D0] text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Building className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Basic Information</h3>
                <p className="text-white/80 text-sm">Essential hostel details</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div>
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Hostel Name</Label>
              <Input
                id="name"
                value={hostelData.name}
                onChange={(e) => setHostelData({...hostelData, name: e.target.value})}
                disabled={!isEditing}
                className="mt-2 border-gray-200 focus:border-[#07A64F] focus:ring-[#07A64F]"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</Label>
              <Textarea
                id="description"
                value={hostelData.description}
                onChange={(e) => setHostelData({...hostelData, description: e.target.value})}
                disabled={!isEditing}
                rows={4}
                className="mt-2 border-gray-200 focus:border-[#07A64F] focus:ring-[#07A64F]"
              />
            </div>
            <div>
              <Label htmlFor="address" className="text-sm font-semibold text-gray-700">Address</Label>
              <Input
                id="address"
                value={hostelData.address}
                onChange={(e) => setHostelData({...hostelData, address: e.target.value})}
                disabled={!isEditing}
                className="mt-2 border-gray-200 focus:border-[#07A64F] focus:ring-[#07A64F]"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone</Label>
                <Input
                  id="phone"
                  value={hostelData.phone}
                  onChange={(e) => setHostelData({...hostelData, phone: e.target.value})}
                  disabled={!isEditing}
                  className="mt-2 border-gray-200 focus:border-[#07A64F] focus:ring-[#07A64F]"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
                <Input
                  id="email"
                  value={hostelData.email}
                  onChange={(e) => setHostelData({...hostelData, email: e.target.value})}
                  disabled={!isEditing}
                  className="mt-2 border-gray-200 focus:border-[#07A64F] focus:ring-[#07A64F]"
                />
              </div>
            </div>
          </CardContent>
        </Card>


      </div>
    </MainLayout>
  );
};

export default HostelProfile;
