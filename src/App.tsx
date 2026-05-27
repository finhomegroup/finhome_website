
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LanguageSwitcher from './components/header/LanguageSwitcher';

// Import all pages directly (no lazy loading)
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import MentorsLecturers from "./pages/MentorsLecturers";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";

// Note: Uncomment these when the corresponding page files are created
// const CampaignDetail = React.lazy(() => import("./pages/CampaignDetail"));
// const MentorProfile = React.lazy(() => import("./pages/MentorProfile"));
// const LecturerProfile = React.lazy(() => import("./pages/LecturerProfile"));
// const TrackingStartups = React.lazy(() => import("./pages/TrackingStartups"));
// const CourseCurriculum = React.lazy(() => import("./pages/CourseCurriculum"));


const queryClient = new QueryClient();

const App = () => (
  <LanguageProvider>
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/mentors-lecturers" element={<MentorsLecturers />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />


              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
  </LanguageProvider>
);

export default App;
