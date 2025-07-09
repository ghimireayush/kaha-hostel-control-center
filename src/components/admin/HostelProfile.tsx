
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, MapPin, Phone, Mail, Star } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";

export const HostelProfile = () => {
  const { translations } = useLanguage();
  const [formData, setFormData] = useState({
    hostelName: "Himalayan Backpackers Hostel",
    ownerName: "Ramesh Shrestha",
    email: "ramesh@himalayanhostel.com",
    phone: "+977-9841234567",
    address: "Thamel Marg, Ward No. 26",
    province: "Bagmati",
    district: "Kathmandu",
    description: "A cozy hostel in the heart of Thamel, perfect for backpackers and adventure seekers."
  });

  const provinces = [
    "Koshi", "Madhesh", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim"
  ];

  const amenities = [
    { id: "wifi", label: "Free WiFi", checked: true },
    { id: "laundry", label: "Laundry Service", checked: true },
    { id: "kitchen", label: "Common Kitchen", checked: true },
    { id: "rooftop", label: "Rooftop Access", checked: false },
    { id: "lockers", label: "Lockers", checked: true },
    { id: "ac", label: "Air Conditioning", checked: false },
    { id: "breakfast", label: "Free Breakfast", checked: false },
    { id: "parking", label: "Parking", checked: true },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Hostel profile updated successfully!");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {translations.hostelProfile}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="hostelName">{translations.hostelName}</Label>
                <Input
                  id="hostelName"
                  value={formData.hostelName}
                  onChange={(e) => setFormData({...formData, hostelName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerName">{translations.ownerName}</Label>
                <Input
                  id="ownerName"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{translations.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{translations.phone}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">{translations.province}</Label>
                <Select value={formData.province} onValueChange={(value) => setFormData({...formData, province: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">{translations.district}</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => setFormData({...formData, district: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">{translations.address}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{translations.description}</Label>
              <Textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="space-y-4">
              <Label>{translations.amenities}</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {amenities.map((amenity) => (
                  <div key={amenity.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={amenity.id}
                      defaultChecked={amenity.checked}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor={amenity.id} className="text-sm">
                      {amenity.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {translations.save}
              </Button>
              <Button type="button" variant="outline">
                {translations.cancel}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
