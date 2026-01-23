
import React, { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LanguageSwitcher from './components/header/LanguageSwitcher';

// Route-based code splitting for better performance
const Index = React.lazy(() => import("./pages/Index"));
const Auth = React.lazy(() => import("./pages/Auth"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const MentorsLecturers = React.lazy(() => import("./pages/MentorsLecturers"));

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
          <BrowserRouter>
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
              </div>
            }>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/mentors-lecturers" element={<MentorsLecturers />} />

              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
  </LanguageProvider>
);

export default App;
