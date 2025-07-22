import { MainLayout } from "@/components/layout/MainLayout";
import MonthlyBillingComponent from "@/components/admin/MonthlyBillingTemp";

const MonthlyBillingPage = () => {
  return (
    <MainLayout activeTab="billing">
      <MonthlyBillingComponent />
    </MainLayout>
  );
};

export default MonthlyBillingPage;