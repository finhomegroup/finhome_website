
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminLayout } from "@/components/layouts/AdminLayout";

// Direct imports instead of lazy loading
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Events from "./pages/Events";
import Mentors from "./pages/Mentors";
import CreateCampaign from "./pages/CreateCampaign";
import CampaignDetail from "./pages/CampaignDetail";
import PersonalCampaigns from "./pages/PersonalCampaigns";
import MentorProfile from "./pages/MentorProfile";
import LecturerProfile from "./pages/LecturerProfile";

import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import TrackingStartups from "./pages/TrackingStartups";
import MentorsLecturers from "./pages/MentorsLecturers";
import CourseCurriculum from "./pages/CourseCurriculum";
import UsersManagement from "./pages/UsersManagement";
import EntrepreneurshipPage from "./pages/Entrepreneurship";
import IncubationProgramPage from "./pages/IncubationProgram";
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
            
            {/* Admin Routes */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/dashboard" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="entrepreneurship" element={<EntrepreneurshipPage />} />
            </Route>
            <Route path="/admin/incubation" element={<AdminLayout />}>
              <Route index element={<IncubationProgramPage />} />
            </Route>
            <Route path="/admin/tracking" element={<AdminLayout />}>
              <Route index element={<TrackingStartups />} />
            </Route>
            <Route path="/admin/mentors" element={<AdminLayout />}>
              <Route index element={<MentorsLecturers />} />
              <Route path="mentor-profile" element={<MentorProfile />} />
              <Route path="lecturer-profile" element={<LecturerProfile />} />
            </Route>
            <Route path="/admin/courses" element={<AdminLayout />}>
              <Route index element={<CourseCurriculum />} />
            </Route>

            <Route path="/admin/users" element={<AdminLayout />}>
              <Route index element={<UsersManagement />} />
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
