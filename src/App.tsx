import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CookieConsent } from "@/components/consent/CookieConsent";
import Landing from "./pages/Landing";
import DemoPage from "./pages/DemoPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import Dashboard from "./pages/Dashboard";
import LinksPage from "./pages/LinksPage";
import SocialPage from "./pages/SocialPage";
import AppearancePage from "./pages/AppearancePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import WalletPage from "./pages/WalletPage";
import ReferralsPage from "./pages/ReferralsPage";
import SettingsPage from "./pages/SettingsPage";
import MonetizationPage from "./pages/MonetizationPage";
import CommunityPage from "./pages/CommunityPage";
import EditProfilePage from "./pages/EditProfilePage";
import SubscribersPage from "./pages/SubscribersPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminVerify from "./pages/AdminVerify";
import SecurityPage from "./pages/SecurityPage";
import ProfilePage from "./pages/ProfilePage";
import AdRedirectPage from "./pages/AdRedirectPage";
import DynamicRulesPage from "./pages/DynamicRulesPage";
import AIStudioPage from "./pages/AIStudioPage";
import RevenuePage from "./pages/RevenuePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <ThemeToggle />
        <Toaster />
        <Sonner />
        <CookieConsent />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/ad-redirect" element={<AdRedirectPage />} />
            
            {/* Protected creator routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/links" element={<ProtectedRoute><LinksPage /></ProtectedRoute>} />
            <Route path="/dashboard/social" element={<ProtectedRoute><SocialPage /></ProtectedRoute>} />
            <Route path="/dashboard/appearance" element={<ProtectedRoute><AppearancePage /></ProtectedRoute>} />
            <Route path="/dashboard/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/dashboard/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
            <Route path="/dashboard/referrals" element={<ProtectedRoute><ReferralsPage /></ProtectedRoute>} />
            <Route path="/dashboard/monetization" element={<ProtectedRoute><MonetizationPage /></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/dashboard/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
            <Route path="/dashboard/subscribers" element={<ProtectedRoute><SubscribersPage /></ProtectedRoute>} />
            <Route path="/dashboard/rules" element={<ProtectedRoute><DynamicRulesPage /></ProtectedRoute>} />
            <Route path="/dashboard/ai" element={<ProtectedRoute><AIStudioPage /></ProtectedRoute>} />
            <Route path="/dashboard/revenue" element={<ProtectedRoute><RevenuePage /></ProtectedRoute>} />
            
            {/* Admin routes */}
            <Route path="/admin/verify" element={<AdminVerify />} />
            <Route path="/admin/security" element={<AdminRoute><SecurityPage /></AdminRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            
            {/* Public profile page - must be after other routes */}
            <Route path="/:username" element={<ProfilePage />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;