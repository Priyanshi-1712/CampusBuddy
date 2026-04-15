import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    LifeBuoy,
    Mail,
    MessageCircle,
    X,
    Bot,
    User,
    Zap,
    ShieldCheck,
    Clock
} from 'lucide-react';

const HelpCenter = () => {
    const navigate = useNavigate();

    // --- SUPPORT EMAILS ---
    const displayEmail = "resources.support@poornima.edu.in";
    const targetEmail = "campusbuddy.admin@gmail.com";

    // --- LIVE CHAT STATES ---
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState([]);
    const [chatOptions, setChatOptions] = useState([]);

    const messagesEndRef = useRef(null);

    // Initial Bot Greeting when chat opens
    useEffect(() => {
        if (isChatOpen) {
            setMessages([{ id: 1, sender: 'bot', text: "Hi there! 👋 Welcome to CampusBuddy Support. Please select an option below so I can help you." }]);
            setChatOptions([
                { label: "🛒 MarketBuddy Issues", action: "market" },
                { label: "🚗 RideBuddy Issues", action: "ride" },
                { label: "⚙️ Account & Profile", action: "account" }
            ]);
        }
    }, [isChatOpen]);

    // Auto-scroll chat to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, chatOptions, isTyping]);

    // Chat Tree Logic
    const handleOptionClick = (option) => {
        setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: option.label }]);
        setChatOptions([]);
        setIsTyping(true);

        setTimeout(() => {
            setIsTyping(false);
            let nextMsg = "";
            let nextOpts = [];

            switch (option.action) {
                case 'market':
                    nextMsg = "Got it! What kind of issue are you facing in MarketBuddy?";
                    nextOpts = [
                        { label: "Item not delivered", action: "demo_warning" },
                        { label: "Payment failed", action: "demo_warning" },
                        { label: "⬅️ Main Menu", action: "main" }
                    ];
                    break;
                case 'ride':
                    nextMsg = "Oh no, let's sort out your ride. What happened?";
                    nextOpts = [
                        { label: "Driver didn't show up", action: "demo_warning" },
                        { label: "OTP is not working", action: "demo_warning" },
                        { label: "⬅️ Main Menu", action: "main" }
                    ];
                    break;
                case 'account':
                    nextMsg = "Need help managing your profile?";
                    nextOpts = [
                        { label: "Change Password", action: "demo_warning" },
                        { label: "Update College ID", action: "demo_warning" },
                        { label: "⬅️ Main Menu", action: "main" }
                    ];
                    break;
                case 'demo_warning':
                    nextMsg = "Please note: CampusBuddy is currently in Demo Mode! Real transactions, rides, and profile updates do not take place. If you encountered a critical bug, please drop us an email using the Resource Support card!";
                    nextOpts = [
                        { label: "⬅️ Back to Main Menu", action: "main" },
                        { label: "❌ End Chat", action: "close" }
                    ];
                    break;
                case 'main':
                    nextMsg = "What else can I help you with today?";
                    nextOpts = [
                        { label: "🛒 MarketBuddy Issues", action: "market" },
                        { label: "🚗 RideBuddy Issues", action: "ride" },
                        { label: "⚙️ Account & Profile", action: "account" }
                    ];
                    break;
                case 'close':
                    setIsChatOpen(false);
                    return;
                default:
                    break;
            }

            setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: nextMsg }]);
            setChatOptions(nextOpts);

        }, 1200); 
    };

    return (
        <div className="min-h-screen bg-[#05488B] p-6 pt-24 pb-12 font-sans relative overflow-hidden text-white">
            
            {/* --- GLOWING YELLOW RAIN EFFECT --- */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {[...Array(25)].map((_, i) => (
                    <div 
                        key={i} 
                        className="help-glowing-drop" 
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${4 + Math.random() * 4}s`,
                            width: `${Math.random() * 6 + 4}px`,
                            height: `${Math.random() * 6 + 4}px`
                        }}
                    />
                ))}
            </div>

            <div className="max-w-4xl mx-auto relative z-10">

                {/* --- BACK BUTTON & TITLE --- */}
                <div className="flex items-center gap-6 mb-12">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-[#0b213a] rounded-2xl shadow-xl border-2 border-white/10 text-[#FFC107] hover:scale-110 active:scale-90 transition-all"
                    >
                        <ChevronLeft size={24} strokeWidth={3} />
                    </button>
                    <div>
                        <div className="inline-flex items-center gap-2 bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/20 px-3 py-1 rounded-full text-[10px] font-black uppercase mb-1 tracking-widest">
                            <ShieldCheck size={12} className="fill-[#FFC107]" /> Security Center
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Help <span className="text-[#FFC107]">Hub.</span></h1>
                    </div>
                </div>

                {/* --- CONTACT & MAIL SECTION --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {/* Email Card */}
                    <div className="bg-[#0b213a] rounded-[3rem] p-10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.4)] border-4 border-white/5 flex flex-col justify-between group relative overflow-hidden">
                        <Mail className="mb-8 text-[#FFC107] opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500" size={64} />
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black mb-3 uppercase tracking-tight">Resource Support</h3>
                            <p className="text-blue-100/60 text-sm font-bold mb-8 leading-relaxed">Encountered an issue with notes or peer tools? Deploy an inquiry to our administrators.</p>
                            <a
                                href={`mailto:${targetEmail}`}
                                className="block w-full text-center py-5 bg-[#05488B] text-[#FFC107] rounded-2xl font-black text-[11px] uppercase tracking-widest break-all px-4 hover:bg-[#FFC107] hover:text-[#05488B] transition-all shadow-xl border-2 border-white/5 active:scale-95"
                            >
                                {displayEmail}
                            </a>
                        </div>
                        <Zap className="absolute -right-6 -top-6 text-white/5 w-32 h-32" />
                    </div>

                    {/* Chat Support Card */}
                    <div className="bg-[#0b213a] rounded-[3rem] p-10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.4)] border-b-8 border-[#FFC107] flex flex-col justify-between group relative overflow-hidden">
                        <MessageCircle className="mb-8 text-emerald-400 opacity-20 group-hover:opacity-60 transition-all duration-500" size={64} />
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black mb-3 uppercase tracking-tight">Live Chat</h3>
                            <p className="text-blue-100/60 text-sm font-bold mb-8 leading-relaxed">Real-time resolution via our automated Buddy Protocol. Instant response enabled.</p>
                            <button
                                onClick={() => setIsChatOpen(true)}
                                className="w-full py-5 bg-[#FFC107] hover:bg-white text-[#05488B] rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl active:scale-95"
                            >
                                Start Conversation
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- FOOTER NOTE --- */}
                <div className="flex flex-col items-center opacity-40">
                    <div className="h-px w-24 bg-[#FFC107] mb-6"></div>
                    <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3">
                        <LifeBuoy size={14} /> Institutional Support Protocol v1.0.4
                    </p>
                </div>

            </div>

            {/* --- STATIC MENU-DRIVEN LIVE CHAT MODAL --- */}
            {isChatOpen && (
                <div className="fixed inset-0 bg-[#0b1120]/90 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0" onClick={() => setIsChatOpen(false)}></div>

                    <div className="relative w-full max-w-md h-[620px] max-h-[90vh] bg-white rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border-4 border-[#05488B]">

                        {/* Chat Header */}
                        <div className="p-7 bg-[#05488B] text-white flex justify-between items-center border-b-4 border-[#FFC107] relative overflow-hidden">
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-14 h-14 bg-white/10 text-[#FFC107] rounded-2xl flex items-center justify-center border-2 border-[#FFC107]/20 shadow-lg">
                                    <Bot size={28} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl tracking-tight leading-none mb-1">Support Bot</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                        <p className="text-[10px] text-blue-200 uppercase font-black tracking-widest">Active Link</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsChatOpen(false)}
                                className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all relative z-10"
                            >
                                <X size={24} strokeWidth={3} />
                            </button>
                            <Zap className="absolute -right-4 -bottom-4 text-white/5 w-24 h-24 rotate-12" />
                        </div>

                        {/* Chat Messages Area */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#F8FAFC]">
                            <div className="flex justify-center">
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">Encryption Verified</span>
                            </div>

                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-2`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md border-2 ${msg.sender === 'user' ? 'bg-[#05488B] text-[#FFC107] border-white/20' : 'bg-[#FFC107] text-[#05488B] border-white'}`}>
                                        {msg.sender === 'user' ? <User size={18} strokeWidth={2.5} /> : <Bot size={18} strokeWidth={2.5} />}
                                    </div>
                                    <div className={`p-5 rounded-[1.8rem] max-w-[85%] shadow-sm ${msg.sender === 'user' ? 'bg-[#05488B] text-white rounded-tr-none' : 'bg-white border-2 border-slate-100 text-slate-700 rounded-tl-none'}`}>
                                        <p className="text-sm font-bold leading-relaxed">{msg.text}</p>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex gap-4 animate-in fade-in">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#FFC107] text-[#05488B] border-2 border-white shadow-md">
                                        <Bot size={18} strokeWidth={2.5} />
                                    </div>
                                    <div className="p-5 rounded-[1.8rem] bg-white border-2 border-slate-100 rounded-tl-none shadow-sm flex items-center gap-1.5">
                                        <div className="w-2 h-2 bg-[#FFC107] rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-[#FFC107] rounded-full animate-bounce delay-75"></div>
                                        <div className="w-2 h-2 bg-[#FFC107] rounded-full animate-bounce delay-150"></div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Interactive Options Area */}
                        <div className="p-6 bg-white border-t-2 border-slate-100 min-h-[120px] flex items-center justify-center shadow-inner">
                            {chatOptions.length > 0 ? (
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {chatOptions.map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleOptionClick(opt)}
                                            className="px-5 py-3 bg-[#05488B]/5 hover:bg-[#05488B] text-[#05488B] hover:text-[#FFC107] border-2 border-[#05488B]/10 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Clock size={16} className="text-[#FFC107] animate-spin" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                        Processing Protocol...
                                    </p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}

            <style>{`
                .help-glowing-drop {
                    position: absolute;
                    top: -10%;
                    background: #FFC107;
                    border-radius: 50%;
                    opacity: 0;
                    box-shadow: 0 0 20px 4px #FFC107, 0 0 40px 8px rgba(255, 193, 7, 0.2);
                    animation: help-fall linear infinite;
                }
                @keyframes help-fall {
                    0% { transform: translateY(0); opacity: 0; }
                    10% { opacity: 0.6; }
                    50% { opacity: 0.3; }
                    90% { opacity: 0.6; }
                    100% { transform: translateY(110vh); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default HelpCenter;