import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, MapPin, Clock, Users } from 'lucide-react';
import ChatBox from '../components/ChatBox';

const RideDashboard = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [selectedReceiver, setSelectedReceiver] = useState(null);
  const currentUser = localStorage.getItem("userEmail");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/rides")
      .then(res => res.json())
      .then(data => setRides(data));
  }, []);

  const handleBookSeat = async (rideId, currentSeats, rideOwner) => {
    if (currentUser === rideOwner) {
      alert("You are the driver of this ride!");
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/rides/${rideId}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booker_email: currentUser })
      });

      const result = await response.json();
      if (response.ok) {
        alert("🚗 Seat Reserved! You can now message the driver for the pickup location.");
        window.location.reload();
      } else {
        alert(result.detail || "Booking failed");
      }
    } catch (err) {
      alert("Server error. Is your backend running?");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 pt-24">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-slate-800">RideBuddy</h1>
          <button onClick={() => navigate("/post-ride")} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">+ Offer Ride</button>
        </div>

        <div className="grid gap-6">
          {rides.map(ride => (
            <div key={ride.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-800">
                  <MapPin className="text-blue-600" size={20} />
                  <h3 className="text-xl font-bold">To: {ride.destination}</h3>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1 font-bold text-blue-600">
                    <Clock size={16} /> {new Date(ride.departure_time).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Users size={16} /> {ride.seats_available} seats left
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right mr-4">
                  <p className="text-2xl font-black text-slate-900">₹{ride.price_per_seat}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {ride.owner !== currentUser && (
                    <button
                      onClick={() => {
                        setSelectedReceiver(ride.owner);
                        setShowChat(true);
                      }}
                      className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition"
                      title="Chat with Driver"
                    >
                      <MessageCircle size={20} />
                    </button>
                  )}

                  {ride.owner === currentUser ? (
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-4 py-3 rounded-xl">My Listing</span>
                  ) : (
                    <button
                      onClick={() => handleBookSeat(ride.id, ride.seats_available, ride.owner)}
                      className={`px-6 py-3 rounded-xl text-sm font-bold transition ${ride.seats_available > 0 ? 'bg-slate-900 text-white hover:bg-black' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                      disabled={ride.seats_available <= 0}
                    >
                      {ride.seats_available > 0 ? "Book Seat" : "Full"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showChat && (
        <ChatBox
          receiverEmail={selectedReceiver}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default RideDashboard;