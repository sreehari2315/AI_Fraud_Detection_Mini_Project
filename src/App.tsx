import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import DashboardOverview from "./pages/DashboardOverview";
import TransactionLogs from "./pages/TransactionLogs";
import NewScan from "./pages/NewScan";
import RiskInsights from "./pages/RiskInsights";
import UserSettings from "./pages/UserSettings";
import { AdminLayout } from "./components/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Main App Routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<AppLayout><DashboardOverview /></AppLayout>} />
            <Route path="/transactions" element={<AppLayout><TransactionLogs /></AppLayout>} />
            <Route path="/scan" element={<AppLayout><NewScan /></AppLayout>} />
            <Route path="/insights" element={<AppLayout><RiskInsights /></AppLayout>} />
            <Route path="/settings" element={<AppLayout><UserSettings /></AppLayout>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout><AdminOverview /></AdminLayout>} />
            <Route path="/admin/analytics" element={<AdminLayout><AdminAnalytics /></AdminLayout>} />
            <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
            <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
