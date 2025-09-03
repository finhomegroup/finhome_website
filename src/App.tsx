
import React, { Suspense, Component } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminLayout } from "@/components/layouts/AdminLayout";

// Import Index directly to avoid lazy loading issues on deployment
import Index from "./pages/Index";
// Keep other pages lazy loaded
// const Index = React.lazy(() => import("./pages/Index"));
const Auth = React.lazy(() => import("./pages/Auth"));
const Events = React.lazy(() => import("./pages/Events"));
const Mentors = React.lazy(() => import("./pages/Mentors"));
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
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-white">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading VLIC...</p>
    </div>
  </div>
);

// Error Boundary class component
class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">Please refresh the page</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LoadingSpinner />}>
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
  </ErrorBoundary>
);

export default App;
