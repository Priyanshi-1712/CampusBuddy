import React from 'react';
import { Bell, MapPin, ShieldCheck, X, Zap } from 'lucide-react';

const HandoverNotification = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed bottom-10 right-10 z-[100] animate-bounce-in">
      {/* --- 3D BLUE CONTAINER WITH YELLOW BOUNDARY --- */}
      <div className="bg-[#0b213a] border-4 border-[#FFC107] rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-sm relative overflow-hidden text-white">

        {/* Decorative Background Icon */}
        <Zap size={120} className="absolute -right-8 -bottom-8 text-white/5 rotate-12 pointer-events-none" />

        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="bg-[#FFC107] p-3 rounded-2xl shadow-lg shadow-yellow-500/20">
            <Bell size={24} className="text-[#05488B] animate-bounce" />
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-all"
          >
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        <div className="relative z-10">
          <h4 className="text-2xl font-black mb-2 tracking-tight uppercase leading-none">
            Meetup <span className="text-[#FFC107]">Live!</span>
          </h4>
          <p className="text-sm text-blue-100/70 mb-6 font-medium leading-relaxed">
            The seller for <span className="text-[#FFC107] font-black uppercase tracking-tighter">{order.title}</span> is awaiting your arrival for handover.
          </p>

          {/* LOCATION BOX */}
          <div className="bg-[#05488B] rounded-2xl p-5 mb-5 border-2 border-white/5 shadow-inner">
            <div className="flex items-center gap-3 mb-2">
              <MapPin size={18} className="text-[#FFC107]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFC107]/60">Check-in Point</span>
            </div>
            <p className="text-sm font-black text-white">{order.meetup_location || "Campus Central Hub"}</p>
          </div>

          {/* SECURITY OTP TOKEN */}
          <div className="flex items-center justify-between p-4 bg-white/5 border-2 border-[#FFC107]/30 rounded-2xl shadow-2xl">
            <div className="flex items-center gap-3">
              <ShieldCheck size={24} className="text-[#FFC107]" />
              <div>
                <p className="text-[9px] font-black uppercase text-[#FFC107] tracking-widest leading-none mb-1">Security Key</p>
                <p className="text-2xl font-mono font-black tracking-[0.4em] text-white">
                  {order.otp_code || "####"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-2 px-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FFC107] mt-1 shrink-0 animate-pulse"></div>
            <p className="text-[9px] text-blue-200/50 font-black uppercase tracking-widest leading-tight">
              Release this code to the seller only after inspecting your item in person.
            </p>
          </div>
        </div>
      </div>

      <style>{`
                @keyframes bounce-in {
                    0% { transform: scale(0.8); opacity: 0; }
                    70% { transform: scale(1.05); }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-bounce-in {
                    animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
            `}</style>
    </div>
  );
};

export default HandoverNotification;