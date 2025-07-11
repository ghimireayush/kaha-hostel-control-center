
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
import { Card, CardContent } from "@/components/ui/card";

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
      case "settings":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600">Settings panel coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        {/* Enhanced Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {translations.adminPanel}
              </h1>
              {/* Quick Ledger Access Badge */}
              <div className="hidden md:flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">Ledger System Active</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Enhanced Ledger Button */}
              <Button 
                onClick={() => navigate('/ledger')}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
                size="lg"
              >
                <span className="flex items-center space-x-2">
                  <span>📚</span>
                  <span className="font-semibold">Open Kaha KLedger</span>
                  <div className="bg-white/20 px-2 py-1 rounded text-xs">NEW</div>
                </span>
              </Button>
              <LanguageToggle />
            </div>
          </div>
          
          {/* Quick Stats Bar */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 font-medium">Total Students</div>
              <div className="text-xl font-bold text-blue-700">156</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 font-medium">Monthly Collection</div>
              <div className="text-xl font-bold text-green-700">₨4,50,000</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <div className="text-sm text-yellow-600 font-medium">Outstanding Dues</div>
              <div className="text-xl font-bold text-yellow-700">₨85,000</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-600 font-medium">Active Rooms</div>
              <div className="text-xl font-bold text-purple-700">89/100</div>
            </div>
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
