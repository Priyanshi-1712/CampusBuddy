import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Used to refresh navbar when URL changes
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // This effect runs every time the page or URL changes
  useEffect(() => {
    const user = localStorage.getItem("userEmail");
    setIsLoggedIn(!!user); // true if user exists, false if not
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="text-xl font-black text-slate-800 tracking-tighter">
          CAMPUS<span className="text-blue-600">BUDDY</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex gap-8 font-bold text-slate-600">
          <Link to="/marketplace" className="hover:text-blue-600">Marketplace</Link>
          <Link to="/rides" className="hover:text-blue-600">RideBuddy</Link>
        </div>

        {/* Dynamic Buttons */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            // WHAT TO SHOW WHEN LOGGED IN
            <>
              <Link to="/profile" className="text-slate-600 font-bold hover:text-blue-600">
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-50 text-red-600 px-5 py-2 rounded-xl font-bold hover:bg-red-100 transition"
              >
                Logout
              </button>
            </>
          ) : (
            // WHAT TO SHOW WHEN LOGGED OUT
            <>
              <Link to="/login" className="text-slate-600 font-bold">Login</Link>
              <Link
                to="/signup"
                className="bg-slate-900 text-white px-5 py-2 rounded-xl font-bold hover:bg-slate-800 transition"
              >
                Join Now
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;