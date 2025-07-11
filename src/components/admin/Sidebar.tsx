
import { 
  LayoutDashboard, 
  Building2, 
  CalendarCheck, 
  Bed, 
  BarChart3, 
  Settings,
  Mountain,
  BookOpen,
  Users,
  Receipt,
  CreditCard,
  FileText,
  TrendingUp
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const { translations } = useLanguage();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const mainMenuItems = [
    { id: "dashboard", label: translations.dashboard, icon: LayoutDashboard },
    { id: "profile", label: translations.hostelProfile, icon: Building2 },
    { id: "bookings", label: translations.bookings, icon: CalendarCheck },
    { id: "rooms", label: translations.rooms, icon: Bed },
    { id: "analytics", label: translations.analytics, icon: BarChart3 },
  ];

  const ledgerSubItems = [
    { id: "ledger-dashboard", label: "📊 Dashboard", icon: TrendingUp },
    { id: "ledger-students", label: "👥 Student Profiles", icon: Users },
    { id: "ledger-invoices", label: "📋 Invoices", icon: Receipt },
    { id: "ledger-payments", label: "💰 Payments", icon: CreditCard },
    { id: "ledger-ledgers", label: "📚 Ledgers", icon: FileText },
    { id: "ledger-discounts", label: "🏷️ Discounts", icon: Settings },
  ];

  const handleLedgerToggle = () => {
    if (expandedSection === "ledger") {
      setExpandedSection(null);
    } else {
      setExpandedSection("ledger");
    }
  };

  const handleLedgerSubItemClick = (subId: string) => {
    // Navigate to the ledger page with the specific section
    window.location.href = `/ledger?section=${subId.replace('ledger-', '')}`;
  };

  return (
    <div className="w-64 bg-white shadow-lg border-r min-h-screen">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <Mountain className="h-8 w-8 text-orange-500" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Kaha</h2>
            <p className="text-sm text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4 space-y-2">
        {/* Main Menu Items */}
        {mainMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === item.id
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}

        {/* Kaha Ledger Section */}
        <div className="border-t pt-4 mt-4">
          <button
            onClick={handleLedgerToggle}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
              expandedSection === "ledger"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <BookOpen className="h-5 w-5" />
            <span className="font-medium">📚 Kaha Ledger</span>
            <svg
              className={cn(
                "h-4 w-4 ml-auto transition-transform",
                expandedSection === "ledger" ? "rotate-180" : ""
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Ledger Sub-items */}
          {expandedSection === "ledger" && (
            <div className="ml-4 mt-2 space-y-1">
              {ledgerSubItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleLedgerSubItemClick(item.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Settings at the bottom */}
        <div className="border-t pt-4 mt-4">
          <button
            onClick={() => onTabChange("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "settings"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Settings className="h-5 w-5" />
            <span className="font-medium">{translations.settings}</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
