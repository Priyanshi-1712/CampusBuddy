import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // Make sure this matches the key you use in Login.jsx
    const userEmail = localStorage.getItem("userEmail");
    
    if (!userEmail) {
        // If no user is found, send them to login
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
