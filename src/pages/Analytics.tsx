
import { MainLayout } from "@/components/layout/MainLayout";
import { Analytics as AnalyticsComponent } from "@/components/admin/Analytics";

const Analytics = () => {
  return (
    <MainLayout activeTab="analytics">
      <AnalyticsComponent />
    </MainLayout>
  );
};

export default Analytics;
