
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bed, Plus, Edit, Trash2, Users, Wifi, Lock, Lightbulb } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";

export const RoomConfiguration = () => {
  const { translations } = useLanguage();
  const [rooms, setRooms] = useState([
    {
      id: "room-1",
      name: "Dorm A - Mixed",
      type: "Dormitory",
      bedCount: 8,
      occupancy: 6,
      gender: "Mixed",
      baseRate: 800,
      amenities: ["Wi-Fi", "Lockers", "Reading Light"],
      status: "Active"
    },
    {
      id: "room-2",
      name: "Dorm B - Female Only",
      type: "Dormitory",
      bedCount: 6,
      occupancy: 4,
      gender: "Female",
      baseRate: 900,
      amenities: ["Wi-Fi", "Lockers", "Reading Light", "Private Bathroom"],
      status: "Active"
    },
    {
      id: "room-3",
      name: "Private Room 1",
      type: "Private",
      bedCount: 2,
      occupancy: 0,
      gender: "Mixed",
      baseRate: 2500,
      amenities: ["Wi-Fi", "Private Bathroom", "AC", "TV"],
      status: "Active"
    },
    {
      id: "room-4",
      name: "Capsule Pod Section",
      type: "Capsule",
      bedCount: 12,
      occupancy: 8,
      gender: "Mixed",
      baseRate: 1200,
      amenities: ["Wi-Fi", "Personal Locker", "Reading Light", "Power Outlet"],
      status: "Maintenance"
    }
  ]);

  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: "",
    type: "Dormitory",
    bedCount: 1,
    gender: "Mixed",
    baseRate: 800,
    amenities: []
  });

  const roomTypes = ["Dormitory", "Private", "Capsule"];
  const genderOptions = ["Mixed", "Male", "Female"];
  const availableAmenities = [
    "Wi-Fi", "Lockers", "Reading Light", "Private Bathroom", 
    "AC", "TV", "Power Outlet", "Personal Locker", "Bunk Bed"
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";
      case "Maintenance":
        return "bg-yellow-100 text-yellow-700";
      case "Inactive":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleAddRoom = () => {
    const room = {
      id: `room-${Date.now()}`,
      ...newRoom,
      occupancy: 0,
      status: "Active"
    };
    setRooms([...rooms, room]);
    setNewRoom({
      name: "",
      type: "Dormitory",
      bedCount: 1,
      gender: "Mixed",
      baseRate: 800,
      amenities: []
    });
    setShowAddRoom(false);
    toast.success("Room added successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{translations.rooms}</h2>
        <Button onClick={() => setShowAddRoom(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Room
        </Button>
      </div>

      {showAddRoom && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Room</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Room Name</Label>
                <Input
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                  placeholder="e.g., Dorm A - Mixed"
                />
              </div>
              <div className="space-y-2">
                <Label>Room Type</Label>
                <Select value={newRoom.type} onValueChange={(value) => setNewRoom({...newRoom, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bed Count</Label>
                <Input
                  type="number"
                  value={newRoom.bedCount}
                  onChange={(e) => setNewRoom({...newRoom, bedCount: parseInt(e.target.value)})}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label>Gender Type</Label>
                <Select value={newRoom.gender} onValueChange={(value) => setNewRoom({...newRoom, gender: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((gender) => (
                      <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Base Rate (NPR per night)</Label>
                <Input
                  type="number"
                  value={newRoom.baseRate}
                  onChange={(e) => setNewRoom({...newRoom, baseRate: parseInt(e.target.value)})}
                  min="100"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddRoom}>Add Room</Button>
              <Button variant="outline" onClick={() => setShowAddRoom(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rooms.map((room) => (
          <Card key={room.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bed className="h-5 w-5" />
                    {room.name}
                  </CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{room.type}</Badge>
                    <Badge variant="outline">{room.gender}</Badge>
                    <Badge className={getStatusColor(room.status)}>
                      {room.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {room.bedCount} beds
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {room.occupancy}/{room.bedCount} occupied
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Base Rate</div>
                  <div className="text-xl font-bold text-blue-600">
                    Rs {room.baseRate}/night
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Amenities</div>
                  <div className="flex flex-wrap gap-1">
                    {room.amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(room.occupancy / room.bedCount) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  {Math.round((room.occupancy / room.bedCount) * 100)}% Occupancy
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
