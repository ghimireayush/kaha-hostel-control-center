
import { MainLayout } from "@/components/layout/MainLayout";
import { Dashboard } from "@/components/admin/Dashboard";

const Index = () => {
  return (
    <MainLayout activeTab="dashboard">
      <Dashboard />
    </MainLayout>
  );
};

export default Index;
