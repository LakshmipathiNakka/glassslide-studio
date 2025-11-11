import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Editor from "./pages/Editor";
import { TestPage } from "./pages/TestPage";
import PresentationMode from "./pages/PresentationMode";
import LayoutSectionDemo from "./pages/LayoutSectionDemo";
import SmartSidebarDemo from "./pages/SmartSidebarDemo";
import FabricDemo from "./pages/FabricDemo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000, // Replaced cacheTime with gcTime
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/present/:deckId" element={<PresentationMode />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/demo/layout" element={<LayoutSectionDemo />} />
          <Route path="/demo/sidebar" element={<SmartSidebarDemo />} />
          <Route path="/demo/fabric" element={<FabricDemo />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
