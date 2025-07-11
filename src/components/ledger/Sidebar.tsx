
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const menuItems = [
    {
      id: "dashboard",
      label: "📊 Dashboard",
      description: "Overview & Stats"
    },
    {
      id: "students",
      label: "👥 Student Management",
      description: "Profiles & Fee Setup"
    },
    {
      id: "invoices",
      label: "🧾 Invoice Management",
      description: "Generate & Track Bills"
    },
    {
      id: "payments",
      label: "💰 Payment Recording",
      description: "Log & Apply Payments"
    },
    {
      id: "ledger",
      label: "📋 Student Ledger",
      description: "Individual Ledger View"
    },
    {
      id: "discounts",
      label: "🏷️ Discount Management",
      description: "Manage Discounts & Offers"
    }
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-gray-800">Navigation</h2>
      </div>
      
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "w-full text-left p-3 rounded-lg transition-colors",
              "hover:bg-gray-100",
              activeTab === item.id
                ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                : "text-gray-700"
            )}
          >
            <div className="font-medium">{item.label}</div>
            <div className="text-xs text-gray-500 mt-1">{item.description}</div>
          </button>
        ))}
      </nav>
    </div>
  );
};
