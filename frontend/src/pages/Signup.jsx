import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, Lock, User, ShieldCheck, ArrowRight, Eye, EyeOff, Camera, RefreshCw, Phone, Hash } from 'lucide-react';

const Signup = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [otpValues, setOtpValues] = useState(['', '', '', '']);
    const [showPassword, setShowPassword] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const inputRefs = [useRef(), useRef(), useRef(), useRef()];

    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirm: '', registration_no: '', phone_number: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);

    // Timer effect for Resend button
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
        } else {
            setResendDisabled(false);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    useEffect(() => {
        if (!selectedFile) { setPreviewUrl(null); return; }
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otpValues];
        newOtp[index] = value.substring(value.length - 1);
        setOtpValues(newOtp);
        if (value && index < 3) {
            inputRefs[index + 1].current.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
            inputRefs[index - 1].current.focus();
        }
    };

    const handleSendOtp = async () => {
        // 1. Get the email and trim it
        const emailClean = (formData.email || "").trim().toLowerCase();

        // 2. Validate BEFORE starting the loading spinner
        if (!emailClean) {
            toast.warning("Please enter an email address.");
            return;
        }

        if (!emailClean.endsWith("@poornima.edu.in")) {
            toast.error("Institutional Access Only: Please use your official @poornima.edu.in email.");
            return;
        }

        // 3. Start loading ONLY after validation passes
        setLoading(true);

        try {
            const res = await fetch("http://127.0.0.1:8000/api/auth/signup-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailClean })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Verification code sent to your email!");
                setStep(2);
                setResendDisabled(true);
                setCountdown(60);
            } else {
                toast.error(data.detail || "Signup failed.");
            }
        } catch (err) {
            console.error("Connection Error:", err);
            toast.error("Cannot connect to server. Is your backend running at port 8000?");
        } finally {
            setLoading(false);
        }
    };

    async function handleResendOTP() {
        setResendDisabled(true);
        setCountdown(60);
        try {
            const res = await fetch("http://127.0.0.1:8000/api/auth/signup-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email.trim().toLowerCase() })
            });
            if (res.ok) {
                toast.success("A new OTP has been sent to your email.");
            } else {
                toast.error("Failed to resend OTP.");
            }
        } catch (err) {
            toast.error("Network error during resend.");
        }
    }

    const verifyOtpAndProceed = async () => {
        const enteredOtp = otpValues.join('').trim();
        const emailClean = formData.email.trim().toLowerCase();

        if (enteredOtp.length < 4) {
            toast.error("Please enter the full 4-digit code.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("http://127.0.0.1:8000/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailClean, otp: enteredOtp })
            });

            if (res.ok) {
                toast.success("Email verified successfully!");
                setStep(3);
            } else {
                const errorData = await res.json();
                toast.error(errorData.detail || "Invalid or expired verification code.");
            }
        } catch (err) {
            toast.error("Connection error. Please try again.");
        } finally { setLoading(false); }
    };

    const handleFinalSignup = async () => {
        const enteredOtp = otpValues.join('').trim();

        if (!formData.name.trim() || !formData.password || !formData.phone_number.trim()) {
            return toast.error("Please fill in all fields.");
        }
        if (formData.password.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }
        if (formData.password !== formData.confirm) {
            return toast.error("Passwords do not match!");
        }
        if (!selectedFile) {
            return toast.warning("Please upload your college ID.");
        }

        setLoading(true);

        const data = new FormData();
        data.append("full_name", formData.name.trim());
        data.append("email", formData.email.trim().toLowerCase());
        data.append("password", formData.password);
        data.append("otp", enteredOtp);
        data.append("registration_no", formData.registration_no.trim());
        data.append("phone_number", formData.phone_number.trim());
        data.append("id_card", selectedFile);

        try {
            const res = await fetch("http://127.0.0.1:8000/api/auth/register-final", {
                method: "POST",
                body: data,
            });

            const result = await res.json();

            if (res.ok) {
                toast.success("ID Verified! Account created successfully.");
                navigate("/login");
            } else {
                toast.error(result.detail || "Verification failed. Check your ID photo.");
            }
        } catch (err) {
            toast.error("Error connecting to server.");
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-[440px] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-8 pb-12 text-center relative">
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-200">
                        <ShieldCheck className="text-white" size={28} />
                    </div>
                    <h1 className="text-white text-2xl font-black mb-1">Create Account</h1>
                    <p className="text-slate-400 text-sm">Step {step} of 3</p>
                </div>

                <div className="p-8 pt-12">
                    <div className="flex justify-center gap-3 mb-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-10 bg-blue-600' : 'w-4 bg-slate-100'}`} />
                        ))}
                    </div>

                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-all" size={20} />
                                <input type="email" placeholder="name@poornima.edu.in"
                                    className="w-full bg-slate-50 pl-12 pr-4 py-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all"
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <button onClick={handleSendOtp} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-300 flex items-center justify-center gap-2 transition-transform active:scale-95">
                                {loading ? "Processing..." : <>Send OTP <ArrowRight size={18} /></>}
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 text-center animate-in zoom-in-95">
                            <p className="text-slate-500 text-sm">Enter the code sent to <br /><span className="text-blue-600 font-bold">{formData.email}</span></p>
                            <div className="flex justify-center gap-3">
                                {otpValues.map((digit, idx) => (
                                    <input key={idx} ref={inputRefs[idx]} type="text" maxLength="1" value={digit}
                                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(idx, e)}
                                        className="w-14 h-16 text-center text-2xl font-black bg-slate-50 border-2 border-slate-300 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all"
                                    />
                                ))}
                            </div>
                            <div className="space-y-3">
                                <button onClick={verifyOtpAndProceed} disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all">
                                    {loading ? "Verifying..." : "Verify Code"}
                                </button>
                                <div className="pt-2">
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        disabled={resendDisabled || loading}
                                        className={`flex items-center justify-center gap-2 mx-auto text-sm font-bold transition-colors ${resendDisabled ? 'text-slate-300 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'}`}
                                    >
                                        <RefreshCw size={14} className={resendDisabled ? "" : "animate-spin-slow"} />
                                        {resendDisabled ? `Resend code in ${countdown}s` : "Resend OTP"}
                                    </button>
                                </div>
                                <button onClick={() => setStep(1)} className="text-slate-400 text-xs font-bold hover:text-blue-600">Change Email</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in overflow-y-auto max-h-[450px] pr-2 custom-scrollbar">
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600" size={18} />
                                <input type="text" placeholder="Full Name" className="w-full bg-slate-50 pl-12 pr-4 py-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-600 transition-all"
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>

                            <div className="relative group">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="text" placeholder="Registration Number" className="w-full bg-slate-50 pl-12 pr-4 py-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-600 transition-all"
                                    onChange={(e) => setFormData({ ...formData, registration_no: e.target.value })} />
                            </div>

                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 flex items-center gap-1 border-r border-slate-200 pr-2">
                                    <Phone size={14} />
                                    <span className="text-[10px] font-bold">+91</span>
                                </div>
                                <input type="tel" placeholder="SOS Mobile Number"
                                    className="w-full bg-slate-50 pl-16 pr-4 py-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-600 transition-all"
                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600" size={18} />
                                <input type={showPassword ? "text" : "password"} placeholder="Set Password"
                                    className="w-full bg-slate-50 pl-12 pr-12 py-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-600 transition-all"
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <input type="password" placeholder="Confirm Password"
                                className="w-full bg-slate-50 px-6 py-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-600 transition-all"
                                onChange={(e) => setFormData({ ...formData, confirm: e.target.value })} />

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Upload Campus ID</label>
                                <div className="group relative border-2 border-dashed border-slate-200 p-4 rounded-2xl bg-slate-50 hover:border-blue-400 transition-all cursor-pointer">
                                    <input type="file" className="hidden" id="file-up" onChange={(e) => setSelectedFile(e.target.files[0])} accept="image/*" />
                                    <label htmlFor="file-up" className="cursor-pointer">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="h-32 w-full object-cover rounded-xl" />
                                        ) : (
                                            <div className="py-2 text-center">
                                                <Camera className="mx-auto mb-2 text-blue-600" size={24} />
                                                <p className="text-sm font-bold text-slate-700">Upload College ID</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <button onClick={handleFinalSignup} disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                                {loading ? "Verifying ID..." : "Finish Signup"}
                            </button>
                        </div>
                    )}

                    <p className="text-center text-sm text-slate-500 mt-8">
                        Already a member? <span onClick={() => navigate("/login")} className="text-blue-600 font-bold cursor-pointer hover:underline">Log In</span>
                    </p>
                </div>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default Signup;