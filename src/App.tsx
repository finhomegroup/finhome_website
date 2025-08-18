
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Events from "./pages/Events";
import Mentors from "./pages/Mentors";
import CreateCampaign from "./pages/CreateCampaign";
import CampaignDetail from "./pages/CampaignDetail";
import PersonalCampaigns from "./pages/PersonalCampaigns";
import MentorProfile from "./pages/MentorProfile";
import LecturerProfile from "./pages/LecturerProfile";
import AIChatbot from "./pages/AIChatbot";
import AdminDashboard from "./pages/AdminDashboard";
import StartupsManagement from "./pages/StartupsManagement";
import UsersManagement from "./pages/UsersManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/events" element={<Events />} />
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/create-campaign" element={<CreateCampaign />} />
            <Route path="/campaign/:id" element={<CampaignDetail />} />
            <Route path="/my-campaigns" element={<PersonalCampaigns />} />
            <Route path="/mentor-profile" element={<MentorProfile />} />
            <Route path="/lecturer-profile" element={<LecturerProfile />} />
            <Route path="/ai-chatbot" element={<AIChatbot />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="startups" element={<StartupsManagement />} />
              <Route path="users" element={<UsersManagement />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
