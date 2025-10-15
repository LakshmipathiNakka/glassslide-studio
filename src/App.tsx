import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Editor from "./pages/Editor";
import EnhancedEditor from "./pages/EnhancedEditor";
import SimpleEnhancedEditor from "./pages/SimpleEnhancedEditor";
import ProfessionalEditor from "./pages/ProfessionalEditor";
import SimpleProfessionalEditor from "./pages/SimpleProfessionalEditor";
import TestProfessional from "./pages/TestProfessional";
import { TestPage } from "./pages/TestPage";
import EnhancedPowerPointEditor from "./pages/EnhancedPowerPointEditor";
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
          <Route path="/editor" element={<Editor />} />
          <Route path="/enhanced-editor" element={<EnhancedEditor />} />
          <Route path="/simple-enhanced" element={<SimpleEnhancedEditor />} />
          <Route path="/professional" element={<ProfessionalEditor />} />
          <Route path="/simple-professional" element={<SimpleProfessionalEditor />} />
          <Route path="/test-professional" element={<TestProfessional />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/powerpoint" element={<EnhancedPowerPointEditor />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
