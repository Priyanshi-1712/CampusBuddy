import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Toastify Imports
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Toaster } from 'react-hot-toast';

// Components
import Navbar from './components/Navbar';
import SOSButton from './components/SOSButton';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import Particles from './components/Particles';
import GlobalNotification from './components/GlobalNotification';
import TransactionLog from './components/TransactionLog';

// Pages
import LandingPage from './pages/LandingPage';
import PaymentPage from './pages/PaymentPage';
import AuthPortal from './pages/AuthPortal';
import Marketplace from './pages/Marketplace';
import RideDashboard from './pages/RideDashboard';
import Profile from './pages/Profile';
import PostItem from './pages/PostItem';
import PostRide from './pages/PostRide';
import ForgotPassword from './pages/ForgotPassword';
import MyOfferedRides from './pages/MyOfferedRides';
import Inbox from './pages/Inbox';
import MyListedItems from './pages/MyListedItems';
import Wishlist from './pages/Wishlist';
import MyBookings from './pages/MyBookings';
import MyMarketOrders from './pages/MyMarketOrders';
import HelpCenter from './pages/HelpCenter';
import AboutUs from './pages/AboutUs';
import Settings from './pages/Settings';
import ActiveRide from './pages/ActiveRide';

// Simple Page Transition Wrapper
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

function App() {
  const location = useLocation(); // Works now because main.jsx provides the context
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  // Treat Landing Page as flush (no top padding)
  const isFlushPage = isAuthPage || location.pathname === '/' || location.pathname === '/marketplace' || location.pathname === '/rides' || location.pathname === '/payment';

  useEffect(() => {
    const root = window.document.documentElement;
    const savedTheme = localStorage.getItem('theme') || 'Light';
    const applyTheme = (theme) => {
      if (theme === 'Dark') root.classList.add('dark');
      else if (theme === 'System') {
        const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', systemIsDark);
      } else root.classList.remove('dark');
    };
    applyTheme(savedTheme);
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      
      {/* Background Particles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Particles
          particleColors={["#ffffff"]}
          particleCount={200}
          speed={0.1}
          pixelRatio={window.devicePixelRatio || 1}
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen bg-transparent">
        {/* Navbar - Hidden on Auth pages and Landing Page */}
        {!isAuthPage && location.pathname !== '/' && <Navbar />}

        <main className={`flex-grow ${(!isFlushPage) ? 'pt-20' : ''}`}>
          <Toaster position="top-center" />
          <GlobalNotification />

          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* 1. PUBLIC ROUTES */}
              <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
              <Route path="/login" element={<PageTransition><AuthPortal /></PageTransition>} />
              <Route path="/signup" element={<PageTransition><AuthPortal /></PageTransition>} />
              <Route path="/help" element={<PageTransition><HelpCenter /></PageTransition>} />
              <Route path="/about" element={<PageTransition><AboutUs /></PageTransition>} />
              <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />

              {/* 2. PROTECTED ROUTES */}
              <Route path="/marketplace" element={<ProtectedRoute><PageTransition><Marketplace /></PageTransition></ProtectedRoute>} />
              <Route path="/rides" element={<ProtectedRoute><PageTransition><RideDashboard /></PageTransition></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute>} />
              <Route path="/post-item" element={<ProtectedRoute><PageTransition><PostItem /></PageTransition></ProtectedRoute>} />
              <Route path="/post-ride" element={<ProtectedRoute><PageTransition><PostRide /></PageTransition></ProtectedRoute>} />
              <Route path="/inbox" element={<ProtectedRoute><PageTransition><Inbox /></PageTransition></ProtectedRoute>} />
              <Route path="/my-bookings" element={<ProtectedRoute><PageTransition><MyBookings /></PageTransition></ProtectedRoute>} />
              <Route path="/my-market-orders" element={<ProtectedRoute><PageTransition><MyMarketOrders /></PageTransition></ProtectedRoute>} />
              <Route path="/my-offered-rides" element={<ProtectedRoute><PageTransition><MyOfferedRides /></PageTransition></ProtectedRoute>} />
              <Route path="/my-listed-items" element={<ProtectedRoute><PageTransition><MyListedItems /></PageTransition></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><PageTransition><Wishlist /></PageTransition></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><PageTransition><Settings /></PageTransition></ProtectedRoute>} />
              <Route path="/active-ride/:rideId" element={<ProtectedRoute><PageTransition><ActiveRide /></PageTransition></ProtectedRoute>} />
              <Route path="/transaction-log" element={<ProtectedRoute><PageTransition><TransactionLog /></PageTransition></ProtectedRoute>} />
              
              {/* ADDED: Missing Payment Route */}
              <Route path="/payment" element={<ProtectedRoute><PageTransition><PaymentPage /></PageTransition></ProtectedRoute>} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </main>

        {/* Footer & SOS - Hidden on Auth pages and Landing Page */}
        {!isAuthPage && location.pathname !== '/' && <Footer />}
        {!isAuthPage && location.pathname !== '/' && <SOSButton />}
      </div>

      <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />
    </div>
  );
}

export default App;