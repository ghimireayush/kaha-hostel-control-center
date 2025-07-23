
import { MainLayout } from "@/components/layout/MainLayout";
import { SystemDashboard } from "@/components/dashboard/SystemDashboard";

const Index = () => {
  return (
    <MainLayout activeTab="dashboard">
      <SystemDashboard />
    </MainLayout>
  );
};

export default Index;
