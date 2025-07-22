import { MainLayout } from "@/components/layout/MainLayout";
import AdminCharging from "@/components/admin/AdminCharging";

const AdminChargingPage = () => {
  return (
    <MainLayout activeTab="charging">
      <AdminCharging />
    </MainLayout>
  );
};

export default AdminChargingPage;