import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<CreateAdProof />} />
          <Route path="/ad-builder" element={<AdBuilder />} />
          <Route path="/carousel-builder" element={<CarouselBuilder />} />
          <Route path="/pmax-builder" element={<PerformanceMaxBuilder />} />
          <Route path="/create/:platform/:format" element={<Dashboard />} />
          <Route path="/campaign/:campaignId" element={<CampaignDetail />} />
          <Route path="/campaign/:campaignId/builder" element={<CampaignBuilder />} />
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
