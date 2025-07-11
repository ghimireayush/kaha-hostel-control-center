
import { useState } from "react";
import { Sidebar } from "@/components/ledger/Sidebar";
import { Dashboard } from "@/components/ledger/Dashboard";
import { StudentManagement } from "@/components/ledger/StudentManagement";
import { InvoiceManagement } from "@/components/ledger/InvoiceManagement";
import { PaymentRecording } from "@/components/ledger/PaymentRecording";
import { StudentLedgerView } from "@/components/ledger/StudentLedgerView";
import { DiscountManagement } from "@/components/ledger/DiscountManagement";
import { useLanguage } from "@/hooks/useLanguage";

const Ledger = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { language, translations } = useLanguage();

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "students":
        return <StudentManagement />;
      case "invoices":
        return <InvoiceManagement />;
      case "payments":
        return <PaymentRecording />;
      case "ledger":
        return <StudentLedgerView />;
      case "discounts":
        return <DiscountManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">📚</div>
            <h1 className="text-2xl font-bold text-gray-900">
              Kaha KLedger
            </h1>
          </div>
          <div className="text-sm text-gray-500">
            Hostel Billing Management System
          </div>
        </div>
        
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Ledger;
