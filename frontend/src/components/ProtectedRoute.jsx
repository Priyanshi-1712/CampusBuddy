import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if user is logged in
  const isAuthenticated = localStorage.getItem("userEmail");

  if (!isAuthenticated) {
    // If not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // If logged in, show the requested page
  return children;
};

export default ProtectedRoute;
