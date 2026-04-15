import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Car, Wallet, ArrowRight, Star, Users,
  Shield, Zap, Fingerprint, BookOpen, Clock,
  ShieldCheck, Mail, Apple, PlayCircle,
  Facebook, Instagram, Twitter, Linkedin, X, FileText,
  ChevronRight, Sparkles, Trophy, Flame, ChevronDown, Activity,
  Globe, Eye, Lock as LockIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import handshakeImg from "../assets/handshake.png";

const LandingPage = () => {
  const navigate = useNavigate();
  const [scroll, setScroll] = useState(0);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScroll((window.scrollY / total) * 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  };

  return (
    <div className="bg-[#FFFFFF] text-[#0F172A] font-sans overflow-x-hidden selection:bg-[#FFC107] selection:text-[#05488B]">

      {/* Scroll Bar */}
      <div className="fixed top-0 left-0 h-1.5 bg-gradient-to-r from-[#05488B] to-[#FFC107] z-[110]" style={{ width: `${scroll}%` }} />

      {/* --- PREMIUM FLOATING NAVBAR --- */}
      <div className="fixed top-6 left-0 right-0 z-[100] px-4 flex justify-center">
        <nav
          className="flex items-center justify-between w-full max-w-7xl bg-white/80 backdrop-blur-2xl border border-slate-200/60 px-8 py-4 rounded-[2rem] shadow-2xl shadow-slate-200/50"
          onMouseLeave={() => setActiveMenu(null)}
        >
          <div className="flex items-center gap-6">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="w-10 h-10 bg-[#05488B] rounded-2xl flex items-center justify-center text-[#FFC107] font-black text-xl shadow-lg">CB</div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-[#05488B] uppercase leading-none">CampusBuddy</span>
                <span className="text-[8px] font-black tracking-[0.3em] text-slate-400 uppercase leading-none mt-1">Poornima Exclusive</span>
              </div>
            </motion.div>
          </div>

          <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {/* ECOSYSTEM MEGA MENU */}
            <div className="relative py-2 group cursor-pointer" onMouseEnter={() => setActiveMenu('ecosystem')}>
              <motion.span
                whileTap={{ y: 2 }}
                className={`flex items-center gap-1 transition-colors ${activeMenu === 'ecosystem' ? 'text-[#05488B]' : ''}`}
              >
                Ecosystem <ChevronDown size={12} className={`transition-transform duration-300 ${activeMenu === 'ecosystem' ? 'rotate-180' : ''}`} />
              </motion.span>

              {/* MEGA MENU: ECOSYSTEM CONTENT */}
              <AnimatePresence>
                {activeMenu === 'ecosystem' && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.98 }}
                    className="absolute top-full -left-20 mt-4 w-[480px] bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.15)] p-8 grid grid-cols-2 gap-6"
                  >
                    {/* 1. MARKETPLACE ITEM */}
                    <motion.div
                      whileHover={{ x: 5, backgroundColor: "rgba(241, 245, 249, 0.5)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setActiveMenu(null); // Close menu on click
                        navigate("/marketplace");
                      }}
                      className="group/item flex items-start gap-4 cursor-pointer p-3 rounded-2xl transition-all"
                    >
                      <div className="p-4 bg-blue-50 rounded-2xl text-[#05488B] group-hover/item:bg-[#05488B] group-hover/item:text-white transition-all shadow-sm">
                        <ShoppingCart size={22} />
                      </div>
                      <div className="text-left">
                        <p className="text-[#05488B] font-black text-xs uppercase tracking-tight">Marketplace</p>
                        <p className="text-[10px] lowercase text-slate-400 font-bold mt-1 leading-tight">
                          Verified peer <br /> resource trade
                        </p>
                      </div>
                    </motion.div>

                    {/* 2. RIDE BUDDY ITEM */}
                    <motion.div
                      whileHover={{ x: 5, backgroundColor: "rgba(241, 245, 249, 0.5)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setActiveMenu(null); // Close menu on click
                        navigate("/rides");
                      }}
                      className="group/item flex items-start gap-4 cursor-pointer p-3 rounded-2xl transition-all"
                    >
                      <div className="p-4 bg-slate-50 rounded-2xl text-slate-600 group-hover/item:bg-slate-900 group-hover/item:text-white transition-all shadow-sm">
                        <Car size={22} />
                      </div>
                      <div className="text-left">
                        <p className="text-[#05488B] font-black text-xs uppercase tracking-tight">Ride Buddy</p>
                        <p className="text-[10px] lowercase text-slate-400 font-bold mt-1 leading-tight">
                          Secure peer <br /> transit sharing
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.a whileTap={{ scale: 0.9 }} href="#how" className="hover:text-[#05488B] transition-colors">The Flow</motion.a>
            <motion.a whileTap={{ scale: 0.9 }} href="#security" className="hover:text-[#05488B] transition-colors">Security</motion.a>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/login")} className="text-[10px] font-black uppercase tracking-widest text-[#05488B] hidden sm:block px-4">Login</button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("/signup")}
              className="bg-[#05488B] text-[#FFC107] px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-blue-900/20"
            >
              Get Started
            </motion.button>
          </div>
        </nav>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 pt-40 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#FFC107]/10 border border-[#FFC107]/20 px-5 py-2 rounded-full text-[9px] font-black tracking-[0.3em] uppercase text-[#05488B] mb-10 shadow-sm">
            <Sparkles size={12} fill="currentColor" /> Official Student Resource Hub
          </div>

          <h1 className="text-6xl md:text-[9rem] font-black text-[#05488B] leading-[0.8] tracking-[-0.05em] mb-12 uppercase">
            Market. Ride. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#05488B] via-[#FFC107] to-[#05488B] italic">Collaborate.</span>
          </h1>

          <p className="text-xl md:text-3xl font-bold text-slate-400 max-w-4xl mx-auto leading-tight mb-16 uppercase tracking-tight">
            The private network for Poornimites. <br />
            Trade notes, share rides, and manage campus finances in one secure place.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {/* <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/signup")}
              className="bg-[#05488B] text-[#FFC107] px-16 py-8 rounded-[3rem] text-2xl font-black uppercase tracking-widest shadow-[0_30px_60px_-12px_rgba(5,72,139,0.4)] hover:scale-105 transition-all"
            >
              Get Started
            </motion.button> */}
          </div>
        </motion.div>

        {/* IMAGE BLOCK */}
        <motion.div
          initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="mt-32 max-w-5xl w-full px-4 relative group"
        >
          <div className="relative bg-slate-50/50 p-4 rounded-[4rem] border border-slate-200/50 shadow-inner">
            <img src={handshakeImg} className="rounded-[3.5rem] w-full h-auto object-contain shadow-2xl transition-all duration-1000" alt="Verification" />
            <div className="absolute -top-6 -left-6 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-4 animate-bounce">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><ShieldCheck size={28} /></div>
              <div className="text-left"><p className="text-[10px] font-black uppercase text-slate-400">Trust Rank</p><p className="text-sm font-black text-[#05488B] uppercase">99% Verified</p></div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* --- ECOSYSTEM PILLARS --- */}
      <section id="about" className="py-40 px-6 bg-[#05488B] text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-32">
            <h4 className="text-[#FFC107] font-black text-xs uppercase tracking-[0.4em] mb-4">The Campusbuddy ecosystem</h4>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none">High-Velocity <br /> Student Utility.</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-16">
            {[
              { icon: <BookOpen size={40} />, title: "Market Buddy", desc: "Access verified notes, previous papers, and lab manuals from top seniors. Buy what you need or sell your own prep." },
              { icon: <Car size={40} />, title: "Ride Buddy", desc: "Find students commuting your way. Reduce travel costs, share the fuel, and travel with people you know." },
              { icon: <Wallet size={40} />, title: "Virtual Wallet", desc: "Earn for your notes and listings. Our secure wallet processes daily settlements every night at 9 PM." }
            ].map((item, i) => (
              <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.2 }} className="space-y-6 group">
                <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-[#FFC107] group-hover:bg-[#FFC107] group-hover:text-[#05488B] transition-all duration-500">
                  {item.icon}
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tight">{item.title}</h3>
                <p className="text-blue-100/60 font-bold text-lg leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS: THE FLOW --- */}
      <section id="how" className="py-40 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <motion.div {...fadeInUp}>
              <h2 className="text-5xl md:text-7xl font-black text-[#05488B] tracking-tighter uppercase leading-none mb-10">THE CAMPUS <br /> WORKFLOW.</h2>
              <p className="text-xl text-slate-400 font-bold leading-relaxed mb-12">Designed to be efficient. Register once and access the entire Poornima peer-to-peer network.</p>
              <div className="space-y-8">
                {[
                  { step: "01", title: "Institutional Sign-in", desc: "Only @poornima.edu.in emails can bypass the perimeter." },
                  { step: "02", title: "ID Authentication", desc: "Our AI scans your physical ID card to verify your identity." },
                  { step: "03", title: "List or Request", desc: "Upload your notes to the Vault or post a ride offer." },
                  { step: "04", title: "Safe Settlement", desc: "Trade via OTP handovers and get earnings credited to your wallet." }
                ].map((s, i) => (
                  <div key={i} className="flex gap-6 items-start border-l-2 border-slate-200 pl-8 relative ml-4 group">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200 group-hover:bg-[#FFC107] transition-colors" />
                    <span className="text-sm font-black text-[#FFC107] uppercase">{s.step}</span>
                    <div>
                      <h4 className="text-xl font-black text-[#05488B] uppercase tracking-tight">{s.title}</h4>
                      <p className="text-slate-500 font-medium">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div {...fadeInUp} className="bg-white p-4 rounded-[4rem] shadow-2xl border border-slate-100 rotate-2">
              <div className="bg-[#0b1120] rounded-[3.5rem] p-16 text-center space-y-8">
                <Activity className="text-[#FFC107] mx-auto animate-pulse" size={64} />
                <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic">Live Pulse</h3>
                <div className="space-y-4 text-left">
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5 text-slate-400 text-sm flex justify-between items-center">
                    <span className="flex items-center gap-2"><Car size={16} /> Active Rides</span>
                    <span className="text-[#FFC107] font-black">42</span>
                  </div>
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5 text-slate-400 text-sm flex justify-between items-center">
                    <span className="flex items-center gap-2"><FileText size={16} /> Resources Sold</span>
                    <span className="text-[#FFC107] font-black">156</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- SECURITY SECTION --- */}
      <section id="security" className="py-40 px-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#033A70] via-[#FFC107] to-[#033A70] shadow-xl z-20"></div>

        <div className="max-w-7xl mx-auto relative z-10 pt-8"> {/* Added padding to separate content from bar */}
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="flex-1">
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none mb-10 text-[#FFC107]">GATED. <br /> VERIFIED. <br /> SECURE.</h2>
              <p className="text-2xl text-slate-400 font-medium leading-relaxed mb-12">CampusBuddy is built on trust. Every user is a verified peer, and every transaction is tracked by our secure protocol.</p>
              <div className="grid grid-cols-2 gap-8">
                <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem]">
                  <Fingerprint className="text-[#FFC107] mb-4" />
                  <h5 className="font-black uppercase text-xs mb-2 italic">Identity AI</h5>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Cross-verification of ID cards with facial recognition.</p>
                </div>
                <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem]">
                  <LockIcon className="text-[#FFC107] mb-4" />
                  <h5 className="font-black uppercase text-xs mb-2 italic">OTP Handover</h5>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Transactions only complete when you verify with a code.</p>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full flex justify-center">
              <div className="relative">
                <div className="absolute -inset-10 bg-[#05488B]/30 blur-[120px] rounded-full" />
                <div className="relative w-80 h-80 bg-gradient-to-br from-[#05488B] to-slate-950 border-4 border-white/10 rounded-full flex items-center justify-center shadow-2xl">
                  <ShieldCheck size={120} className="text-[#FFC107]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white text-[#0F172A] pt-40 pb-20 px-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <div className="flex flex-col items-center gap-6">
            <motion.div
              whileHover={{ rotate: 10 }}
              className="w-16 h-16 bg-[#05488B] rounded-2xl flex items-center justify-center text-[#FFC107] font-black text-3xl shadow-xl"
            >
              CB
            </motion.div>

            <h2 className="text-4xl font-black tracking-tighter uppercase italic text-[#05488B]">CampusBuddy</h2>

            <p className="text-xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed">
              This innovative project is designed and developed by Team
              <span className="text-[#FFC107] font-black px-2 uppercase tracking-wide">FutureBits</span>
              as a part of our commitment to enhancing campus connectivity and student collaboration.
            </p>
          </div>

          <div className="pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright Line */}
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#0F172A]">
              ©  2026 CampusBuddy — Built for Students, By Students.


            </p>

            {/* Social Icons */}
            <div className="flex gap-6">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, idx) => (
                <motion.a
                  key={idx}
                  href="#"
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-[#05488B] hover:text-[#FFC107] transition-all duration-300"
                >
                  <Icon size={22} strokeWidth={2.5} />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;