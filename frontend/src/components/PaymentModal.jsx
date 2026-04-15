import React, { useState } from 'react';
import { Smartphone, X, ShieldCheck, Loader2, CheckCircle2, Lock, ShoppingBag, LayoutDashboard, Zap, IndianRupee } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const PaymentModal = ({ amount, isOpen, onClose, onPaymentSuccess, itemId }) => {
  const [status, setStatus] = useState('selection'); // selection | pinpad | processing | success
  const [pin, setPin] = useState("");
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin.length < 4) {
      toast.error("Enter valid 4-digit PIN");
      return;
    }
    processFinalPayment('UPI');
  };

  const processFinalPayment = async (method) => {
    setStatus('processing');
    const userEmail = localStorage.getItem("userEmail");

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/marketplace/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          item_id: parseInt(itemId),
          buyer_email: userEmail.trim().toLowerCase()
        }),
      });

      if (res.ok) {
        // Success sequence
        setTimeout(() => {
          setStatus('success');
        }, 1500);
      } else {
        const err = await res.json();
        console.error("Payment Error Data:", err);
        toast.error(err.detail || "Transaction Rejected by Server");
        setStatus('selection');
      }
    } catch (error) {
      console.error("Network Error:", error);
      toast.error("Server Connection Failed.");
      setStatus('selection');
    }
  };

  const handleGoToOrders = () => {
    onPaymentSuccess({ method: 'UPI', amount: amount });
    setStatus('selection');
    setPin("");
    navigate('/profile');
  };

  const handleBackToDashboard = () => {
    onPaymentSuccess({ method: 'UPI', amount: amount });
    setStatus('selection');
    setPin("");
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#0b1120]/90 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden relative animate-in zoom-in-95 duration-200 border-4 border-[#05488B]">

        {/* Close Button */}
        {status !== 'processing' && status !== 'success' && (
          <button onClick={onClose} className="absolute right-8 top-8 p-2 bg-slate-100 hover:bg-[#05488B] hover:text-white rounded-full z-10 transition-all">
            <X size={20} strokeWidth={3} />
          </button>
        )}

        <div className="p-10">
          {/* 1. SELECTION SCREEN */}
          {status === 'selection' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <div className="bg-[#05488B]/10 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap size={28} className="text-[#05488B] fill-[#FFC107]" />
                </div>
                <p className="text-[10px] font-black text-[#05488B] uppercase tracking-[0.3em] mb-2 flex items-center justify-center gap-1 opacity-60">
                  <Lock size={12} /> Secure Checkout
                </p>
                <div className="flex items-center justify-center gap-1 mb-2">
                  <IndianRupee size={32} className="text-[#FFC107]" strokeWidth={3} />
                  <h2 className="text-5xl font-black text-[#05488B] tracking-tighter">{amount}</h2>
                </div>
                <p className="text-[10px] font-black uppercase text-slate-400 mt-2 tracking-widest leading-none">Instant Ownership Transfer</p>
              </div>

              <div className="space-y-4 mb-10">
                <button
                  onClick={() => setStatus('pinpad')}
                  className="w-full p-6 border-2 border-[#05488B]/10 bg-slate-50 rounded-[2.5rem] flex items-center hover:border-[#FFC107] hover:bg-white hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="w-16 h-16 bg-[#05488B] rounded-2xl flex items-center justify-center mr-5 shadow-lg border-2 border-white/20 group-hover:scale-110 transition-transform">
                    <Smartphone className="text-[#FFC107]" size={32} />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-xl text-[#05488B] uppercase tracking-tight leading-none">UPI Buddy</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1.5 tracking-tighter">GPay, PhonePe, Paytm</p>
                  </div>
                </button>
              </div>

              <p className="text-[9px] text-center text-slate-300 font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2">
                <ShieldCheck size={14} strokeWidth={3} /> Institutional Grade Encryption
              </p>
            </div>
          )}

          {/* 2. PIN PAD */}
          {status === 'pinpad' && (
            <div className="animate-in slide-in-from-right-8 duration-300 text-center">
              <ShieldCheck size={48} className="mx-auto text-[#05488B] mb-4" />
              <h3 className="text-2xl font-black text-[#05488B] mb-2 uppercase tracking-tight">Enter UPI PIN</h3>
              <div className="inline-flex items-center gap-2 bg-[#FFC107]/10 px-4 py-1.5 rounded-full border border-[#FFC107]/20 mb-8">
                <span className="text-[10px] text-[#05488B] font-black uppercase tracking-widest">Amount: ₹{amount}</span>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-10">
                <div className="relative">
                  <input
                    type="password"
                    maxLength="4"
                    autoFocus
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center text-5xl tracking-[1em] font-black p-8 bg-slate-50 rounded-[3rem] border-4 border-slate-100 focus:border-[#05488B] focus:bg-white outline-none transition-all shadow-inner text-[#05488B]"
                    placeholder="****"
                  />
                </div>
                <button type="submit" disabled={pin.length < 4} className="w-full bg-[#05488B] disabled:bg-slate-200 disabled:text-slate-400 text-[#FFC107] h-20 rounded-[2.5rem] font-black uppercase text-sm tracking-[0.2em] shadow-2xl transition-all active:scale-95 border-b-8 border-black/20">
                  Secure Confirm
                </button>
              </form>
            </div>
          )}

          {/* 3. PROCESSING */}
          {status === 'processing' && (
            <div className="py-16 text-center animate-in fade-in duration-300">
              <div className="relative w-32 h-32 mx-auto mb-10">
                <div className="absolute inset-0 border-8 border-slate-100 rounded-full" />
                <Loader2 className="absolute inset-0 h-32 w-32 text-[#05488B] animate-spin" strokeWidth={3} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck size={40} className="text-[#FFC107]" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-[#05488B] mb-2 tracking-tight uppercase">Encrypting</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] animate-pulse">Synchronizing Ledger</p>
            </div>
          )}

          {/* 4. SUCCESS SCREEN */}
          {status === 'success' && (
            <div className="py-6 text-center animate-in zoom-in-90 duration-500">
              <div className="w-32 h-32 bg-emerald-50 border-4 border-white text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl relative">
                <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping"></div>
                <CheckCircle2 size={72} strokeWidth={2.5} className="relative z-10" />
              </div>
              <h3 className="text-4xl font-black text-[#05488B] mb-2 tracking-tight uppercase leading-none">Approved!</h3>
              <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest mb-10">Vault Status: <span className="text-emerald-600">Pending Handover</span></p>

              <div className="flex flex-col gap-4">
                <button
                  onClick={handleGoToOrders}
                  className="w-full bg-[#05488B] hover:bg-black text-[#FFC107] py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 shadow-2xl border-b-8 border-black/20 flex items-center justify-center gap-3"
                >
                  <ShoppingBag size={20} />
                  My Orders Console
                </button>
                <button
                  onClick={handleBackToDashboard}
                  className="w-full bg-slate-50 border-2 border-slate-200 text-slate-400 py-4 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-100 hover:text-[#05488B] transition-all active:scale-95"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;