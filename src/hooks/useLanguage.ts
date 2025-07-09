
import { useState } from "react";

type Language = "en" | "ne";

const translations = {
  en: {
    adminPanel: "Kaha Admin Panel",
    dashboard: "Dashboard",
    hostelProfile: "Hostel Profile",
    bookings: "Bookings",
    rooms: "Rooms & Beds",
    analytics: "Analytics",
    settings: "Settings",
    occupancyRate: "Occupancy Rate",
    totalRevenue: "Total Revenue",
    totalBookings: "Total Bookings",
    avgDailyRate: "Avg Daily Rate",
    recentBookings: "Recent Bookings",
    quickStats: "Quick Stats",
    monthlyTrends: "Monthly Trends",
    guestName: "Guest Name",
    checkIn: "Check In",
    checkOut: "Check Out",
    status: "Status",
    amount: "Amount",
    confirmed: "Confirmed",
    pending: "Pending",
    cancelled: "Cancelled",
    addHostel: "Add Hostel",
    hostelName: "Hostel Name",
    ownerName: "Owner Name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    province: "Province",
    district: "District",
    description: "Description",
    save: "Save",
    cancel: "Cancel",
    dormBeds: "Dorm Beds",
    privateBeds: "Private Beds",
    totalRooms: "Total Rooms",
    amenities: "Amenities"
  },
  ne: {
    adminPanel: "कहा एडमिन प्यानल",
    dashboard: "ड्यासबोर्ड",
    hostelProfile: "होस्टल प्रोफाइल",
    bookings: "बुकिङहरू",
    rooms: "कोठा र बेडहरू",
    analytics: "विश्लेषण",
    settings: "सेटिङहरू",
    occupancyRate: "कब्जा दर",
    totalRevenue: "कुल आम्दानी",
    totalBookings: "कुल बुकिङहरू",
    avgDailyRate: "औसत दैनिक दर",
    recentBookings: "हालका बुकिङहरू",
    quickStats: "छिटो तथ्याङ्कहरू",
    monthlyTrends: "मासिक प्रवृत्तिहरू",
    guestName: "अतिथिको नाम",
    checkIn: "चेक इन",
    checkOut: "चेक आउट",
    status: "स्थिति",
    amount: "रकम",
    confirmed: "पुष्टि गरिएको",
    pending: "पेन्डिङ",
    cancelled: "रद्द गरिएको",
    addHostel: "होस्टल थप्नुहोस्",
    hostelName: "होस्टलको नाम",
    ownerName: "मालिकको नाम",
    email: "इमेल",
    phone: "फोन",
    address: "ठेगाना",
    province: "प्रदेश",
    district: "जिल्ला",
    famil: "विवरण",
    save: "सेभ गर्नुहोस्",
    cancel: "रद्द गर्नुहोस्",
    dormBeds: "डर्म बेडहरू",
    privateBeds: "निजी बेडहरू",
    totalRooms: "कुल कोठाहरू",
    amenities: "सुविधाहरू"
  }
};

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>("en");

  const toggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "ne" : "en");
  };

  return {
    language,
    toggleLanguage,
    translations: translations[language]
  };
};
