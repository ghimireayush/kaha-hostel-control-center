
import { useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { Dashboard } from "@/components/admin/Dashboard";
import { HostelProfile } from "@/components/admin/HostelProfile";
import { BookingManagement } from "@/components/admin/BookingManagement";
import { RoomConfiguration } from "@/components/admin/RoomConfiguration";
import { Analytics } from "@/components/admin/Analytics";
import { LanguageToggle } from "@/components/admin/LanguageToggle";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { language, translations } = useLanguage();
  const navigate = useNavigate();

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "profile":
        return <HostelProfile />;
      case "bookings":
        return <BookingManagement />;
      case "rooms":
        return <RoomConfiguration />;
      case "analytics":
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {translations.adminPanel}
          </h1>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => navigate('/ledger')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              📚 Open Kaha KLedger
            </Button>
            <LanguageToggle />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Index;
