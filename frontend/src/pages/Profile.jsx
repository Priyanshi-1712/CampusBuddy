import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Car, Trash2, LogOut } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [activity, setActivity] = useState({ listings: [], rides: [] });
  const email = localStorage.getItem("userEmail") || "Guest";
  const userName = localStorage.getItem("userName") || "Student";

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/my-activity/${email}`)
      .then(res => res.json())
      .then(data => setActivity(data));
  }, [email]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 pt-24">
      <div className="max-w-4xl mx-auto">
        {/* User Header */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-black">
              {userName[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">{userName}</h1>
              <p className="text-slate-500">{email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded-xl transition">
            <LogOut size={20} /> Logout
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* My Marketplace Items */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
            <h2 className="flex items-center gap-2 text-lg font-bold mb-4 text-slate-800">
              <Package className="text-blue-500" /> My Listings
            </h2>
            <div className="space-y-3">
              {activity.listings.length === 0 ? <p className="text-slate-400 text-sm italic">No items posted.</p> : 
                activity.listings.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                    <span className="font-medium text-slate-700">{item.title}</span>
                    <span className="text-blue-600 font-bold">₹{item.price}</span>
                  </div>
                ))
              }
            </div>
          </div>

          {/* My Ride Offers */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
            <h2 className="flex items-center gap-2 text-lg font-bold mb-4 text-slate-800">
              <Car className="text-green-500" /> My Ride Offers
            </h2>
            <div className="space-y-3">
              {activity.rides.length === 0 ? <p className="text-slate-400 text-sm italic">No rides offered.</p> : 
                activity.rides.map(ride => (
                  <div key={ride.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                    <span className="font-medium text-slate-700">{ride.destination}</span>
                    <span className="text-slate-400 text-xs">{ride.seats_available} seats left</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;