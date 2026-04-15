import React, { useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { MessageSquare, Bell, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GlobalNotification = () => {
    const navigate = useNavigate();
    const lastMessageIdRef = useRef(null);

    useEffect(() => {
        const userEmail = localStorage.getItem("userEmail");

        const checkNewMessages = async () => {
            if (!userEmail) return;

            try {
                const currentEmail = userEmail.toLowerCase().trim();
                const res = await axios.get(`http://127.0.0.1:8000/api/marketplace/inbox/${currentEmail}`);

                let hasNewMessage = false;
                let latestMessage = null;

                // Look for the newest unread message meant for us
                res.data.forEach(msg => {
                    const receiver = msg.receiver_email.toLowerCase().trim();

                    if (!msg.is_read && receiver === currentEmail) {
                        // If it's a completely new message ID we haven't alerted for yet
                        if (!lastMessageIdRef.current || msg.id > lastMessageIdRef.current) {
                            hasNewMessage = true;
                            latestMessage = msg;
                            lastMessageIdRef.current = msg.id; // Save ID so it doesn't double-ring
                        }
                    }
                });

                if (hasNewMessage && latestMessage) {
                    triggerNotification(latestMessage);
                }

            } catch (err) {
                console.error("Background check failed");
            }
        };

        // Run once immediately, then every 10 seconds in the background
        checkNewMessages();
        const interval = setInterval(checkNewMessages, 10000);

        return () => clearInterval(interval);
    }, []);

    const triggerNotification = (msg) => {
        // 1. Play the crisp pop sound
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 1;
        audio.play().catch(() => { });

        const isSystem = msg.sender_email.toUpperCase() === 'SYSTEM';
        const senderName = isSystem ? "Institutional Alert" : (msg.sender_name || msg.sender_email.split('@')[0]);

        // 2. Show the Global Toast Popup (Institutional 3D Theme)
        toast.custom((t) => (
            <div
                className={`${t.visible ? 'animate-in slide-in-from-top-10' : 'animate-out fade-out zoom-out-95'
                    } max-w-sm w-full bg-[#0b213a] border-b-4 border-[#FFC107] shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-[2rem] pointer-events-auto flex overflow-hidden cursor-pointer transition-all hover:scale-[1.02] relative group`}
                onClick={() => {
                    toast.dismiss(t.id);
                    navigate('/inbox'); // Instantly jump to inbox if they click the popup!
                }}
            >
                {/* Decorative background glow */}
                <Zap size={80} className="absolute -right-4 -bottom-4 text-white/5 rotate-12 transition-transform group-hover:scale-110" />

                <div className="flex-1 w-0 p-5 relative z-10">
                    <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border-2 ${isSystem ? 'bg-[#05488B] text-[#FFC107] border-[#FFC107]/30' : 'bg-[#FFC107] text-[#05488B] border-white/10'
                            }`}>
                            {isSystem ? <Bell size={28} strokeWidth={2.5} /> : <MessageSquare size={28} strokeWidth={2.5} />}
                        </div>

                        <div className="flex-1 overflow-hidden">
                            <div className="flex items-center justify-between mb-1">
                                <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${isSystem ? 'text-[#FFC107]' : 'text-blue-300'}`}>
                                    {isSystem ? 'System Protocol' : 'Buddy Message'}
                                </p>
                                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full">Now</span>
                            </div>

                            <p className="text-sm font-black text-white leading-tight mb-1 truncate capitalize">
                                {senderName}
                            </p>

                            <p className="text-xs text-blue-100/60 line-clamp-2 font-medium leading-relaxed">
                                {msg.content}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress bar visual for toast duration */}
                <div className="absolute bottom-0 left-0 h-1 bg-[#FFC107]/20 w-full overflow-hidden">
                    <div className="h-full bg-[#FFC107] animate-progress-toast"></div>
                </div>
            </div>
        ), {
            duration: 5000,
            position: 'top-center'
        });
    };

    return (
        <style>{`
            @keyframes progress-toast {
                from { width: 100%; }
                to { width: 0%; }
            }
            .animate-progress-toast {
                animation: progress-toast 5s linear forwards;
            }
        `}</style>
    );
};

export default GlobalNotification;