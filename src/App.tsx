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
import Login from "@/components/auth/Login";
import { AuthProvider } from "@/auth/AuthProvider";
import { RequireAuth } from "@/auth/RequireAuth";
import { RequirePermission } from "@/auth/RequirePermission";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Index />
                </RequireAuth>
              }
            />
            <Route path="/editor" element={<Editor />} />
            <Route path="/present/:deckId" element={<PresentationMode />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/demo/layout" element={<LayoutSectionDemo />} />
            <Route path="/demo/sidebar" element={<SmartSidebarDemo />} />
            <Route path="/demo/fabric" element={<FabricDemo />} />
            {/* Redirect unknown routes to login if not authed, else 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
