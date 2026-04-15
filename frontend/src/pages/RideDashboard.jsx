import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, MapPin, Clock, Users, IndianRupee, Plus, Car, X, Zap, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import ChatBox from '../components/ChatBox';

const RideDashboard = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [selectedReceiver, setSelectedReceiver] = useState(null);
  const [selectedReceiverName, setSelectedReceiverName] = useState("");
  const [selectedRideContext, setSelectedRideContext] = useState(null);

  const currentUser = localStorage.getItem("userEmail");

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const ridesRes = await fetch("http://127.0.0.1:8000/api/rides");
      const ridesData = await ridesRes.json();
      setRides(ridesData);

      const bookingsRes = await fetch(`http://127.0.0.1:8000/api/my-bookings?email=${currentUser}`);
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        const bookedIds = bookingsData.map(b => b.ride_id);
        setUserBookings(bookedIds);
      }
    } catch (err) {
      console.error("Sync error:", err);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleBookSeat = (ride) => {
    navigate('/payment', {
      state: {
        rideId: ride.id,
        price: ride.price_per_seat,
        destination: ride.destination,
        driver: ride.driver_name,
        ownerEmail: ride.owner
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 premium-bg-pattern p-6 pt-24 font-sans">
      <div className="max-w-7xl mx-auto relative z-10">

        {/* HERO SECTION - Branded Blue with Amber highlights */}
        <div className="relative overflow-hidden bg-[#05488B] border border-[#04396f] rounded-[2rem] p-8 md:p-12 mb-10 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase mb-4 tracking-widest">
                <Zap size={14} fill="currentColor" /> Campus Mobility
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                Ride <span className="text-[#FFC107]">Buddy.</span>
              </h1>
              <p className="font-bold text-blue-50 text-lg leading-snug">
                <span className="italic text-[#FFC107]">“By Students, For Students”</span>
                <br />
                <span className="text-blue-200 mt-1 inline-block text-sm font-medium uppercase">- A Network for Smarter Commuting.</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* YELLOW BG WITH BLUE TEXT STYLE */}
              <button
                onClick={() => navigate('/post-ride')}
                className="group bg-[#FFC107] border border-[#FFC107] hover:bg-[#e0a800] text-[#05488B] px-8 py-3.5 rounded-xl flex items-center justify-center gap-3 shadow-xl transition-all font-medium text-lg"
              >
                <Plus size={20} strokeWidth={2} /> Offer Ride
              </button>
              {/* BLUE BG WITH YELLOW TEXT STYLE */}
              <button
                onClick={() => navigate('/my-bookings')}
                className="bg-[#05488B] border border-[#FFC107] hover:bg-[#04396f] text-[#FFC107] px-8 py-3.5 rounded-xl transition-all shadow-lg font-medium text-lg flex items-center justify-center gap-2"
              >
                <Calendar size={18} strokeWidth={2} /> My Bookings
              </button>
            </div>
          </div>
        </div>

        {/* RIDE LISTINGS */}
        <div className="grid gap-6">
          {rides.map(ride => {
            const isOwner = ride.owner?.toLowerCase() === currentUser?.toLowerCase();
            const isBooked = userBookings.includes(ride.id);

            return (
              <div key={ride.id} className={`bg-white p-8 rounded-2xl border-2 transition-all flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm hover:shadow-xl ${isBooked ? 'border-[#FFC107] bg-blue-50/20' : 'border-slate-400/50'}`}>
                <div className="space-y-4 w-full md:w-auto">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-xl border ${isBooked ? 'bg-[#FFC107]/10 text-[#05488B] border-[#FFC107]' : 'bg-slate-50 text-[#05488B] border-slate-200'}`}>
                      <MapPin size={24} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-none mb-2">To: {ride.destination}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {isOwner ? "⭐ You are the Driver" : `Driver: ${ride.driver_name}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 shadow-sm">
                      <Clock size={14} className="text-[#05488B]" /> {new Date(ride.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`px-4 py-2 rounded-lg text-xs font-medium border shadow-sm flex items-center gap-2 ${ride.seats_available > 0 ? 'bg-white text-[#05488B] border-blue-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                      <Users size={14} /> {ride.seats_available} seats left
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto border-t md:border-t-0 pt-6 md:pt-0 md:border-l border-slate-100 md:pl-10">
                  <div className="text-center md:text-right px-4">
                    <p className="text-3xl font-black text-[#05488B] tracking-tighter flex items-center justify-center md:justify-end leading-none">
                      <IndianRupee size={22} strokeWidth={3} />{ride.price_per_seat}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Contribution</p>
                  </div>

                  <div className="flex gap-3">
                    {!isOwner && (
                      <button
                        onClick={() => {
                          if (isBooked) {
                            setSelectedRideContext({
                              destination: ride.destination,
                              departure_time: new Date(ride.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                              price: ride.price_per_seat
                            });
                            setSelectedReceiver(ride.owner);
                            setSelectedReceiverName(ride.driver_name);
                            setShowChat(true);
                          } else {
                            toast.info("🔒 Book a seat to unlock chat!");
                          }
                        }}
                        className={`p-4 rounded-xl border-2 transition-all ${isBooked
                          ? 'bg-[#05488B] text-[#FFC107] border-[#05488B] shadow-lg scale-105'
                          : 'bg-slate-50 text-slate-300 border-slate-200 opacity-60'
                          }`}
                      >
                        <MessageCircle size={22} strokeWidth={2} />
                      </button>
                    )}

                    {/* VIEW DETAILS STYLE LOGIC: Default Theme, White on Hover */}
                    <button
                      onClick={() => handleBookSeat(ride)}
                      disabled={isOwner || (ride.seats_available <= 0 && !isBooked) || isBooked}
                      className={`px-8 py-4 rounded-xl text-sm font-medium uppercase tracking-wide transition-all shadow-md flex items-center justify-center min-w-[140px] border-2 ${isOwner
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default shadow-none'
                        : isBooked
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : ride.seats_available > 0
                            ? 'bg-[#05488B] text-[#FFC107] border-[#05488B] hover:bg-white hover:text-[#05488B]'
                            : 'bg-slate-200 text-slate-400 border-slate-200 shadow-none'
                        }`}
                    >
                      {isOwner ? "My Ride" : isBooked ? "Reserved ✓" : ride.seats_available > 0 ? "Book Seat" : "Full"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {rides.length === 0 && (
          <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-300 mt-10">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
              <Car size={40} className="text-slate-300" />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em]">No journeys available right now</p>
          </div>
        )}
      </div>

      {/* Chat Interface Modal */}
      <AnimatePresence>
        {showChat && selectedReceiver && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0b1120]/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0" onClick={() => setShowChat(false)} />
            <motion.div
              initial={{ y: 100, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 100, scale: 0.95 }}
              className="relative w-full max-w-2xl h-[85vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-4 border-[#05488B]"
            >
              <div className="p-6 border-b-4 border-[#FFC107] bg-[#05488B] text-white flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#FFC107] rounded-xl flex items-center justify-center text-[#05488B] text-xl font-black">
                    {selectedReceiver[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">{selectedReceiverName || "Buddy Driver"}</h3>
                    <p className="text-[10px] text-blue-200 font-black uppercase tracking-widest">Active Connection</p>
                  </div>
                </div>
                <button onClick={() => setShowChat(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                  <X size={24} strokeWidth={3} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden bg-slate-50">
                <ChatBox
                  currentUserEmail={currentUser}
                  receiverEmail={selectedReceiver}
                  rideDetail={selectedRideContext}
                  onClose={() => setShowChat(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
                .premium-bg-pattern {
                    background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
                    background-size: 30px 30px;
                }
            `}</style>
    </div>
  );
};

export default RideDashboard;