import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Home from '@/pages/Home';
import Apply from '@/pages/Apply';
import FounderDashboard from '@/pages/FounderDashboard';
import AdminApplications from '@/pages/AdminApplications';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Market from '@/pages/Market';
import Brands from '@/pages/Brands';
import BrandStore from '@/pages/BrandStore';
import ProductDetail from '@/pages/ProductDetail';
import Checkout from '@/pages/Checkout';
import MyOrders from '@/pages/MyOrders';
import FounderProducts from '@/pages/FounderProducts';
import FounderOrders from '@/pages/FounderOrders';
import FounderAnalytics from '@/pages/FounderAnalytics';
import FounderStorefront from '@/pages/FounderStorefront';
import FounderBilling from '@/pages/FounderBilling';
import FounderSettings from '@/pages/FounderSettings';
import { CartProvider } from '@/lib/CartContext';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/market" element={<Market />} />
      <Route path="/brands" element={<Brands />} />
      <Route path="/brand/:id" element={<BrandStore />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/apply" element={<Apply />} />
        <Route path="/founder" element={<FounderDashboard />} />
        <Route path="/founder/products" element={<FounderProducts />} />
        <Route path="/founder/orders" element={<FounderOrders />} />
        <Route path="/founder/analytics" element={<FounderAnalytics />} />
        <Route path="/founder/storefront" element={<FounderStorefront />} />
        <Route path="/founder/billing" element={<FounderBilling />} />
        <Route path="/founder/settings" element={<FounderSettings />} />
        <Route path="/admin" element={<AdminApplications />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<MyOrders />} />
      </Route>
      {/* Add your page Route elements here */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <CartProvider>
            <Router>
              <ScrollToTop />
              <AuthenticatedApp />
            </Router>
            <Toaster />
          </CartProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App