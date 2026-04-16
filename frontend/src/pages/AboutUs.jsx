import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Users,
    Rocket,
    ShieldCheck,
    Zap,
    Star,
    Code2,
    Target
} from 'lucide-react';

const AboutUs = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#05488B] p-6 pt-24 pb-12 font-sans relative overflow-hidden text-white">

            {/* --- GLOWING YELLOW RAIN EFFECT --- */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {[...Array(25)].map((_, i) => (
                    <div
                        key={i}
                        className="about-glowing-drop"
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

                {/* --- BACK BUTTON --- */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 p-3 bg-[#0b213a] rounded-2xl shadow-xl border-2 border-white/10 text-[#FFC107] hover:scale-110 active:scale-90 transition-all group"
                >
                    <ChevronLeft size={24} strokeWidth={3} />
                </button>

                {/* --- HERO SECTION --- */}
                <div className="bg-[#0b213a] rounded-[3rem] p-10 md:p-14 text-white mb-10 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] border-4 border-[#FFC107]">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-[#05488B] p-2.5 rounded-xl border border-white/10 shadow-lg">
                                <Code2 size={24} className="text-[#FFC107]" />
                            </div>
                            <span className="text-[#FFC107] font-black uppercase tracking-[0.3em] text-[10px]">Architected by FutureBits</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter uppercase leading-none">
                            Campus <span className="text-[#FFC107]">Buddy.</span>
                        </h1>
                        <p className="text-blue-100/70 leading-relaxed max-w-lg font-bold text-lg italic">
                            A passion project born out of the dorm rooms of Poornima. Created by a team of 4 dedicated college students—<span className="text-[#FFC107] not-italic underline decoration-2 underline-offset-4">FutureBits</span>—to bridge the gap between campus needs and student resources.
                        </p>
                    </div>
                    <Rocket className="absolute -right-12 -bottom-12 text-white/5 rotate-12 pointer-events-none" size={320} />
                </div>

                {/* --- APP FEATURES SECTION --- */}
                <h2 className="text-[10px] font-black text-[#FFC107] uppercase tracking-[0.5em] mb-8 ml-6 opacity-60">System Core Values</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
                    <FeatureCard
                        icon={<Zap size={28} className="fill-[#FFC107] text-[#FFC107]" />}
                        title="Lightning Fast"
                        desc="Instant listings and real-time ride tracking for busy students."
                    />
                    <FeatureCard
                        icon={<ShieldCheck size={28} className="text-emerald-400" />}
                        title="Safe & Verified"
                        desc="Strictly for Poornima students. No outsiders, no scams, just peers."
                    />
                    <FeatureCard
                        icon={<Star size={28} className="text-[#FFC107]" />}
                        title="Campus Specific"
                        desc="Optimized routes and item categories tailored to our college life."
                    />
                </div>

                {/* --- OUR VISION --- */}
                <div className="bg-[#0b213a] p-10 md:p-12 rounded-[3.5rem] border-4 border-white/5 mb-14 relative overflow-hidden group">
                    <div className="flex flex-col md:flex-row gap-10 items-center relative z-10">
                        <div className="shrink-0 w-24 h-24 bg-[#05488B] rounded-[2.5rem] flex items-center justify-center text-[#FFC107] shadow-2xl border-2 border-white/10 group-hover:rotate-12 transition-transform duration-500">
                            <Target size={48} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">The FutureBits Mission</h3>
                            <p className="text-blue-100/60 font-bold leading-loose text-base">
                                We believe that technology should serve the community. Our goal was to create a digital ecosystem where every student can save money, reduce their carbon footprint through ride-sharing, and find essential academic resources without the hassle.
                            </p>
                        </div>
                    </div>
                    <Zap className="absolute -left-10 -bottom-10 text-white/5 w-40 h-40" />
                </div>

                {/* --- THE TEAM --- */}
                <div className="bg-[#0b213a] rounded-[3rem] p-10 text-center border-b-8 border-[#FFC107] shadow-2xl">
                    <Users className="mx-auto mb-6 text-[#FFC107]" size={40} strokeWidth={2.5} />
                    <h4 className="text-2xl font-black mb-2 tracking-tight uppercase">Meet the Minds</h4>
                    <p className="text-blue-300/40 text-[10px] font-black uppercase tracking-[0.4em] mb-8">Engineering Team FutureBits</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {["Baraka_Johnson_Amani", "Priyanshi_Varshney", "Ridhi_Nirwan", "Shyam_Kumar_Sharma"].map((member) => (
                            <span key={member} className="px-5 py-3 bg-[#05488B] hover:bg-[#FFC107] hover:text-[#05488B] rounded-2xl text-[11px] font-black border-2 border-white/5 shadow-lg transition-all cursor-default">
                                @{member}
                            </span>
                        ))}
                    </div>
                </div>

            </div>

            <style>{`
                .about-glowing-drop {
                    position: absolute;
                    top: -10%;
                    background: #FFC107;
                    border-radius: 50%;
                    opacity: 0;
                    box-shadow: 0 0 20px 4px #FFC107, 0 0 40px 8px rgba(255, 193, 7, 0.2);
                    animation: about-fall linear infinite;
                }
                @keyframes about-fall {
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

// Helper Component
const FeatureCard = ({ icon, title, desc }) => (
    <div className="bg-[#0b213a] p-8 rounded-[2.5rem] border-2 border-white/5 hover:border-[#FFC107] transition-all duration-300 hover:shadow-2xl group flex flex-col items-center text-center">
        <div className="p-5 bg-[#05488B] rounded-2xl w-fit mb-6 shadow-xl border border-white/5 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
            {icon}
        </div>
        <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight leading-none">{title}</h3>
        <p className="text-blue-100/50 text-sm font-bold leading-relaxed">{desc}</p>
    </div>
);

export default AboutUs;