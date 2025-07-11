
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/ledger/Sidebar";
import { Dashboard } from "@/components/ledger/Dashboard";
import { StudentManagement } from "@/components/ledger/StudentManagement";
import { InvoiceManagement } from "@/components/ledger/InvoiceManagement";
import { PaymentRecording } from "@/components/ledger/PaymentRecording";
import { StudentLedgerView } from "@/components/ledger/StudentLedgerView";
import { DiscountManagement } from "@/components/ledger/DiscountManagement";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

const Ledger = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { language, translations } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle URL parameters for direct navigation
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    if (section) {
      const sectionMap: Record<string, string> = {
        'dashboard': 'dashboard',
        'students': 'students',
        'invoices': 'invoices',
        'payments': 'payments',
        'ledgers': 'ledger',
        'discounts': 'discounts'
      };
      if (sectionMap[section]) {
        setActiveTab(sectionMap[section]);
      }
    }
  }, [location.search]);

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
        {/* Enhanced Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📚</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Kaha KLedger
                </h1>
                <p className="text-sm text-gray-500">
                  Hostel Billing Management System
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Quick Actions */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveTab('invoices')}
              >
                📋 Quick Invoice
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveTab('payments')}
              >
                💰 Record Payment
              </Button>
              
              {/* Back to Admin Panel */}
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                ← Back to Admin Panel
              </Button>
            </div>
          </div>
          
          {/* Breadcrumb Navigation */}
          <div className="mt-3 flex items-center space-x-2 text-sm text-gray-500">
            <span>Admin Panel</span>
            <span>›</span>
            <span className="text-green-600 font-medium">Kaha KLedger</span>
            <span>›</span>
            <span className="capitalize text-gray-800">
              {activeTab === 'ledger' ? 'Student Ledgers' : activeTab}
            </span>
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
