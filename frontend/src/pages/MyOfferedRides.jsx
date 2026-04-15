import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, MapPin, Clock, IndianRupee, Trash2, MessageSquare, Info, X, CheckCircle, Zap } from 'lucide-react';
import { toast } from 'react-toastify';
import ChatBox from '../components/ChatBox';

const MyOfferedRides = () => {
    const navigate = useNavigate();
    const [myRides, setMyRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const userEmail = localStorage.getItem("userEmail");

    // --- CHAT MODAL STATES ---
    const [showChat, setShowChat] = useState(false);
    const [selectedReceiver, setSelectedReceiver] = useState("");
    const [selectedReceiverName, setSelectedReceiverName] = useState("");

    const cleanName = (email) => {
        if (!email) return "User";
        const name = email.split('@')[0].replace(/[0-9]/g, '');
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    useEffect(() => {
        fetchMyOfferedRides();
    }, [userEmail]);

    const fetchMyOfferedRides = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/my-offered-rides/${userEmail}`);
            if (res.ok) {
                const data = await res.json();
                setMyRides(data);
            }
        } catch {
            toast.error("Failed to load your rides.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRide = async (rideId) => {
        if (!window.confirm("Delete this ride offer? All bookings will be cancelled.")) return;
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/rides/${rideId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                toast.success("Ride offer removed.");
                setMyRides(prev => prev.filter(r => r.id !== rideId));
            }
        } catch {
            toast.error("Delete failed.");
        }
    };

    const handleOpenChat = (passengerEmail, passengerName) => {
        setSelectedReceiver(passengerEmail);
        setSelectedReceiverName(passengerName || cleanName(passengerEmail));
        setShowChat(true);
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

    return (
        <div className="min-h-screen p-6 pt-24 bg-[#05488B] text-white relative overflow-hidden font-sans">

            {/* --- GLOWING YELLOW RAIN EFFECT --- */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className="ride-glowing-dot"
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

            <div className="max-w-6xl mx-auto relative z-10">
                {/* BACK */}
                <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-2 text-white/60 hover:text-[#FFC107] font-bold text-xs uppercase tracking-widest mb-6 transition-all"
                >
                    <ArrowLeft size={18} /> Back to Profile
                </button>

                {/* HEADER 3D CARD */}
                <div className="bg-[#0b213a] rounded-[3rem] p-10 md:p-14 mb-10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden border-4 border-[#FFC107]">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end relative z-10 gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase mb-4 tracking-widest">
                                <Zap size={14} className="fill-[#FFC107]" /> Driver Console
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">
                                My Offered <span className="text-[#FFC107]">Rides.</span>
                            </h1>
                            <p className="text-blue-200 font-medium mt-3 text-sm max-w-sm">Manage your journey, track bookings, and coordinate with passengers.</p>
                        </div>

                        <button
                            onClick={() => navigate('/post-ride')}
                            className="bg-[#FFC107] hover:bg-white text-[#05488B] px-8 py-4 rounded-2xl text-sm font-black shadow-xl transition-all active:scale-95 uppercase tracking-widest border-2 border-[#FFC107]"
                        >
                            + Post New Ride
                        </button>
                    </div>
                    <Users className="absolute -right-10 -top-10 text-white/5 w-64 h-64 rotate-12" />
                </div>

                {/* CONTENT */}
                {loading ? (
                    <div className="flex justify-center mt-32">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#FFC107]"></div>
                    </div>
                ) : myRides.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-32 text-center bg-[#0b213a] border-4 border-dashed border-white/10 p-20 rounded-[3rem] shadow-2xl">
                        <Users size={60} className="text-[#FFC107]/20 mb-4" />
                        <p className="text-blue-200 font-black text-xl uppercase tracking-widest">No Active Ride Offers</p>
                    </div>
                ) : (

                    <div className="grid gap-10">
                        {myRides.map((ride) => {
                            const status = checkRideStatus(ride.departure_time, ride.status);
                            const isCompleted = ride.status === 'COMPLETED';

                            return (
                                <div
                                    key={ride.id}
                                    className="bg-[#0b213a] rounded-[2.5rem] overflow-hidden border-4 border-white/5 shadow-[0_15px_40px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-[#FFC107]/40"
                                >

                                    {/* RIDE SUMMARY SECTION */}
                                    <div className="p-8 flex flex-col md:flex-row justify-between gap-6 bg-white/5 border-b border-white/10 relative overflow-hidden">

                                        <div className="flex items-center gap-6 relative z-10">
                                            <button
                                                onClick={() => navigate(`/active-ride/${ride.id}`, { state: { ride } })}
                                                className="p-5 bg-[#05488B] border border-white/10 text-[#FFC107] rounded-[1.5rem] transition-all shadow-lg hover:scale-110 active:scale-95"
                                            >
                                                <MapPin size={28} />
                                            </button>

                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border-2 ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                                <h3 className="text-2xl font-black uppercase tracking-tight text-white group-hover:text-[#FFC107]">
                                                    To: {ride.destination}
                                                </h3>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <p className="text-xs text-blue-300 font-bold flex items-center gap-1.5 uppercase tracking-tighter">
                                                        <Clock size={14} className="text-[#FFC107]" />
                                                        {new Date(ride.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                    </p>
                                                    <p className="text-xs text-blue-300 font-bold flex items-center gap-1.5 uppercase tracking-tighter">
                                                        <Users size={14} className="text-[#FFC107]" />
                                                        {ride.bookings?.length || 0} Booked
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 justify-between md:justify-end relative z-10">
                                            <div className="text-left md:text-right pr-4">
                                                <p className="text-3xl font-black text-white flex items-center md:justify-end leading-none">
                                                    <IndianRupee size={22} className="text-[#FFC107]" />
                                                    {ride.price_per_seat}
                                                </p>
                                                <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest mt-2">
                                                    {ride.seats_available} Seats Available
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => handleDeleteRide(ride.id)}
                                                disabled={isCompleted || ride.status === 'IN_TRANSIT'}
                                                className={`p-5 rounded-2xl transition-all border-2 ${isCompleted || ride.status === 'IN_TRANSIT' ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-50' : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white shadow-xl active:scale-95'}`}
                                            >
                                                <Trash2 size={24} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* PASSENGERS GRID SECTION */}
                                    <div className="p-8 bg-[#0b213a]">

                                        <h4 className="text-[10px] uppercase tracking-[0.3em] text-blue-200 font-black mb-6 flex items-center gap-2 opacity-60">
                                            <Users size={14} className="text-[#FFC107]" /> Passenger Manifest
                                        </h4>

                                        {ride.bookings?.length > 0 ? (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                                                {ride.bookings.map((b, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex justify-between items-center p-5 rounded-[1.5rem] bg-[#05488B]/40 border-2 border-white/5 hover:border-[#FFC107]/30 transition-all group shadow-lg"
                                                    >
                                                        <div className="flex gap-4 items-center">
                                                            <div className="w-14 h-14 bg-[#FFC107] text-[#05488B] rounded-2xl flex items-center justify-center font-black text-xl shadow-xl border-2 border-white/10">
                                                                {b.booker_name ? b.booker_name[0].toUpperCase() : cleanName(b.booker_email)[0]}
                                                            </div>
                                                            <div>
                                                                <p className="text-base font-black text-white group-hover:text-[#FFC107] transition-colors leading-none mb-1">
                                                                    {b.booker_name || cleanName(b.booker_email)}
                                                                </p>
                                                                <p className="text-[10px] font-bold text-blue-300/60 uppercase tracking-tighter">
                                                                    ID: {b.booker_email}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() => handleOpenChat(b.booker_email, b.booker_name)}
                                                            disabled={isCompleted}
                                                            className={`p-4 rounded-xl transition-all border-2 ${isCompleted ? 'bg-white/5 text-white/10 border-transparent cursor-not-allowed' : 'bg-[#05488B] border-white/10 text-[#FFC107] hover:bg-[#FFC107] hover:text-[#05488B] hover:border-[#FFC107] shadow-lg active:scale-90'}`}
                                                        >
                                                            <MessageSquare size={20} />
                                                        </button>
                                                    </div>
                                                ))}

                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center gap-3 p-12 rounded-3xl bg-white/5 border-2 border-dashed border-white/10 text-blue-200/40">
                                                <Info size={32} />
                                                <span className="text-sm font-black uppercase tracking-widest">Waiting for bookings...</span>
                                            </div>
                                        )}

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}
            </div>

            {/* --- REUSABLE CHAT MODAL --- */}
            {showChat && (
                <div className="fixed inset-0 bg-[#0b1120]/95 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0" onClick={() => setShowChat(false)} />
                    <div className="relative w-full max-w-2xl h-[85vh] bg-white rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border-4 border-[#05488B]">
                        <div className="p-6 border-b-4 border-[#FFC107] flex justify-between items-center bg-[#05488B]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#FFC107] rounded-xl flex items-center justify-center text-[#05488B] font-black text-xl shadow-lg">
                                    {selectedReceiverName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tight leading-none mb-1">{selectedReceiverName}</h3>
                                    <p className="text-[10px] text-blue-200 font-black uppercase tracking-widest opacity-70">Passenger Live Link</p>
                                </div>
                            </div>
                            <button onClick={() => setShowChat(false)} className="p-2 text-white hover:bg-white/10 rounded-full transition-all">
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
                .ride-glowing-dot {
                    position: absolute;
                    top: -10%;
                    background: #FFC107;
                    border-radius: 50%;
                    opacity: 0;
                    box-shadow: 0 0 20px 4px #FFC107, 0 0 40px 8px rgba(255, 193, 7, 0.3);
                    animation: ride-fall linear infinite;
                }
                @keyframes ride-fall {
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

export default MyOfferedRides;