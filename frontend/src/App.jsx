import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';
import SOSButton from './components/SOSButton';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Marketplace from './pages/Marketplace';
import RideDashboard from './pages/RideDashboard';
import Profile from './pages/Profile';
import PostItem from './pages/PostItem';
import PostRide from './pages/PostRide';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-grow pt-4">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Private Protected Routes */}
            <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
            <Route path="/post-item" element={<ProtectedRoute><PostItem /></ProtectedRoute>} />
            <Route path="/rides" element={<ProtectedRoute><RideDashboard /></ProtectedRoute>} />
            <Route path="/post-ride" element={<ProtectedRoute><PostRide /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </main>
        <SOSButton />
      </div>
    </Router>
  );
}

export default App;