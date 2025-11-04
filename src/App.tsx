import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Editor from "./pages/Editor";
import { TestPage } from "./pages/TestPage";
import PresentationMode from "./pages/PresentationMode";
import LayoutSectionDemo from "./pages/LayoutSectionDemo";
import SmartSidebarDemo from "./pages/SmartSidebarDemo";
import FabricDemo from "./pages/FabricDemo";
import NotFound from "./pages/NotFound";
import Login from "./components/auth/Login";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/present/:deckId" element={<PresentationMode />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/demo/layout" element={<LayoutSectionDemo />} />
          <Route path="/demo/sidebar" element={<SmartSidebarDemo />} />
          <Route path="/demo/fabric" element={<FabricDemo />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
