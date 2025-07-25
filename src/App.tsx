import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import VehicleAdd from "./pages/VehicleAdd";
import VehicleRequests from "./pages/VehicleRequests";
import MechanicDashboard from "./pages/MechanicDashboard";
import NotFound from "./pages/NotFound";
import ComoFunciona from "./pages/ComoFunciona";
import ParaMecanicos from "./pages/ParaMecanicos";
import SobreNos from "./pages/SobreNos";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/como-funciona" element={<ComoFunciona />} />
          <Route path="/para-mecanicos" element={<ParaMecanicos />} />
          <Route path="/sobre-nos" element={<SobreNos />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mechanic-dashboard" element={<MechanicDashboard />} />
          <Route path="/vehicles/add" element={<VehicleAdd />} />
          <Route path="/vehicles/requests" element={<VehicleRequests />} />
          <Route path="api/hello-xano" element={<div>API Hello Test</div>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
