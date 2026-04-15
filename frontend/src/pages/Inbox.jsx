import React, { useState, useEffect } from 'react';
import { MessageSquare, ArrowLeft, Loader2, Volume2, VolumeX, X, Bell, Zap, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChatBox from '../components/ChatBox';

const Inbox = () => {
    const navigate = useNavigate();
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(false);

    const [showChat, setShowChat] = useState(false);
    const [selectedReceiver, setSelectedReceiver] = useState(null);
    const [selectedReceiverName, setSelectedReceiverName] = useState("");
    const [selectedChatContext, setSelectedChatContext] = useState(null);

    const storedUser = JSON.parse(localStorage.getItem('user'));
    const userEmail = localStorage.getItem("userEmail") || storedUser?.college_email || "";

    const formatDisplayName = (fullName, email) => {
        if (fullName && fullName.trim().length > 0 && !fullName.includes('@')) {
            return fullName.trim();
        }
        if (!email) return "User";
        const namePart = email.split('@')[0];
        const clean = namePart.replace(/[0-9]/g, '').replace('mcaaids', '').replace('mca', '');
        return clean.charAt(0).toUpperCase() + clean.slice(1);
    };

    const fetchInbox = async () => {
        if (!userEmail) return;
        const currentEmail = userEmail.toLowerCase().trim();

        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/marketplace/inbox/${currentEmail}`);
            const uniqueThreads = {};

            res.data.forEach(msg => {
                const sender = msg.sender_email.toLowerCase().trim();
                const receiver = msg.receiver_email.toLowerCase().trim();
                const otherPerson = sender === currentEmail ? receiver : sender;

                if (!uniqueThreads[otherPerson]) {
                    uniqueThreads[otherPerson] = {
                        ...msg,
                        display_name: sender === currentEmail ? (msg.receiver_name || otherPerson) : (msg.sender_name || otherPerson)
                    };
                }
            });

            setThreads(Object.values(uniqueThreads));
        } catch (err) {
            console.error("Inbox fetch failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChat = async (thread) => {
        const currentEmail = userEmail.toLowerCase().trim();
        const sender = thread.sender_email.toLowerCase().trim();
        const receiver = thread.receiver_email.toLowerCase().trim();

        const otherPersonEmail = sender === currentEmail ? receiver : sender;
        const otherPersonName = formatDisplayName(thread.display_name || thread.sender_name, otherPersonEmail);

        setSelectedReceiver(otherPersonEmail);
        setSelectedReceiverName(otherPersonName);

        setSelectedChatContext({
            id: thread.item_id || 0,
            title: thread.item_name || "Direct Message",
            price: thread.price || "",
            destination: thread.destination || "",
            item_type: thread.item_type
        });

        setShowChat(true);

        // Optimistically mark as read in UI
        setThreads(prev => prev.map(t =>
            (t.sender_email.toLowerCase().trim() === otherPersonEmail || t.receiver_email.toLowerCase().trim() === otherPersonEmail)
                ? { ...t, is_read: true } : t
        ));

        if (otherPersonEmail.toUpperCase() !== "SYSTEM") {
            try {
                await axios.post(`http://127.0.0.1:8000/api/marketplace/mark-read`, {
                    receiver_email: currentEmail,
                    sender_email: otherPersonEmail
                });
            } catch (err) { }
        }
    };

    useEffect(() => {
        if (!userEmail) {
            setLoading(false);
            return;
        }
        fetchInbox();
        const interval = setInterval(fetchInbox, 10000);
        return () => clearInterval(interval);
    }, [userEmail]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
            <div className="w-16 h-16 border-4 border-[#05488B] border-t-[#FFC107] rounded-full animate-spin mb-4"></div>
            <p className="font-black text-[#05488B] uppercase tracking-[0.2em] animate-pulse">Syncing encrypted inbox...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-12 px-4 font-sans">
            <div className="max-w-4xl mx-auto">

                {/* --- HEADER BLOCK --- */}
                <div className="bg-[#05488B] rounded-[2rem] p-8 mb-8 shadow-xl relative overflow-hidden text-white border-b-8 border-[#FFC107]">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-6">
                            <button onClick={() => navigate(-1)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10">
                                <ArrowLeft size={24} strokeWidth={3} />
                            </button>
                            <div>
                                <h1 className="text-4xl font-black tracking-tighter uppercase leading-none mb-2">My <span className="text-[#FFC107]">Inbox.</span></h1>
                                <p className="text-blue-100 font-medium text-sm opacity-80 italic">Active Campus Communications</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className={`p-3 rounded-xl transition-all border-2 ${isMuted ? 'bg-red-500 border-red-400' : 'bg-[#FFC107] text-[#05488B] border-yellow-300'}`}
                            >
                                {isMuted ? <VolumeX size={20} strokeWidth={2.5} /> : <Volume2 size={20} strokeWidth={2.5} />}
                            </button>
                            <div className="bg-white/5 border border-white/20 px-5 py-2.5 rounded-xl backdrop-blur-md shadow-inner">
                                <span className="text-sm font-black text-[#FFC107]">{threads.length}</span>
                                <span className="ml-2 text-[10px] font-black uppercase tracking-widest opacity-70">Active Channels</span>
                            </div>
                        </div>
                    </div>
                    <Zap size={100} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
                </div>

                {/* --- CHAT LIST --- */}
                <div className="space-y-4">
                    {threads.length === 0 ? (
                        <div className="bg-white p-20 rounded-[3rem] text-center border-4 border-dashed border-slate-100 shadow-sm flex flex-col items-center">
                            <MessageSquare className="text-slate-200 mb-4" size={64} />
                            <p className="text-slate-400 font-black uppercase tracking-widest text-lg">No active signals found</p>
                            <p className="text-slate-300 text-sm mt-1">Chat with sellers or riders to see messages here.</p>
                        </div>
                    ) : (
                        threads.map((thread, index) => {
                            const currentEmail = userEmail.toLowerCase().trim();
                            const sender = thread.sender_email.toLowerCase().trim();
                            const receiver = thread.receiver_email.toLowerCase().trim();

                            const otherPersonEmail = sender === currentEmail ? receiver : sender;
                            const isSystem = otherPersonEmail.toUpperCase() === "SYSTEM";
                            const displayName = formatDisplayName(thread.display_name, otherPersonEmail);
                            const isUnread = !thread.is_read && sender !== currentEmail;

                            return (
                                <div
                                    key={index}
                                    onClick={() => handleOpenChat(thread)}
                                    className={`group p-6 bg-white border-2 ${isUnread ? 'border-[#05488B] bg-blue-50/20' : 'border-slate-100'} rounded-[2.5rem] hover:shadow-2xl hover:scale-[1.01] transition-all cursor-pointer flex items-center gap-6 relative overflow-hidden`}
                                >
                                    {isUnread && (
                                        <div className="absolute top-0 left-0 h-full w-2 bg-[#05488B] animate-pulse"></div>
                                    )}

                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shrink-0 border-2 ${isSystem ? "bg-[#0b213a] border-[#FFC107]/30" : "bg-[#05488B] border-white/10"}`}>
                                        {isSystem ? <Bell size={28} /> : displayName.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className={`font-black text-xl tracking-tight capitalize ${isUnread ? 'text-[#05488B]' : 'text-slate-800'}`}>
                                                {isSystem ? "System Protocol" : displayName}
                                            </h3>
                                            <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-md uppercase tracking-tighter">
                                                {thread.timestamp ? new Date(thread.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Live"}
                                            </span>
                                        </div>
                                        <p className={`text-sm truncate pr-8 ${isUnread ? 'text-slate-900 font-bold' : 'text-slate-500 font-medium'}`}>
                                            {thread.content || "Cipher data unavailable"}
                                        </p>
                                    </div>
                                    <ChevronRight className="text-slate-200 group-hover:text-[#05488B] group-hover:translate-x-1 transition-all" size={24} strokeWidth={3} />
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* CHAT MODAL OVERLAY */}
            {showChat && (
                <div className="fixed inset-0 bg-[#0b1120]/90 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0" onClick={() => setShowChat(false)} />
                    <div className="relative w-full max-w-2xl h-[85vh] bg-white rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-in zoom-in-95 border-4 border-[#05488B]">

                        {/* Modal Header */}
                        <div className="p-6 border-b-4 border-[#FFC107] flex justify-between items-center bg-[#05488B]">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg border-2 ${selectedReceiver?.toUpperCase() === "SYSTEM" ? "bg-white/10 text-[#FFC107] border-[#FFC107]/40" : "bg-[#FFC107] text-[#05488B] border-white/20"}`}>
                                    {selectedReceiver?.toUpperCase() === "SYSTEM" ? <Bell size={24} /> : selectedReceiverName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tight leading-none mb-1">
                                        {selectedReceiver?.toUpperCase() === "SYSTEM" ? "System Notification" : selectedReceiverName}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                                        <p className="text-[10px] text-blue-200 font-black uppercase tracking-widest">
                                            {selectedReceiver?.toUpperCase() === "SYSTEM" ? "Institutional Channel" : `Subject: ${selectedChatContext?.title || "Active Buddy Link"}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowChat(false)} className="p-2 text-white hover:bg-white/10 rounded-full transition-all">
                                <X size={32} strokeWidth={3} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            <ChatBox currentUserEmail={userEmail} receiverEmail={selectedReceiver} itemId={selectedChatContext?.id || 0} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inbox;