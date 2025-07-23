
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import Index from "./pages/Index";
import Ledger from "./pages/Ledger";
import HostelProfile from "./pages/HostelProfile";
import BookingRequests from "./pages/BookingRequests";
import RoomManagement from "./pages/RoomManagement";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import AdminCharging from "./pages/AdminCharging";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/hostel" element={<HostelProfile />} />
            <Route path="/bookings" element={<BookingRequests />} />
            <Route path="/rooms" element={<RoomManagement />} />
            <Route path="/ledger" element={<Ledger />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin/charging" element={<AdminCharging />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
