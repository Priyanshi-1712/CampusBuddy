import React, { useState, useEffect, useRef } from 'react';
import { Send, Check, CheckCheck, Lock, Bell, Zap, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const ChatBox = ({ currentUserEmail, receiverEmail, itemId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef();
    const notifySound = useRef(null);
    const prevMessageCount = useRef(0);

    const isSystemChat = receiverEmail?.toUpperCase() === "SYSTEM";

    const cleanName = (email) => {
        if (!email) return "User";
        if (email.toUpperCase() === "SYSTEM") return "System Notification";
        const namePart = email.split('@')[0];
        const onlyLetters = namePart.replace(/[0-9]/g, '').replace('mcaaid', '').replace('mca', '');
        return onlyLetters.charAt(0).toUpperCase() + onlyLetters.slice(1);
    };

    const fetchMessages = async () => {
        if (!currentUserEmail || !receiverEmail) return;
        try {
            const user1 = encodeURIComponent(currentUserEmail.trim());
            const user2 = encodeURIComponent(receiverEmail.trim());

            const res = await axios.get(`http://127.0.0.1:8000/api/marketplace/messages/${user1}/${user2}`);

            if (res.data && Array.isArray(res.data)) {
                const filtered = res.data.filter(m => m.content);

                if (filtered.length > prevMessageCount.current && !isSystemChat) {
                    const lastMsg = filtered[filtered.length - 1];
                    if (lastMsg.sender_email !== currentUserEmail) {
                        if (notifySound.current) {
                            notifySound.current.currentTime = 0;
                            notifySound.current.play().catch(() => { });
                        }
                    }
                }

                prevMessageCount.current = filtered.length;
                setMessages(filtered);
            }

            await axios.post(`http://127.0.0.1:8000/api/marketplace/mark-read`, {
                sender_email: receiverEmail,
                receiver_email: currentUserEmail
            });

        } catch (err) {
            console.error("Fetch failed:", err);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [currentUserEmail, receiverEmail]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isSystemChat) return;

        const payload = {
            sender_email: currentUserEmail,
            receiver_email: receiverEmail,
            content: newMessage.trim(),
            item_id: itemId || 0
        };

        try {
            const res = await axios.post("http://127.0.0.1:8000/api/marketplace/send-message", payload);
            if (res.data.status === "success") {
                setNewMessage("");
                fetchMessages();
            }
        } catch (err) {
            console.error("Send failed:", err.response?.data || err.message);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#F8FAFC] overflow-hidden">

            {/* --- INTERNAL HEADER REMOVED TO PREVENT DOUBLE NAMES --- */}

            {/* --- CHAT AREA --- */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white/60 backdrop-blur-sm custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-20 opacity-30">
                        <Zap size={40} className="text-[#05488B] mb-2" />
                        <p className="text-xs font-black uppercase tracking-widest text-[#05488B]">Encrypted Connection Established</p>
                    </div>
                ) : (
                    messages.map((m, i) => {
                        const isMe = m.sender_email === currentUserEmail;
                        const isSystemMessage = m.sender_email.toUpperCase() === "SYSTEM";

                        if (isSystemMessage) {
                            return (
                                <div key={i} className="flex justify-center my-8 animate-in fade-in zoom-in-95">
                                    <div className="bg-white border-2 border-[#FFC107] px-6 py-5 rounded-[2rem] max-w-[90%] text-center shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2 opacity-5">
                                            <ShieldCheck size={40} className="text-[#05488B]" />
                                        </div>
                                        <div className="flex items-center justify-center gap-2 mb-2 text-[#05488B]">
                                            <Bell size={16} className="text-[#FFC107]" fill="#FFC107" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Institutional Alert</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-800 leading-relaxed">{m.content}</p>
                                        <p className="text-[9px] text-slate-400 font-black mt-3 uppercase tracking-tighter opacity-60">
                                            Log: {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Live"}
                                        </p>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-${isMe ? 'right' : 'left'}-4 duration-300`}>
                                <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`px-5 py-3 rounded-[1.5rem] text-sm font-bold shadow-md transition-all ${isMe ? 'bg-[#05488B] text-white rounded-tr-none border-b-4 border-black/20' : 'bg-white text-[#05488B] rounded-tl-none border-2 border-slate-100 shadow-slate-200'}`}>
                                        {m.content}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 px-1">
                                        {!isMe && <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.sender_name || cleanName(m.sender_email)}</span>}
                                        {isMe && !isSystemChat && (
                                            <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter ${m.is_read ? 'text-blue-500' : 'text-slate-300'}`}>
                                                {m.is_read ? <CheckCheck size={14} /> : <Check size={14} />}
                                                {m.is_read ? 'Seen' : 'Delivered'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={scrollRef} />
            </div>

            {/* --- INPUT AREA --- */}
            <div className="p-5 bg-white border-t-2 border-slate-100">
                {isSystemChat ? (
                    <div className="flex items-center justify-center gap-3 bg-slate-50 border-2 border-dashed border-slate-200 py-4 px-4 rounded-2xl text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] select-none">
                        <Lock size={16} />
                        ReadOnly Security Channel
                    </div>
                ) : (
                    <form onSubmit={handleSend}>
                        <div className="flex gap-3 items-center">
                            <div className="flex-1 flex items-center bg-slate-50 rounded-2xl px-5 py-1 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#05488B]/5 border-2 border-slate-200 transition-all shadow-inner group">
                                <input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a buddy message..."
                                    className="flex-1 bg-transparent py-3 outline-none text-sm text-[#05488B] font-bold placeholder:text-slate-400 placeholder:font-medium"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="w-12 h-12 bg-[#FFC107] text-[#05488B] rounded-2xl flex items-center justify-center shadow-lg hover:bg-[#05488B] hover:text-white transition-all active:scale-90 disabled:opacity-30 disabled:grayscale group"
                            >
                                <Send size={22} strokeWidth={2.5} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
            `}</style>
        </div>
    );
};

export default ChatBox;