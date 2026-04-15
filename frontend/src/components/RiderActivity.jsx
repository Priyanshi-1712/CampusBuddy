import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, CheckCircle, Clock, MapPin, UserCheck, ShieldAlert, Zap, ShieldCheck } from 'lucide-react';

const RiderActivity = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const riderEmail = localStorage.getItem("userEmail");

    // Fetching bookings specifically for rides posted by THIS rider
    const fetchRiderBookings = useCallback(async () => {
        if (!riderEmail) return;
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/rider-bookings/${riderEmail}`);
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            }
        } catch (error) {
            console.error("Failed to fetch rider bookings", error);
        } finally {
            setLoading(false);
        }
    }, [riderEmail]);

    useEffect(() => {
        fetchRiderBookings();
    }, [fetchRiderBookings]);

    // Polling every 30 seconds to catch new "A" user bookings automatically
    useEffect(() => {
        const interval = setInterval(fetchRiderBookings, 30000);
        return () => clearInterval(interval);
    }, [fetchRiderBookings]);

    const handleConfirmSeat = async (bookingId) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/confirm-seat/${bookingId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                // Refresh list to show updated "Confirmed" status
                fetchRiderBookings();
            }
        } catch (error) {
            console.error("Confirmation failed", error);
        }
    };

    const handleVerifyOTP = async (bookingId, otpCode) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/verify-ride-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: bookingId, otp_code: otpCode })
            });

            if (res.ok) {
                alert("Ride verified!");
                fetchRiderBookings(); // Refresh UI
            } else {
                const err = await res.json();
                alert(err.detail || "Verification failed");
            }
        } catch (error) {
            console.error("OTP Error:", error);
        }
    };

    return (
        <div className="min-h-screen p-6 pt-24 bg-[#05488B] text-white relative overflow-hidden font-sans">

            {/* --- GLOWING YELLOW RAIN EFFECT --- */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {[...Array(25)].map((_, i) => (
                    <div
                        key={i}
                        className="rider-glowing-rain"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`,
                            width: `${Math.random() * 8 + 4}px`,
                            height: `${Math.random() * 8 + 4}px`
                        }}
                    />
                ))}
            </div>

            <div className="max-w-5xl mx-auto relative z-10">

                <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-2 text-white/60 hover:text-[#FFC107] font-bold text-xs uppercase tracking-widest mb-8 transition-all"
                >
                    <ArrowLeft size={18} /> Dashboard
                </button>

                {/* --- 3D HEADER CARD --- */}
                <div className="bg-[#0b213a] rounded-[3rem] p-10 md:p-12 mb-10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden border-4 border-[#FFC107]">
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase mb-4 tracking-widest">
                            <Zap size={14} className="fill-[#FFC107]" /> Fleet Control
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                            Rider <span className="text-[#FFC107]">Management.</span>
                        </h1>
                        <p className="text-blue-200 font-medium mt-3 text-sm opacity-70">Verify passenger identities and coordinate campus transit.</p>
                    </div>
                    <Users className="absolute -right-10 -top-10 text-white/5 w-64 h-64 rotate-12" />
                </div>

                {loading ? (
                    <div className="flex justify-center py-32">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#FFC107]"></div>
                    </div>
                ) : (
                    <div className="grid gap-8">
                        {bookings.length === 0 ? (
                            <div className="bg-[#0b213a] border-4 border-dashed border-white/10 p-20 rounded-[3rem] text-center shadow-2xl">
                                <Users size={48} className="mx-auto text-[#FFC107]/20 mb-4" />
                                <p className="text-blue-200 font-black uppercase tracking-widest text-sm opacity-40">Passenger Manifest Empty</p>
                            </div>
                        ) : (
                            bookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className={`group bg-[#0b213a] border-4 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 transition-all duration-300 shadow-2xl relative overflow-hidden ${booking.status === 'CONFIRMED' ? 'border-[#FFC107]' : 'border-white/5'}`}
                                >
                                    <div className="flex flex-col md:flex-row items-center gap-8 w-full relative z-10">
                                        {/* PASSENGER AVATAR */}
                                        <div className="w-20 h-20 bg-[#05488B] rounded-2xl flex items-center justify-center text-3xl font-black text-[#FFC107] border-2 border-white/10 shadow-xl group-hover:scale-110 transition-transform">
                                            {booking.passenger_name?.charAt(0) || "P"}
                                        </div>

                                        <div className="text-center md:text-left flex-grow">
                                            <h3 className="font-black text-2xl text-white mb-2 uppercase tracking-tight group-hover:text-[#FFC107] transition-colors">
                                                {booking.passenger_name}
                                            </h3>
                                            <div className="flex flex-wrap justify-center md:justify-start gap-6">
                                                <p className="text-xs text-blue-200 font-bold uppercase tracking-widest flex items-center gap-2 opacity-60">
                                                    <MapPin size={16} className="text-[#FFC107]" />
                                                    Loc: {booking.pickup_point}
                                                </p>
                                                <p className="text-xs text-blue-200 font-bold uppercase tracking-widest flex items-center gap-2 opacity-60">
                                                    <Clock size={16} className="text-[#FFC107]" />
                                                    {new Date(booking.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ACTION BUTTON SECTION */}
                                    <div className="shrink-0 flex flex-col items-center md:items-end gap-3 relative z-10">
                                        {booking.status === 'RECEIVED' ? (
                                            <span className="bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/30 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-inner">
                                                <CheckCircle size={14} /> Completed
                                            </span>
                                        ) : booking.status === 'CONFIRMED' ? (
                                            <div className="flex flex-col gap-3 w-full sm:w-auto">
                                                <div className="bg-[#05488B] border-2 border-[#FFC107]/30 rounded-xl p-1 flex items-center shadow-inner">
                                                    <ShieldCheck size={18} className="text-[#FFC107] mx-2" />
                                                    <input
                                                        type="text"
                                                        placeholder="ENTER OTP"
                                                        id={`otp-${booking.id}`}
                                                        className="bg-transparent w-28 py-2 text-center text-lg font-mono font-black text-white outline-none placeholder:text-blue-300/30 tracking-[0.2em]"
                                                        maxLength={4}
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const otpVal = document.getElementById(`otp-${booking.id}`).value;
                                                        handleVerifyOTP(booking.id, otpVal);
                                                    }}
                                                    className="bg-[#FFC107] hover:bg-white text-[#05488B] px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-all border-b-4 border-black/20 active:scale-95"
                                                >
                                                    Start Journey
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleConfirmSeat(booking.id)}
                                                className="bg-[#05488B] border-2 border-white/10 hover:border-[#FFC107] hover:bg-[#FFC107] hover:text-[#05488B] text-[#FFC107] px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-2xl transition-all active:scale-95"
                                            >
                                                <UserCheck size={18} /> Approve Seat
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .rider-glowing-rain {
                    position: absolute;
                    top: -10%;
                    background: #FFC107;
                    border-radius: 50%;
                    opacity: 0;
                    box-shadow: 0 0 20px 4px #FFC107, 0 0 40px 8px rgba(255, 193, 7, 0.3);
                    animation: rider-fall linear infinite;
                }
                @keyframes rider-fall {
                    0% { transform: translateY(0); opacity: 0; }
                    10% { opacity: 0.8; }
                    50% { opacity: 0.4; }
                    90% { opacity: 0.8; }
                    100% { transform: translateY(115vh); opacity: 0; }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #FFC107; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default RiderActivity;