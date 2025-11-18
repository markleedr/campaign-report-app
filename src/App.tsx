import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateAdProof from "./pages/CreateAdProof";
import AdBuilder from "./pages/AdBuilder";
import CarouselBuilder from "./pages/CarouselBuilder";
import PerformanceMaxBuilder from "./pages/PerformanceMaxBuilder";
import ProofView from "./pages/ProofView";
import CampaignDetail from "./pages/CampaignDetail";
import CampaignView from "./pages/CampaignView";
import CampaignBuilder from "./pages/CampaignBuilder";
import AdProofView from "./pages/AdProofView";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><CreateAdProof /></ProtectedRoute>} />
          <Route path="/ad-builder" element={<ProtectedRoute><AdBuilder /></ProtectedRoute>} />
          <Route path="/carousel-builder" element={<ProtectedRoute><CarouselBuilder /></ProtectedRoute>} />
          <Route path="/pmax-builder" element={<ProtectedRoute><PerformanceMaxBuilder /></ProtectedRoute>} />
          <Route path="/create/:platform/:format" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/campaign/:campaignId" element={<ProtectedRoute><CampaignDetail /></ProtectedRoute>} />
          <Route path="/campaign/:campaignId/builder" element={<ProtectedRoute><CampaignBuilder /></ProtectedRoute>} />
          <Route path="/c/:shareToken" element={<CampaignView />} />
          <Route path="/proof/:shareToken" element={<ProofView />} />
          <Route path="/ad/:adProofId" element={<AdProofView />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
