import React, { useState } from 'react';
import { Mail, Phone, Facebook, Instagram, Twitter, Linkedin, ChevronRight, Apple, PlayCircle, X, ShieldCheck, FileText, Zap, BellRing, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';

const Footer = () => {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);
    const [modalContent, setModalContent] = useState(null);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://127.0.0.1:8000/api/subscribe", {
                email: email
            });

            if (response.data.status === "success") {
                setSubscribed(true);
                toast.success("Welcome to the inner circle! Check your mail. 📧");
            }
        } catch (err) {
            console.error("Subscription Error:", err);
            toast.error("Nexus down. Try again later!");
        }
    };

    return (
        <footer className="bg-[#0b1120] text-slate-400 font-sans relative overflow-hidden">
            {/* Top Branded Accent Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#05488B] via-[#FFC107] to-[#05488B]"></div>

            <div className="max-w-7xl mx-auto pt-20 pb-10 px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-16">

                    {/* Section 1: Brand Identity */}
                    <div className="md:col-span-4 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#05488B] border-2 border-[#FFC107] rounded-2xl flex items-center justify-center text-[#FFC107] font-black text-2xl shadow-xl shadow-blue-900/40">
                                CB
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tighter leading-none uppercase">Campus<span className="text-[#FFC107]">Buddy</span></h2>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-blue-400 font-bold mt-1">Poornima Network</p>
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-400 font-medium italic">
                            "Built for the hustle, designed for the campus."
                            The official peer-to-peer ecosystem for Poornima students.
                            Simplify your campus life with smarter trades and shared journeys.
                        </p>

                        <div className="space-y-4 pt-4">
                            <h3 className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                <span className="w-8 h-px bg-[#FFC107]"></span> Download our app
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-3 bg-white/5 border border-white/10 py-2.5 px-5 rounded-xl opacity-50 cursor-not-allowed group transition-all hover:bg-white/10">
                                    <Apple className="text-white" size={20} />
                                    <div className="text-left">
                                        <p className="text-[9px] text-slate-500 leading-none font-black uppercase">Coming soon on</p>
                                        <p className="text-xs text-white font-bold leading-tight mt-0.5">App Store</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white/5 border border-white/10 py-2.5 px-5 rounded-xl opacity-50 cursor-not-allowed group transition-all hover:bg-white/10">
                                    <PlayCircle className="text-white" size={20} />
                                    <div className="text-left">
                                        <p className="text-[9px] text-slate-500 leading-none font-black uppercase">Coming soon on</p>
                                        <p className="text-xs text-white font-bold leading-tight mt-0.5">Google Play</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Navigation Links */}
                    <div className="md:col-span-2">
                        <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                            Navigation
                        </h3>
                        <ul className="space-y-4">
                            {['Marketplace', 'Ride Buddy', 'My Profile', 'Post Listing'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="group flex items-center gap-2 hover:text-[#FFC107] transition-all duration-300 text-sm font-medium">
                                        <ChevronRight size={14} className="text-[#FFC107] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Section 3: NEW CREATIVE STAY TUNED (Newsletter & Social) */}
                    <div className="md:col-span-6 space-y-12">
                        <div className="space-y-5 bg-white/5 p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                            {/* Background Glow */}
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#FFC107]/10 rounded-full blur-3xl group-hover:bg-[#FFC107]/20 transition-all duration-700"></div>

                            <div className="flex flex-col gap-1 relative z-10">
                                <h3 className="text-white font-black text-2xl tracking-tighter flex items-center gap-3">
                                    Stay Informed <BellRing size={22} className="text-[#FFC107] animate-bounce" />
                                </h3>
                                <p className="text-[10px] text-[#FFC107] font-black uppercase tracking-[0.4em] mb-4">Don't Miss The Best Deals</p>
                            </div>

                            <AnimatePresence mode="wait">
                                {!subscribed ? (
                                    <motion.form
                                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                        onSubmit={handleSubscribe} className="flex group relative"
                                    >
                                        <div className="relative flex-grow">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#FFC107] transition-colors" size={18} />
                                            <input
                                                required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Your university email"
                                                className="w-full bg-black/40 border border-white/10 text-white pl-12 pr-4 py-5 rounded-2xl outline-none text-sm transition-all focus:border-[#FFC107] focus:ring-1 focus:ring-[#FFC107]/30"
                                            />
                                        </div>
                                        <button type="submit" className="absolute right-2 top-2 bottom-2 bg-[#FFC107] hover:bg-white text-[#05488B] px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl">
                                            Join Now
                                        </button>
                                    </motion.form>
                                ) : (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                        className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl flex items-center gap-5 text-emerald-400"
                                    >
                                        <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-[#0b1120] shrink-0">
                                            <ShieldCheck size={28} strokeWidth={3} />
                                        </div>
                                        <div>
                                            <p className="text-base font-black text-white leading-tight uppercase tracking-tighter">You're on the list!</p>
                                            <p className="text-xs font-bold opacity-70 mt-1">We've linked <span className="text-[#FFC107] underline">{email}</span>. Verification successful!</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex items-center gap-4 relative z-10">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0b1120] bg-slate-800 flex items-center justify-center text-[10px] font-black text-blue-400 uppercase">
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
                                    *Join our student network to get instant alerts on new listings, exclusive campus deals, and upcoming ride shares.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-white/5 pt-8">
                            <div className="space-y-4">
                                <h4 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Support Nexus</h4>
                                <div className="flex items-center gap-3 group cursor-pointer">
                                    <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:border-[#FFC107]/50 transition-all">
                                        <Mail size={16} className="text-[#FFC107]" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">support@campusbuddy.edu</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Follow Us</h4>
                                <div className="flex gap-3">
                                    {[Facebook, Instagram, Twitter, Linkedin].map((Icon, idx) => (
                                        <a key={idx} href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#05488B] hover:text-[#FFC107] hover:border-[#FFC107] hover:-translate-y-1 transition-all shadow-lg">
                                            <Icon size={16} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 4: Footer Credits */}
                <div className="pt-10 border-t border-white/5">
                    <div className="bg-gradient-to-br from-[#161e2e] to-[#0b1120] rounded-[2.5rem] p-10 border border-white/5 shadow-inner text-center space-y-8 relative overflow-hidden">
                        {/* Aesthetic Background Pattern */}
                        <div className="absolute inset-0 premium-bg-pattern opacity-30"></div>

                        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
                            <div className="inline-flex items-center gap-2 bg-[#FFC107]/10 text-[#FFC107] px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-[#FFC107]/20">
                                <Sparkles size={12} /> Engineering Excellence
                            </div>
                            <p className="text-sm md:text-base text-slate-400 leading-relaxed font-medium">
                                This innovative project is designed and developed by Team <span className="text-[#FFC107] font-bold tracking-wide uppercase px-1">FutureBits</span> as a part of our commitment to enhancing campus connectivity and student collaboration.
                            </p>
                            <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">
                                Engineering Excellence — Project <span className="text-white">CampusBuddy 1.0</span>
                            </p>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/5 relative z-10">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                                © {new Date().getFullYear()} CampusBuddy — Built for Students, By Students.
                            </p>
                            <div className="flex gap-8 text-[10px] uppercase tracking-widest font-black text-slate-500">
                                <button onClick={() => setModalContent('privacy')} className="hover:text-[#FFC107] transition-colors">Privacy Policy</button>
                                <button onClick={() => setModalContent('terms')} className="hover:text-[#FFC107] transition-colors">Terms of Service</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {modalContent && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center p-4 bg-[#0b1120]/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ y: 100, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 100, scale: 0.95 }}
                            className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl border-4 border-[#05488B]"
                        >
                            <div className="p-6 bg-[#05488B] text-white flex justify-between items-center border-b-4 border-[#FFC107]">
                                <div className="flex items-center gap-3">
                                    {modalContent === 'privacy' ? <ShieldCheck className="text-[#FFC107]" /> : <FileText className="text-[#FFC107]" />}
                                    <h3 className="font-black uppercase tracking-widest text-sm">{modalContent === 'privacy' ? 'Privacy Shield' : 'Community Rules'}</h3>
                                </div>
                                <button onClick={() => setModalContent(null)} className="p-2 hover:bg-white/10 rounded-full transition-all hover:rotate-90"><X size={20} /></button>
                            </div>
                            <div className="p-10 max-h-[60vh] overflow-y-auto text-slate-600 text-sm leading-relaxed space-y-6 custom-scrollbar">
                                {modalContent === 'privacy' ? (
                                    <>
                                        <h4 className="font-black text-[#05488B] text-xl">1. Institutional Integrity</h4>
                                        <p>At CampusBuddy, we exclusively collect your official university email and full name. This data is strictly used for peer verification and campus safety.</p>
                                        <h4 className="font-black text-[#05488B] text-xl">2. Transaction Security</h4>
                                        <p>All marketplace negotiations and ride-sharing coordinates are encrypted and stored to protect students from external bad actors.</p>
                                    </>
                                ) : (
                                    <>
                                        <h4 className="font-black text-[#05488B] text-xl">1. Student Eligibility</h4>
                                        <p>This platform is exclusively for verified students. Use of third-party emails or fake IDs results in a permanent hardware ban.</p>
                                        <h4 className="font-black text-[#05488B] text-xl">2. Peer Conduct</h4>
                                        <p>Respect, punctuality for rides, and honesty in marketplace listings are the pillars of this community. Harassment will not be tolerated.</p>
                                    </>
                                )}
                            </div>
                            <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
                                <button onClick={() => setModalContent(null)} className="bg-[#05488B] text-[#FFC107] px-12 py-4 rounded-2xl font-black uppercase tracking-widest hover:shadow-lg transition-all border-2 border-[#05488B]">Got it</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .premium-bg-pattern {
                    background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
                    background-size: 30px 30px;
                }
            `}</style>
        </footer>
    );
};

export default Footer;