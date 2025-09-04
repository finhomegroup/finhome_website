
import React, { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminLayout } from "@/components/layouts/AdminLayout";

// Mixed approach - lazy load some heavy components, direct import others
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Events from "./pages/Events";
import Mentors from "./pages/Mentors";
import NotFound from "./pages/NotFound";

// Lazy load heavier admin components to avoid circular deps
const CreateCampaign = React.lazy(() => import("./pages/CreateCampaign"));
const CampaignDetail = React.lazy(() => import("./pages/CampaignDetail"));
const PersonalCampaigns = React.lazy(() => import("./pages/PersonalCampaigns"));
const MentorProfile = React.lazy(() => import("./pages/MentorProfile"));
const LecturerProfile = React.lazy(() => import("./pages/LecturerProfile"));

const Admin = React.lazy(() => import("./pages/Admin"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const TrackingStartups = React.lazy(() => import("./pages/TrackingStartups"));
const MentorsLecturers = React.lazy(() => import("./pages/MentorsLecturers"));
const CourseCurriculum = React.lazy(() => import("./pages/CourseCurriculum"));
const UsersManagement = React.lazy(() => import("./pages/UsersManagement"));
const EntrepreneurshipPage = React.lazy(() => import("./pages/Entrepreneurship"));
const IncubationProgramPage = React.lazy(() => import("./pages/IncubationProgram"));


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
          }>
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
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
