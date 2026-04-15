import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, ArrowLeft, Bell, X, ShoppingBag, Car } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Track IDs outside to persist across re-renders
const alertedMessageIds = new Set();

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [activeToast, setActiveToast] = useState(null);

    const user = JSON.parse(localStorage.getItem('user'));
    const userEmail = user?.email;
    const [unreadCount, setUnreadCount] = useState(0);

    const isLoginPage = location.pathname === '/login';
    const isAuthPage = isLoginPage || location.pathname === '/signup' || location.pathname === '/forgot-password';

    // 1. Audio Logic
    const playNotificationSound = () => {
        const audio = new Audio('https://raw.githubusercontent.com/shashwat622/sound/main/ding.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => console.log("Audio blocked: Interaction needed."));
    };

    // 2. Mark as Read & Open Chat Logic
    const handleOpenChat = async (senderEmail) => {
        try {
            await axios.post('http://127.0.0.1:8000/api/marketplace/mark-read', {
                receiver_email: userEmail,
                sender_email: senderEmail
            });

            setActiveToast(null);
            navigate('/inbox');
        } catch (err) {
            console.error("Mark as read failed", err);
            navigate('/inbox');
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // --- ENHANCED LINK STYLE WITH BORDERS ---
    const getLinkStyle = (path) => {
        const isActive = location.pathname === path;
        return `relative font-bold text-sm transition-all flex items-center gap-2 px-4 py-2.5 rounded-xl border ${isActive
                ? 'text-[#05488B] bg-slate-50 border-slate-200 shadow-sm'
                : 'text-slate-500 border-transparent hover:text-[#05488B] hover:bg-slate-50 hover:border-slate-200'
            }`;
    };

    // 3. COMBINED MESSAGE POLLING
    useEffect(() => {
        if (!userEmail || isAuthPage) return;

        const checkMessages = async () => {
            try {
                // Use the consistent userEmail variable from your component scope
                const cleanEmail = userEmail.trim().toLowerCase();
                const res = await axios.get(`http://127.0.0.1:8000/api/marketplace/inbox/${cleanEmail}`);

                if (res.data) {
                    // Update unread count for the badge
                    const unread = res.data.filter(m => !m.is_read && m.sender_email !== userEmail).length;
                    setUnreadCount(unread);
                    setHasNewMessage(unread > 0);

                    // Logic for showing the Toast/Sound for brand new messages
                    const newUnread = res.data.filter(m =>
                        !m.is_read &&
                        m.sender_email !== userEmail &&
                        !alertedMessageIds.has(m.id)
                    );

                    if (newUnread.length > 0) {
                        const latestMsg = newUnread[0];
                        newUnread.forEach(m => alertedMessageIds.add(m.id));

                        playNotificationSound();
                        setActiveToast({
                            id: latestMsg.id,
                            sender_email: latestMsg.sender_email,
                            sender_name: latestMsg.sender_email.split('@')[0],
                            content: latestMsg.content
                        });
                        setTimeout(() => setActiveToast(null), 6000);
                    }
                }
            } catch (err) {
                // Keep this silent to avoid console flooding
                console.debug("Inbox sync paused: Backend offline.");
            }
        };

        checkMessages();
        const interval = setInterval(checkMessages, 5000);
        return () => clearInterval(interval);
    }, [userEmail, isAuthPage]);

    return (
        <>
            {/* PREMIUM STRUCTURED NAVBAR WITH BOTTOM BORDER */}
            <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-2xl z-[100] h-20 border-b border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">

                    <div className="flex items-center gap-4">
                        {!isLoginPage && (
                            <button onClick={() => navigate(-1)} className="p-2.5 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 rounded-xl text-slate-600 transition-all active:scale-90">
                                <ArrowLeft size={18} strokeWidth={2.5} />
                            </button>
                        )}

                        {/* BRANDED LOGO */}
                        <Link to={user ? "/marketplace" : "/login"} className="flex items-center gap-1 ml-2">
                            <span className="text-2xl font-black text-[#05488B] tracking-tighter uppercase">
                                CAMPUS<span className="text-[#FFC107]">BUDDY</span>
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-6">
                        {!isAuthPage && user && (
                            <div className="hidden md:flex space-x-2 items-center mr-2">
                                <Link to="/marketplace" className={getLinkStyle('/marketplace')}>
                                    <ShoppingBag size={18} /> MarketBuddy
                                </Link>
                                <Link to="/rides" className={getLinkStyle('/rides')}>
                                    <Car size={18} /> RideBuddy
                                </Link>
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            {user ? (
                                <div className="flex items-center gap-3 pl-6 border-l border-slate-200">

                                    {/* BORDERED NOTIFICATION BELL */}
                                    <Link to="/inbox" className="relative p-2.5 bg-white border border-slate-200 shadow-sm text-slate-500 hover:text-[#05488B] hover:border-[#05488B]/30 hover:bg-blue-50 rounded-xl transition-all">
                                        <Bell size={20} strokeWidth={2.5} />
                                        {hasNewMessage && (
                                            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-[#FFC107] border-2 border-white rounded-full animate-pulse shadow-sm"></span>
                                        )}
                                    </Link>

                                    {/* BORDERED USER AVATAR */}
                                    <Link to="/profile" className="w-10 h-10 rounded-xl bg-[#05488B] flex items-center justify-center text-[#FFC107] font-black border border-[#04396f] hover:shadow-md hover:scale-105 transition-all shadow-sm">
                                        {user.username?.charAt(0).toUpperCase() || 'U'}
                                    </Link>

                                    {/* BORDERED LOGOUT BUTTON */}
                                    <button onClick={handleLogout} className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all" title="Logout">
                                        <LogOut size={18} strokeWidth={2.5} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-3 items-center">
                                    {/* BORDERED LOGIN/JOIN BUTTONS */}
                                    <Link to="/login" className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm hover:text-[#05488B] hover:border-[#05488B]/30 hover:bg-blue-50 transition-all">
                                        Login
                                    </Link>
                                    <Link to="/signup" className="px-6 py-2.5 bg-[#FFC107] border border-[#e0a800] text-[#05488B] rounded-xl text-sm font-black shadow-md hover:bg-[#e0a800] transition-all active:scale-95">
                                        Join Now
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* PREMIUM STRUCTURED NOTIFICATION TOAST */}
            {activeToast && (
                <div className="fixed top-24 right-6 z-[2000] animate-in slide-in-from-right-full fade-in duration-500">
                    <div
                        onClick={() => handleOpenChat(activeToast.sender_email)}
                        // Added structured borders and crisp shadow
                        className="relative bg-white border border-slate-200 shadow-[0_15px_40px_rgba(5,72,139,0.12)] p-4 rounded-2xl flex items-center gap-4 min-w-[320px] max-w-[400px] cursor-pointer hover:border-[#05488B]/40 transition-all group overflow-hidden"
                    >

                        {/* Profile Box */}
                        <div className="w-12 h-12 rounded-xl bg-[#05488B] border border-[#04396f] flex items-center justify-center text-[#FFC107] font-black text-lg shadow-inner shrink-0">
                            {activeToast.sender_name[0].toUpperCase()}
                        </div>

                        {/* Message content */}
                        <div className="flex-1 leading-tight min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#FFC107] bg-[#FFC107]/10 border border-[#FFC107]/20 px-2 py-0.5 rounded-md">
                                    New Message
                                </p>
                            </div>
                            <h4 className="font-bold text-sm text-slate-900 capitalize truncate mt-1">
                                {activeToast.sender_name}
                            </h4>
                            <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                                {activeToast.content}
                            </p>
                        </div>

                        {/* Bordered close btn */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveToast(null);
                            }}
                            className="text-slate-400 hover:text-slate-800 bg-slate-50 border border-slate-200 hover:bg-slate-100 p-1.5 rounded-xl transition-all shrink-0 shadow-sm"
                        >
                            <X size={14} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;