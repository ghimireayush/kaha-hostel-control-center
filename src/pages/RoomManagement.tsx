
import { MainLayout } from "@/components/layout/MainLayout";
import { RoomConfiguration } from "@/components/admin/RoomConfiguration";

const RoomManagement = () => {
  return (
    <MainLayout activeTab="rooms">
      <RoomConfiguration />
    </MainLayout>
  );
};

export default RoomManagement;
