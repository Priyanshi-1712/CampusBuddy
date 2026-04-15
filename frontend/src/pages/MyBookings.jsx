import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarCheck, MapPin, Clock, User, Trash2, IndianRupee, MessageSquare, CheckCircle, X, Zap } from 'lucide-react';
import { toast } from 'react-toastify';
import ChatBox from '../components/ChatBox';

const MyBookings = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const userEmail = localStorage.getItem("userEmail");

    // --- CHAT MODAL STATES ---
    const [showChat, useStateShowChat] = useState(false);
    const [selectedReceiver, setSelectedReceiver] = useState("");
    const [selectedReceiverName, setSelectedReceiverName] = useState("");

    const totalSpent = bookings.reduce((sum, ride) => sum + (ride.price_per_seat || 0), 0);

    const cleanName = (email) => {
        if (!email) return "Driver";
        const name = email.split('@')[0].replace(/[0-9]/g, '');
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    useEffect(() => {
        fetchBookings();
    }, [userEmail]);

    const fetchBookings = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/my-bookings/${userEmail}`);
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            }
        } catch (err) {
            console.error("Error fetching bookings:", err);
            toast.error("Could not load bookings.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (rideId) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/rides/${rideId}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ booker_email: userEmail })
            });
            if (res.ok) {
                toast.success("Booking cancelled.");
                setBookings(prev => prev.filter(ride => ride.id !== rideId));
            } else {
                toast.error("Failed to cancel booking.");
            }
        } catch (err) {
            toast.error("Network error.");
        }
    };

    const checkRideStatus = (departureTime, dbStatus) => {
        if (dbStatus === 'COMPLETED') {
            return { label: "Completed", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
        }
        if (dbStatus === 'IN_TRANSIT') {
            return { label: "On Trip", color: "text-[#FFC107] bg-yellow-500/10 border-[#FFC107]/20 animate-pulse" };
        }

        const now = new Date();
        const start = new Date(departureTime);
        const diffInMinutes = (start - now) / (1000 * 60);

        if (diffInMinutes < 0) return { label: "Delayed / Starting", color: "text-red-400 bg-red-500/10 border-red-500/20" };
        if (diffInMinutes <= 30) return { label: "Starting Soon!", color: "text-[#FFC107] bg-yellow-500/10 border-[#FFC107]/20 animate-pulse" };

        return {
            label: `Starts at ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`,
            color: "text-blue-200 bg-blue-500/10 border-blue-500/20"
        };
    };

    const handleOpenChat = (driverEmail, driverName) => {
        setSelectedReceiver(driverEmail);
        setSelectedReceiverName(driverName || cleanName(driverEmail));
        useStateShowChat(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#05488B]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFC107]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#05488B] p-6 pt-24 relative overflow-hidden font-sans">

            {/* --- BIG GLOWING RAIN EFFECT --- */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {[...Array(25)].map((_, i) => (
                    <div
                        key={i}
                        className="booking-glowing-rain"
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
                    className="flex items-center gap-2 text-white/60 font-bold text-xs uppercase tracking-widest mb-6 hover:text-[#FFC107] transition-all"
                >
                    <ArrowLeft size={16} /> Back To Profile
                </button>

                {/* --- HEADER 3D BLUE CARD --- */}
                <div className="bg-[#0b213a] rounded-[3rem] p-10 md:p-14 mb-10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden border-4 border-[#FFC107]">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6 relative z-10">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase mb-4 tracking-widest">
                                <CalendarCheck size={14} /> My Digital Pass
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                                Booked <span className="text-[#FFC107]">Rides.</span>
                            </h1>
                        </div>
                        <div className="bg-[#05488B] border-2 border-white/10 p-6 rounded-[2.5rem] shadow-inner flex flex-col items-center min-w-[200px]">
                            <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest mb-1">Total Savings</p>
                            <p className="text-3xl font-black text-white flex items-center gap-1"><IndianRupee size={22} className="text-[#FFC107]" /> {totalSpent}</p>
                        </div>
                    </div>
                    <Zap className="absolute -right-10 -top-10 text-white/5 w-64 h-64 rotate-12" />
                </div>

                <div className="grid gap-6">
                    {bookings.length === 0 ? (
                        <div className="bg-[#0b213a] border-4 border-dashed border-white/10 p-20 rounded-[3rem] text-center shadow-2xl">
                            <p className="text-blue-200/40 font-black text-xl uppercase tracking-widest">No Active Bookings Found</p>
                        </div>
                    ) : (
                        bookings.map((ride) => {
                            const status = checkRideStatus(ride.departure_time, ride.status);
                            const isCompleted = ride.status === 'COMPLETED';

                            return (
                                <div key={ride.id} className="bg-[#0b213a] border-4 border-white/5 p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6 hover:border-[#FFC107] transition-all duration-300 group shadow-2xl relative overflow-hidden">
                                    <div className="flex items-center gap-6 w-full md:w-auto relative z-10">
                                        <button
                                            onClick={() => navigate(`/active-ride/${ride.id}`, { state: { ride } })}
                                            className="p-5 bg-[#05488B] border border-white/10 text-[#FFC107] rounded-2xl transition-all shadow-lg group-hover:scale-110 active:scale-95"
                                        >
                                            <MapPin size={28} />
                                        </button>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border-2 ${status.color}`}>
                                                    {status.label}
                                                </span>
                                                <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border-2 border-emerald-500/20">
                                                    <CheckCircle size={10} /> Confirmed
                                                </span>
                                            </div>
                                            <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-[#FFC107] transition-colors">To: {ride.destination}</h3>
                                            <div className="flex flex-wrap items-center gap-5">
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-blue-300 uppercase tracking-tighter">
                                                    <Clock size={14} className="text-[#FFC107]" />
                                                    {new Date(ride.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-blue-300 uppercase tracking-tighter">
                                                    <User size={14} className="text-[#FFC107]" /> {ride.driver_name || "Student Buddy"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-0 border-white/5 pt-6 md:pt-0 relative z-10">
                                        <div className="text-left md:text-right pr-4">
                                            <p className="text-3xl font-black text-white flex items-center md:justify-end leading-none"><IndianRupee size={22} className="text-[#FFC107]" /> {ride.price_per_seat}</p>
                                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-2">Shared Fare</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleOpenChat(ride.owner, ride.driver_name)}
                                                disabled={isCompleted}
                                                className={`p-4 rounded-2xl transition-all flex flex-col items-center border-2 ${isCompleted ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed opacity-50' : 'bg-[#05488B] border-white/10 text-white hover:bg-[#FFC107] hover:text-[#05488B] hover:border-[#FFC107] shadow-xl active:scale-95'}`}
                                            >
                                                <MessageSquare size={20} />
                                                <span className="text-[8px] font-black uppercase mt-1">Chat</span>
                                            </button>

                                            <button
                                                onClick={() => handleCancel(ride.id)}
                                                disabled={isCompleted || ride.status === 'IN_TRANSIT'}
                                                className={`p-4 rounded-2xl transition-all flex flex-col items-center border-2 ${isCompleted || ride.status === 'IN_TRANSIT' ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed opacity-50' : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white shadow-xl active:scale-95'}`}
                                            >
                                                <Trash2 size={20} />
                                                <span className="text-[8px] font-black uppercase mt-1">Cancel</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* --- CHAT MODAL OVERLAY --- */}
            {showChat && (
                <div className="fixed inset-0 bg-[#0b1120]/90 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0" onClick={() => useStateShowChat(false)} />
                    <div className="relative w-full max-w-2xl h-[85vh] bg-white rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border-4 border-[#05488B]">
                        <div className="p-6 border-b-4 border-[#FFC107] flex justify-between items-center bg-[#05488B]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#FFC107] rounded-xl flex items-center justify-center text-[#05488B] font-black text-xl shadow-lg">
                                    {selectedReceiverName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tight leading-none mb-1">{selectedReceiverName}</h3>
                                    <p className="text-[10px] text-blue-200 font-black uppercase tracking-widest">Active Buddy Driver</p>
                                </div>
                            </div>
                            <button onClick={() => useStateShowChat(false)} className="p-2 text-white hover:bg-white/10 rounded-full transition-all">
                                <X size={32} strokeWidth={3} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden bg-slate-50">
                            <ChatBox
                                currentUserEmail={userEmail}
                                receiverEmail={selectedReceiver}
                                itemId={0}
                            />
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .booking-glowing-rain {
                    position: absolute;
                    top: -10%;
                    background: #FFC107;
                    border-radius: 50%;
                    opacity: 0;
                    box-shadow: 0 0 20px 4px #FFC107, 0 0 40px 8px rgba(255, 193, 7, 0.3);
                    animation: booking-fall linear infinite;
                }
                @keyframes booking-fall {
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

export default MyBookings;