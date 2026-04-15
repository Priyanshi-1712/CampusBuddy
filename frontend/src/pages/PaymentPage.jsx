import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    Smartphone, Loader2, ShieldCheck, CheckCircle2, X, Lock, Zap,
    IndianRupee, Car, MapPin, ArrowRight
} from 'lucide-react';

const PaymentPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    const [isProcessing, setIsProcessing] = useState(false);
    const [showPinPad, setShowPinPad] = useState(false);
    const [pin, setPin] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [bookingDetails, setBookingDetails] = useState(null);

    useEffect(() => {
        if (!state || !state.rideId) navigate('/rides'); // Corrected navigation path
    }, [state, navigate]);

    const handleInitialPayClick = () => {
        setShowPinPad(true);
    };

    const handlePinSubmit = (e) => {
        e.preventDefault();
        if (pin.length < 4) {
            toast.error("Enter valid 4-digit PIN");
            return;
        }
        setShowPinPad(false);
        processFinalBooking();
    };

    const processFinalBooking = async () => {
        setIsProcessing(true);
        // Realistic banking delay
        setTimeout(async () => {
            try {
                const userEmail = localStorage.getItem("userEmail");

                // --- UPDATED LOGIC FOR SUBMISSION ---
                const res = await fetch(`http://127.0.0.1:8000/api/rides/${state.rideId}/book`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({ booker_email: userEmail }),
                });

                const data = await res.json();

                if (res.ok) {
                    // Save the driver and vehicle info returned from backend
                    setBookingDetails(data.ride_info || data);
                    setShowSuccessModal(true);
                    toast.success("Payment Verified!");
                } else {
                    // Enhanced error handling to show specific backend crash messages if any
                    const errorMsg = data.detail || "Transaction Failed";
                    toast.error(errorMsg);
                    console.error("Payment Crash Detail:", data);
                    setIsProcessing(false);
                }
            } catch (error) {
                // CORS or Network error fallback
                toast.error("Network Connectivity Issue.");
                console.error("Fetch Error:", error);
                setIsProcessing(false);
            }
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 pt-20 font-sans relative overflow-hidden">

            {/* Theme Background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#05488B]/5 rounded-full -mr-48 -mt-48 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFC107]/5 rounded-full -ml-48 -mb-48 pointer-events-none" />

            <div className={`w-full ${showSuccessModal ? 'max-w-lg' : 'max-w-md'} bg-white rounded-[3rem] shadow-[0_20px_60px_rgba(5,72,139,0.15)] relative overflow-hidden border-2 border-[#05488B]/5 transition-all duration-500`}>

                {/* Header Gradient Line */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#05488B] via-[#FFC107] to-[#05488B]" />

                {!showSuccessModal && !isProcessing && (
                    <button onClick={() => navigate(-1)} className="absolute right-8 top-8 text-slate-300 hover:text-[#05488B] z-10 transition-all p-1 bg-slate-50 rounded-full">
                        <X size={20} strokeWidth={3} />
                    </button>
                )}

                <div className="p-8 md:p-10">
                    {/* 1. INITIAL PAYMENT UI */}
                    {!showPinPad && !showSuccessModal && !isProcessing && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center mb-8">
                                <div className="bg-[#05488B]/10 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#05488B]/5">
                                    <Zap size={28} className="text-[#05488B] fill-[#FFC107]" />
                                </div>
                                <p className="text-[10px] font-black text-[#05488B] uppercase tracking-[0.3em] mb-2 flex items-center justify-center gap-1 opacity-60">
                                    <Lock size={12} strokeWidth={3} /> Secure Checkout
                                </p>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-1 uppercase">Instant Book</h2>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                    <MapPin size={10} /> To: {state?.destination}
                                </p>
                            </div>

                            <div className="bg-[#05488B] rounded-[2.5rem] p-10 text-white mb-10 shadow-2xl relative overflow-hidden border-b-8 border-[#FFC107]">
                                <div className="relative z-10 text-center">
                                    <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.2em] mb-3 opacity-60">Payable Amount</p>
                                    <div className="flex items-center justify-center gap-1">
                                        <IndianRupee size={32} className="text-[#FFC107]" strokeWidth={3} />
                                        <h1 className="text-5xl font-black tracking-tighter">{state?.price}</h1>
                                    </div>
                                </div>
                                <Zap className="absolute -right-6 -bottom-6 text-white/5 w-32 h-32 rotate-12" />
                            </div>

                            <button
                                onClick={handleInitialPayClick}
                                className="w-full bg-[#05488B] text-[#FFC107] h-[80px] rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 hover:bg-black hover:text-white transition-all shadow-xl active:scale-95 border-b-4 border-black/20"
                            >
                                Authorize UPI <Zap size={20} fill="currentColor" />
                            </button>
                        </div>
                    )}

                    {/* 2. PIN PAD */}
                    {showPinPad && (
                        <div className="animate-in zoom-in-95 duration-200">
                            <div className="text-center mb-10">
                                <ShieldCheck size={48} className="mx-auto text-[#05488B] mb-4" />
                                <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Identity Check</h3>
                                <p className="text-[10px] text-[#05488B] font-black uppercase bg-[#FFC107]/10 px-4 py-1.5 rounded-full inline-block border border-[#FFC107]/20">
                                    Confirming ₹{state?.price}
                                </p>
                            </div>

                            <form onSubmit={handlePinSubmit} className="space-y-10">
                                <input
                                    type="password"
                                    maxLength="4"
                                    autoFocus
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                                    className="w-full text-center text-5xl tracking-[1em] font-black p-8 bg-slate-50 rounded-[3rem] border-4 border-slate-100 focus:border-[#05488B] focus:bg-white outline-none transition-all text-[#05488B]"
                                    placeholder="****"
                                />
                                <button
                                    type="submit"
                                    disabled={pin.length < 4}
                                    className="w-full bg-[#05488B] disabled:bg-slate-200 disabled:text-slate-400 text-[#FFC107] h-20 rounded-[2.5rem] font-black uppercase text-sm tracking-[0.2em] shadow-2xl transition-all active:scale-95 border-b-4 border-black/20"
                                >
                                    Confirm & Book
                                </button>
                            </form>
                        </div>
                    )}

                    {/* 3. PROCESSING */}
                    {isProcessing && !showSuccessModal && (
                        <div className="py-20 text-center animate-in fade-in duration-300">
                            <div className="relative w-32 h-32 mx-auto mb-10">
                                <div className="absolute inset-0 border-8 border-slate-100 rounded-full" />
                                <Loader2 className="absolute inset-0 h-32 w-32 text-[#05488B] animate-spin" strokeWidth={3} />
                                <ShieldCheck size={40} className="absolute inset-0 m-auto text-[#FFC107]" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 mb-2 uppercase">Validating</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] animate-pulse">Assigning Buddy Driver</p>
                        </div>
                    )}

                    {/* 4. SUCCESS TICKET */}
                    {showSuccessModal && bookingDetails && (
                        <div className="animate-in zoom-in-90 duration-500">
                            {/* GREEN HEADER - PRESERVED */}
                            <div className="bg-emerald-500 -mx-10 -mt-10 p-8 text-white text-center mb-8">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h2 className="text-3xl font-black uppercase tracking-tighter">Ride Confirmed!</h2>
                                <p className="text-emerald-100 font-bold text-[10px] uppercase tracking-widest mt-1">
                                    Transaction ID: PU-{Math.floor(Math.random() * 90000) + 10000}
                                </p>
                            </div>

                            <div className="space-y-6">
                                {/* Driver Info Card - UPDATED WITH DYNAMIC NAME */}
                                <div className="flex justify-between items-center px-2">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirmed Driver</p>
                                        <p className="text-2xl font-black text-[#05488B] uppercase">
                                            {bookingDetails.driver_name || "Verified Buddy"}
                                        </p>
                                    </div>
                                    <div className="bg-green-100 p-2 rounded-xl text-green-600">
                                        <ShieldCheck size={28} />
                                    </div>
                                </div>

                                {/* Vehicle Badge Section - UPDATED WITH DYNAMIC MODEL AND PLATE */}
                                <div className="bg-slate-50 p-6 rounded-[2.5rem] border-2 border-slate-100 relative">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-[#05488B] rounded-2xl flex items-center justify-center text-[#FFC107]">
                                            <Car size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Assigned Vehicle</p>
                                            <p className="text-md font-black text-slate-800 uppercase">
                                                {bookingDetails.vehicle_model || "Private Vehicle"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-[#05488B] p-4 rounded-2xl text-center shadow-lg border-b-4 border-black/20">
                                        <p className="text-[9px] font-black text-blue-200 uppercase tracking-[0.3em] mb-1">Vehicle Plate Number</p>
                                        <p className="text-2xl font-black text-[#FFC107] tracking-[0.1em]">
                                            {bookingDetails.vehicle_no || "VERIFIED"}
                                        </p>
                                    </div>
                                </div>

                                {/* Destination & Buttons - PRESERVED */}
                                <div className="flex items-center gap-3 px-4 py-3 bg-slate-100 rounded-2xl text-slate-500">
                                    <MapPin size={16} />
                                    <span className="text-xs font-bold uppercase truncate">To: {state?.destination}</span>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => navigate('/rides')}
                                        className="flex-1 bg-[#05488B] text-[#FFC107] p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-black transition-all"
                                    >
                                        Done <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Grade Security */}
                <div className="pb-8 text-center">
                    <p className="text-[9px] text-[#05488B]/30 font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2">
                        <ShieldCheck size={16} strokeWidth={3} /> Institutional Grade Security
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;