
import { 
  LayoutDashboard, 
  Building2, 
  CalendarCheck, 
  Bed, 
  BarChart3, 
  Settings,
  Mountain
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const { translations } = useLanguage();

  const menuItems = [
    { id: "dashboard", label: translations.dashboard, icon: LayoutDashboard },
    { id: "profile", label: translations.hostelProfile, icon: Building2 },
    { id: "bookings", label: translations.bookings, icon: CalendarCheck },
    { id: "rooms", label: translations.rooms, icon: Bed },
    { id: "analytics", label: translations.analytics, icon: BarChart3 },
    { id: "settings", label: translations.settings, icon: Settings },
  ];

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
        {menuItems.map((item) => {
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
      </nav>
    </div>
  );
};
