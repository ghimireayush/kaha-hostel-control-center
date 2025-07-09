
import { useState } from "react";

const translations = {
  en: {
    adminPanel: "Admin Panel",
    dashboard: "Dashboard",
    hostelProfile: "Hostel Profile",
    bookings: "Bookings",
    rooms: "Rooms",
    analytics: "Analytics",
    settings: "Settings",
    occupancyRate: "Occupancy Rate",
    totalRevenue: "Total Revenue",
    totalBookings: "Total Bookings",
    averageRate: "Average Rate",
    recentBookings: "Recent Bookings",
    hostelName: "Hostel Name",
    address: "Address",
    phone: "Phone",
    email: "Email",
    description: "Description",
    amenities: "Amenities",
    checkIn: "Check-in",
    checkOut: "Check-out",
    guest: "Guest",
    room: "Room",
    dates: "Dates",
    status: "Status",
    amount: "Amount",
    confirmed: "Confirmed",
    pending: "Pending",
    cancelled: "Cancelled",
    checkedIn: "Checked In",
    checkedOut: "Checked Out"
  },
  ne: {
    adminPanel: "प्रशासन प्यानल",
    dashboard: "ड्यासबोर्ड",
    hostelProfile: "होस्टल प्रोफाइल",
    bookings: "बुकिंग",
    rooms: "कोठा",
    analytics: "विश्लेषण",
    settings: "सेटिंग",
    occupancyRate: "कब्जा दर",
    totalRevenue: "कुल आम्दानी",
    totalBookings: "कुल बुकिंग",
    averageRate: "औसत दर",
    recentBookings: "हालका बुकिंग",
    hostelName: "होस्टलको नाम",
    address: "ठेगाना",
    phone: "फोन",
    email: "इमेल",
    description: "विवरण",
    amenities: "सुविधाहरू",
    checkIn: "चेक-इन",
    checkOut: "चेक-आउट",
    guest: "अतिथि",
    room: "कोठा",
    dates: "मितिहरू",
    status: "स्थिति",
    amount: "रकम",
    confirmed: "पुष्टि भएको",
    pending: "पेन्डिङ",
    cancelled: "रद्द गरिएको",
    checkedIn: "चेक-इन भएको",
    checkedOut: "चेक-आउट भएको"
  }
};

export const useLanguage = () => {
  const [language, setLanguage] = useState<"en" | "ne">("en");

  const toggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "ne" : "en");
  };

  return {
    language,
    toggleLanguage,
    translations: translations[language]
  };
};
