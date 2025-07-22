
import { useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { LanguageToggle } from "@/components/admin/LanguageToggle";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { KahaLogo } from "@/components/ui/KahaLogo";

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

export const MainLayout = ({ children, activeTab }: MainLayoutProps) => {
  const { translations } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} onTabChange={(tab) => {
        // Handle navigation based on tab
        switch (tab) {
          case 'dashboard':
            navigate('/');
            break;
          case 'profile':
            navigate('/hostel');
            break;
          case 'bookings':
            navigate('/bookings');
            break;
          case 'rooms':
            navigate('/rooms');
            break;
          case 'analytics':
            navigate('/analytics');
            break;
          case 'settings':
            navigate('/settings');
            break;
          default:
            navigate('/');
        }
      }} />
      
      <div className="flex-1 flex flex-col">
        {/* Enhanced Modern Header */}
        <div className="bg-white shadow-lg border-b border-gray-100 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              {/* Kaha Logo and Branding */}
              <div className="flex items-center space-x-4">
                <KahaLogo size="lg" />
                <div className="border-l border-gray-300 pl-4">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-green-700 bg-clip-text text-transparent">
                    Kaha Control Center
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">Hostel Management System</p>
                </div>
              </div>
              
              {/* Enhanced Status Indicator */}
              <div className="hidden lg:flex items-center space-x-3 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                <div className="relative">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 h-3 w-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
                </div>
                <span className="text-sm text-green-700 font-semibold">System Online</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Enhanced Ledger Button */}
              <Button 
                onClick={() => navigate('/ledger')}
                className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 hover:from-green-700 hover:via-green-800 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                size="lg"
              >
                <span className="flex items-center space-x-3">
                  <div className="p-1 bg-white/20 rounded-md">
                    <span className="text-lg">📚</span>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm">Kaha KLedger</div>
                    <div className="text-xs text-green-100">Financial Hub</div>
                  </div>
                  <div className="bg-white/30 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold">
                    PRO
                  </div>
                </span>
              </Button>
              <LanguageToggle />
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
