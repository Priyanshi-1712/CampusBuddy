import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, CheckCircle, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [otpValues, setOtpValues] = useState(['', '', '', '']);
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });

    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const inputRefs = [useRef(), useRef(), useRef(), useRef()];

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otpValues];
        newOtp[index] = value.substring(value.length - 1);
        setOtpValues(newOtp);
        if (value && index < 3) inputRefs[index + 1].current.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
            inputRefs[index - 1].current.focus();
        }
    };

    const handleRequestOtp = async () => {
        if (!email) return toast.warning("Please enter your email.");
        if (!email.toLowerCase().includes("@poornima")) {
            return toast.error("Please use your official @poornima.edu.in email.");
        }

        setLoading(true);
        try {
            const res = await fetch("http://127.0.0.1:8000/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.toLowerCase().trim() })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Security code dispatched to your inbox! 📧");
                setStep(2);
            } else {
                toast.error(data.detail || "Account verification failed.");
            }
        } catch (err) {
            toast.error("Nexus down. Check your server connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = () => {
        if (otpValues.join('').length < 4) return toast.warning("Provide the full 4-digit security code.");
        setStep(3);
    };

    const handleFinalReset = async () => {
        if (passwords.new.length < 6) return toast.warning("Password must be at least 6 characters.");
        if (passwords.new !== passwords.confirm) return toast.error("Password mismatch detected!");

        setLoading(true);
        try {
            // URL matches the backend route we renamed earlier
            const res = await fetch("http://127.0.0.1:8000/api/auth/reset-password-verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.toLowerCase().trim(),
                    otp: otpValues.join(''),
                    new_password: passwords.new
                })
            });

            if (res.ok) {
                toast.success("Security credentials updated! Re-routing to login...");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                const errorData = await res.json();
                toast.error(errorData.detail || "Credential update failed.");
            }
        } catch (err) {
            toast.error("Update failed. Server synchronization error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4 font-sans overflow-hidden">
            {/* Aesthetic Background Accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFC107]/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#05488B]/5 rounded-full blur-[100px]" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white w-full max-w-[440px] rounded-[3rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100 relative z-10"
            >
                <div className="bg-[#05488B] p-10 pb-14 text-center relative">
                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-[#FFC107] p-4 rounded-2xl shadow-xl shadow-blue-900/20">
                        <ShieldAlert className="text-[#05488B]" size={28} />
                    </div>
                    <h1 className="text-white text-3xl font-black uppercase tracking-tighter mb-1 italic">Reset Access</h1>
                    <p className="text-blue-200/60 text-[10px] uppercase font-black tracking-[0.3em]">Institutional Security Protocol</p>
                </div>

                <div className="p-10 pt-14">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div 
                                key="step1" 
                                initial={{ x: 20, opacity: 0 }} 
                                animate={{ x: 0, opacity: 1 }} 
                                exit={{ x: -20, opacity: 0 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official College Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#05488B] transition-colors" size={20} />
                                        <input
                                            type="email"
                                            placeholder="name@poornima.edu.in"
                                            className="w-full bg-slate-50 pl-12 pr-4 py-4 rounded-2xl outline-none border-2 border-transparent focus:border-[#05488B] focus:bg-white transition-all text-sm font-bold text-slate-800 shadow-inner"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <button onClick={handleRequestOtp} className="w-full bg-[#05488B] hover:bg-black text-[#FFC107] py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-900/10 transition-all active:scale-[0.98]">
                                    {loading ? "Verifying..." : "Dispatch Reset Code →"}
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div 
                                key="step2" 
                                initial={{ x: 20, opacity: 0 }} 
                                animate={{ x: 0, opacity: 1 }} 
                                exit={{ x: -20, opacity: 0 }}
                                className="space-y-8 text-center"
                            >
                                <div>
                                    <h2 className="text-xl font-black text-[#05488B] uppercase tracking-tighter">Enter Security Pin</h2>
                                    <p className="text-slate-400 text-xs font-bold mt-2">Target: <span className="text-[#05488B]">{email}</span></p>
                                </div>
                                <div className="flex justify-center gap-3">
                                    {otpValues.map((digit, idx) => (
                                        <input key={idx} ref={inputRefs[idx]} type="text" maxLength="1" value={digit}
                                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(idx, e)}
                                            className="w-14 h-16 text-center text-2xl font-black bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#FFC107] focus:bg-white outline-none transition-all text-[#05488B] shadow-sm"
                                        />
                                    ))}
                                </div>
                                <button onClick={handleVerifyOtp} className="w-full bg-[#05488B] text-[#FFC107] py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-900/10 transition-all">Verify & Sync</button>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div 
                                key="step3" 
                                initial={{ x: 20, opacity: 0 }} 
                                animate={{ x: 0, opacity: 1 }}
                                className="space-y-4"
                            >
                                <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border border-emerald-100 mb-2">
                                    <CheckCircle size={18} /> Credentials Verified.
                                </div>

                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#05488B] transition-colors" size={20} />
                                    <input
                                        type={showPass ? "text" : "password"}
                                        placeholder="Enter New Password"
                                        className="w-full bg-slate-50 pl-12 pr-12 py-4 rounded-2xl outline-none border-2 border-transparent focus:border-[#05488B] transition-all text-sm font-bold shadow-inner"
                                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                    />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#05488B]">
                                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#05488B] transition-colors" size={20} />
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        placeholder="Confirm New Password"
                                        className="w-full bg-slate-50 pl-12 pr-12 py-4 rounded-2xl outline-none border-2 border-transparent focus:border-[#05488B] transition-all text-sm font-bold shadow-inner"
                                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                    />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#05488B]">
                                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                <button onClick={handleFinalReset} disabled={loading} className="w-full bg-[#FFC107] text-[#05488B] py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-yellow-100 mt-2 transition-all active:scale-[0.98]">
                                    {loading ? "UPDATING LEDGER..." : "Authorize Update"}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button onClick={() => navigate("/login")} className="w-full text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-10 hover:text-[#05488B] transition-colors">
                        ← Revert to Login
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;