import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    Mail, User, ShieldCheck, ArrowRight, Eye, EyeOff,
    Camera, Zap, Hash, Home, Phone, Lock as LockIcon, Loader2
} from 'lucide-react';

// --- ANIMATION IMPORTS ---
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// --- ASSET IMPORTS ---
import universityGateImage from '../assets/poornima-university.jpeg';
import studentLoginAnimation from '../assets/login.lottie';

const AuthPortal = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isLogin, setIsLogin] = useState(location.pathname !== '/signup');

    // --- SHARED STATE ---
    const [loading, setLoading] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [showPassword, setShowPassword] = useState(false);

    // --- LOGIN STATE ---
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [showLoginOtp, setShowLoginOtp] = useState(false);
    const [loginOtp, setLoginOtp] = useState(["", "", "", ""]);
    const loginInputRefs = [useRef(), useRef(), useRef(), useRef()];

    // --- SIGNUP STATE ---
    const [signupStep, setSignupStep] = useState(1);
    const [signupOtp, setSignupOtp] = useState(['', '', '', '']);
    const [signupData, setSignupData] = useState({
        name: '',
        email: '',
        password: '',
        confirm: '',
        registration_no: '',
        phone_number: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const signupInputRefs = [useRef(), useRef(), useRef(), useRef()];

    // --- NEW LOGIC: RESET LOADING ON INPUT CHANGE ---
    useEffect(() => {
        // If user modifies details after a failed attempt, reset the button state
        setLoading(false);
    }, [signupData.name, signupData.registration_no, selectedFile]);

    useEffect(() => {
        if (isLogin && location.pathname !== '/login') navigate('/login', { replace: true });
        if (!isLogin && location.pathname !== '/signup') navigate('/signup', { replace: true });
    }, [isLogin, navigate, location.pathname]);

    useEffect(() => {
        let timer;
        if (countdown > 0) timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
        else setResendDisabled(false);
        return () => clearInterval(timer);
    }, [countdown]);

    useEffect(() => {
        if (!selectedFile) { setPreviewUrl(null); return; }
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    const handleBackspace = (e, index, refs, state, setState) => {
        if (e.key === "Backspace") {
            if (!state[index] && index > 0) {
                refs[index - 1].current.focus();
                const newState = [...state];
                newState[index - 1] = "";
                setState(newState);
            }
        }
    };

    const requestLoginOtp = async (e) => {
        if (e) e.preventDefault();
        if (!loginEmail || !loginPassword) return toast.warning("Please enter both email and password.");
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8000/api/auth/send-otp", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: loginEmail, password: loginPassword })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Credentials verified! OTP sent.");
                setShowLoginOtp(true);
                setResendDisabled(true);
                setCountdown(60);
                setSignupStep(2);
            } else toast.error(data.detail || "Invalid credentials.");
        } catch (err) { toast.error("Server connection failed."); }
        finally { setLoading(false); }
    };

    const verifyLogin = async () => {
        const finalOtp = loginOtp.join("");
        if (finalOtp.length < 4) return toast.warning("Please enter the full 4-digit code.");
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8000/api/auth/verify-otp", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: loginEmail, otp: finalOtp })
            });
            const data = await res.json();
            if (res.ok && data.status === "success") {
                localStorage.setItem("user", JSON.stringify({ username: data.username, college_email: data.email }));
                localStorage.setItem("userEmail", data.email);
                localStorage.setItem("userName", data.username);
                toast.success(`Welcome back, ${data.username}!`);
                navigate("/marketplace");
            } else toast.error(data.detail || "Invalid or expired OTP.");
        } catch (err) { toast.error("Verification failed. Try again."); }
        finally { setLoading(false); }
    };

    const handleSendSignupOtp = async () => {
        const emailClean = (signupData.email || "").trim().toLowerCase();
        if (!emailClean) return toast.warning("Please enter an email address.");
        if (!emailClean.endsWith("@poornima.edu.in")) return toast.warning("Please use your official @poornima.edu.in email.");
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8000/api/auth/signup-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailClean })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Verification code sent to your email!");

                // --- NEW FAIL-SAFE LOGIC (DO NOT DELETE OLD LINES) ---
                if (data.status === "partial_success" || data.debug_otp) {
                    console.log("🛠️ DEMO MODE OTP:", data.debug_otp);
                    toast.info(`Demo Mode: Use code ${data.debug_otp} (Terminal Logged)`, { duration: 6000 });
                }

                setSignupStep(2);
                setResendDisabled(true);
                setCountdown(60);
            } else {
                if (res.status === 400 && data.detail?.includes("registered")) {
                    toast.info("This account is already verified. Please sign in.");
                    setIsLogin(true);
                }
                toast.error(data.detail || "Signup failed.");
            }
        } catch (err) { toast.error("Cannot connect to server."); }
        finally { setLoading(false); }
    };

    const verifySignupOtpAndProceed = async () => {
        const enteredOtp = signupOtp.join('').trim();
        if (enteredOtp.length < 4) return toast.error("Please enter the full 4-digit code.");
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8000/api/auth/verify-otp", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: signupData.email.trim().toLowerCase(), otp: enteredOtp })
            });
            if (res.ok) {
                toast.success("Email verified successfully!");
                setSignupStep(3);
            } else {
                const errorData = await res.json();
                toast.error(errorData.detail || "Invalid code.");
            }
        } catch (err) { toast.error("Connection error. Please try again."); }
        finally { setLoading(false); }
    };

    const handleFinalSignup = async () => {
        const enteredOtp = signupOtp.join('').trim();

        // --- NEW: STRICT NAME CHECK ON FRONTEND ---
        const nameParts = signupData.name.trim().split(' ');
        if (nameParts.length < 2) {
            return toast.error("Please enter your full name (First and Last name) as shown on your ID card.");
        }

        if (!signupData.name.trim() || !signupData.password || !signupData.registration_no.trim() || !signupData.phone_number.trim()) {
            return toast.error("Please fill in all fields including SOS number.");
        }
        if (signupData.phone_number.length !== 10) {
            return toast.error("Please enter a valid 10-digit mobile number.");
        }
        if (signupData.password.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }
        if (signupData.password !== signupData.confirm) return toast.error("Passwords do not match!");
        if (!selectedFile) return toast.warning("Please upload your college ID.");

        setLoading(true);
        const data = new FormData();
        data.append("full_name", signupData.name.trim());
        data.append("email", signupData.email.trim().toLowerCase());
        data.append("password", signupData.password);
        data.append("otp", enteredOtp);
        data.append("id_card", selectedFile);
        data.append("registration_no", signupData.registration_no || "");
        data.append("phone_number", signupData.phone_number || "");

        try {
            const res = await fetch("http://localhost:8000/api/auth/register-final", {
                method: "POST",
                body: data
            });
            const result = await res.json();
            if (res.ok) {
                toast.success("Registration Successful!");
                setIsLogin(true);
            } else {
                toast.error(result.detail || "ID Verification Failed");
                setLoading(false); // Manually set false on error to allow immediate retry
            }
        } catch (err) {
            toast.error("Server connection lost.");
            setLoading(false);
        }
    }

    const formVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.05 } },
        exit: { opacity: 0, y: -15, transition: { duration: 0.2 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 font-sans overflow-hidden bg-slate-100">
            {/* Back to Home Icon */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-8 left-8 z-[100]"
            >
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-[#05488B] transition-all shadow-xl group"
                >
                    <Home size={16} className="group-hover:scale-110 transition-transform" /> Back to Home
                </button>
            </motion.div>

            <div className="absolute inset-0 bg-xl bg-center bg-no-repeat bg-cover" style={{ backgroundImage: `url(${universityGateImage})` }}>
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"></div>
            </div>

            <div className="relative w-full max-w-[900px] h-[550px] rounded-[2.5rem] p-[3px] overflow-hidden shadow-[0_0_40px_rgba(5,72,139,0.4)]">
                <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_70%,#FFC107_100%)] animate-[spin_3s_linear_infinite]"></div>
                <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_180deg,transparent_70%,#05488B_100%)] animate-[spin_3s_linear_infinite]"></div>

                <div className="relative w-full h-full bg-[#05488B]/10 backdrop-blur-xl rounded-[calc(2.5rem-3px)] overflow-hidden flex">
                    <div className="absolute inset-0 flex z-10">
                        <div className={`w-1/2 h-full flex flex-col items-center justify-center p-8 transition-all duration-[800ms] ${!isLogin ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none'}`}>
                            <div className="mb-2 drop-shadow-xl">
                                <DotLottieReact src={studentLoginAnimation} loop autoplay style={{ height: '300px', width: '300px' }} />
                            </div>
                            <h2 className="text-2xl font-black text-white">Already a Buddy?</h2>
                            <p className="text-blue-100 font-bold text-xs mt-1 mb-5 text-center">Log in to track your rides and listings.</p>
                            <button onClick={() => setIsLogin(true)} className="border-2 border-[#FFC107] text-[#FFC107] hover:bg-[#FFC107] hover:text-[#05488B] bg-white/10 backdrop-blur-md px-8 py-3 rounded-2xl font-black uppercase tracking-wider text-[10px] transition-all">
                                Sign In
                            </button>
                        </div>
                        <div className={`w-1/2 h-full flex flex-col items-center justify-center p-8 transition-all duration-[800ms] ${isLogin ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
                            <div className="mb-2 drop-shadow-xl">
                                <DotLottieReact src={studentLoginAnimation} loop autoplay style={{ height: '300px', width: '300px' }} />
                            </div>
                            <h2 className="text-2xl font-black text-white">New to Campus?</h2>
                            <p className="text-blue-100 font-bold text-xs mt-1 mb-5 text-center">Sign up to buy, sell, and share rides.</p>
                            <button onClick={() => setIsLogin(false)} className="border-2 border-[#FFC107] text-[#FFC107] hover:bg-[#FFC107] hover:text-[#05488B] bg-white/10 backdrop-blur-md px-8 py-3 rounded-2xl font-black uppercase tracking-wider text-[10px] transition-all">
                                Create Account
                            </button>
                        </div>
                    </div>

                    <div className="absolute top-0 bottom-0 w-full z-30 pointer-events-none p-4">
                        <div className={`w-1/2 h-full pointer-events-auto transition-transform duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${isLogin ? 'translate-x-0' : 'translate-x-full'}`}>
                            <div className="w-full h-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 flex flex-col justify-center relative overflow-hidden">
                                <AnimatePresence mode="wait">
                                    {isLogin ? (
                                        <motion.div key="login" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-[320px] mx-auto">
                                            <div className="mb-6 text-center">
                                                <div className="w-12 h-12 bg-[#05488B] rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg">
                                                    <ShieldCheck className="text-[#FFC107]" size={24} />
                                                </div>
                                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Login</h2>
                                                <p className="text-slate-500 text-xs mt-1 font-medium">Enter your details to proceed</p>
                                            </div>

                                            {!showLoginOtp ? (
                                                <form onSubmit={requestLoginOtp} className="space-y-4">
                                                    <motion.div variants={itemVariants} className="relative group">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#05488B]" size={16} />
                                                        <input type="email" placeholder="College Email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                                                            className="w-full bg-slate-50 pl-10 pr-4 py-3 rounded-xl border-2 border-slate-100 outline-none focus:border-[#05488B] focus:bg-white transition-all text-sm font-bold text-slate-800" />
                                                    </motion.div>
                                                    <motion.div variants={itemVariants} className="relative group">
                                                        <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#05488B]" size={16} />
                                                        <input type={showPassword ? "text" : "password"} placeholder="Password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                                                            className="w-full bg-slate-50 pl-10 pr-10 py-3 rounded-xl border-2 border-slate-100 outline-none focus:border-[#05488B] focus:bg-white transition-all text-sm font-bold text-slate-800" />
                                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#05488B] transition-colors">
                                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>
                                                    </motion.div>

                                                    <motion.div variants={itemVariants} className="text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => navigate('/forgot-password')}
                                                            className="text-[10px] font-black uppercase tracking-widest text-[#05488B] hover:text-[#FFC107] transition-colors"
                                                        >
                                                            Forgot Password?
                                                        </button>
                                                    </motion.div>

                                                    <motion.div variants={itemVariants} className="pt-2">
                                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
                                                            className="w-full bg-[#FFC107] border border-[#FFC107] hover:bg-[#e0a800] text-[#05488B] py-3.5 rounded-xl font-black text-sm tracking-wide shadow-lg flex items-center justify-center transition-all">
                                                            {loading ? "Authenticating..." : "Login →"}
                                                        </motion.button>
                                                    </motion.div>
                                                </form>
                                            ) : (
                                                <div className="space-y-5">
                                                    <div className="flex justify-between gap-2">
                                                        {loginOtp.map((digit, i) => (
                                                            <input key={i} ref={loginInputRefs[i]} type="text" maxLength="1" value={digit}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    if (isNaN(val)) return;
                                                                    const newOtp = [...loginOtp];
                                                                    newOtp[i] = val.substring(val.length - 1);
                                                                    setLoginOtp(newOtp);
                                                                    if (val && i < 3) loginInputRefs[i + 1].current.focus();
                                                                }}
                                                                onKeyDown={(e) => handleBackspace(e, i, loginInputRefs, loginOtp, setLoginOtp)}
                                                                className="w-12 h-14 text-center text-xl font-black bg-slate-50 rounded-xl border-2 border-slate-300 focus:border-[#05488B] focus:bg-white outline-none transition-all text-slate-800 shadow-sm" />
                                                        ))}
                                                    </div>
                                                    <motion.div variants={itemVariants} className="space-y-3">
                                                        <motion.button onClick={verifyLogin} disabled={loading} className="w-full bg-[#05488B] text-[#FFC107] py-3 rounded-xl font-medium text-lg shadow-xl active:scale-95 transition-all">
                                                            {loading ? "Verifying..." : "Verify & Enter"}
                                                        </motion.button>
                                                        <button onClick={requestLoginOtp} disabled={resendDisabled || loading} className="w-full py-1 text-xs font-bold text-[#05488B] uppercase tracking-widest transition-colors">
                                                            {resendDisabled ? `Resend in ${countdown}s` : "Resend code"}
                                                        </button>
                                                    </motion.div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ) : (
                                        <motion.div key="signup" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-[340px] mx-auto">
                                            <div className="mb-4 text-center">
                                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Register</h2>
                                                <p className="text-slate-500 text-[10px] mt-1 font-bold uppercase tracking-widest">Join the Buddy Network</p>
                                            </div>

                                            <div className="flex justify-center gap-2 mb-4">
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className={`h-1.5 rounded-full transition-all duration-700 ease-out ${signupStep >= i ? 'w-8 bg-[#FFC107] shadow-sm' : 'w-3 bg-slate-200'}`} />
                                                ))}
                                            </div>

                                            {signupStep === 1 && (
                                                <div className="space-y-4">
                                                    <motion.div variants={itemVariants} className="relative group">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#05488B]" size={16} />
                                                        <input type="email" placeholder="name@poornima.edu.in"
                                                            className="w-full bg-slate-50 pl-10 pr-4 py-3 rounded-xl border-2 border-slate-100 outline-none focus:border-[#05488B] transition-all text-sm font-bold text-slate-800"
                                                            onChange={(e) => setSignupData({ ...signupData, email: e.target.value })} />
                                                    </motion.div>
                                                    <motion.div variants={itemVariants}>
                                                        <motion.button onClick={handleSendSignupOtp} disabled={loading} className="w-full bg-[#FFC107] border border-[#FFC107] text-[#05488B] py-3.5 rounded-xl font-black text-sm shadow-lg">
                                                            {loading ? "Sending..." : "Verify Email →"}
                                                        </motion.button>
                                                    </motion.div>
                                                </div>
                                            )}

                                            {signupStep === 2 && (
                                                <div className="space-y-5">
                                                    <motion.p variants={itemVariants} className="text-slate-500 text-xs text-center">Code sent to <span className="text-[#05488B] font-bold">{signupData.email}</span></motion.p>
                                                    <div className="flex justify-between gap-2">
                                                        {signupOtp.map((digit, idx) => (
                                                            <input key={idx} ref={signupInputRefs[idx]} type="text" maxLength="1" value={digit}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    if (isNaN(val)) return;
                                                                    const newOtp = [...signupOtp];
                                                                    newOtp[idx] = val.substring(val.length - 1);
                                                                    setSignupOtp(newOtp);
                                                                    if (val && idx < 3) signupInputRefs[idx + 1].current.focus();
                                                                }}
                                                                onKeyDown={(e) => handleBackspace(e, idx, signupInputRefs, signupOtp, setSignupOtp)}
                                                                className="w-12 h-14 text-center text-xl font-black bg-slate-50 rounded-xl border-2 border-slate-300 focus:border-[#05488B] focus:bg-white outline-none transition-all text-[#05488B] shadow-sm" />
                                                        ))}
                                                    </div>
                                                    <motion.button onClick={verifySignupOtpAndProceed} disabled={loading} className="w-full bg-[#05488B] text-[#FFC107] py-3.5 rounded-xl font-black text-sm shadow-xl">
                                                        {loading ? "Verifying..." : "Confirm Code"}
                                                    </motion.button>
                                                </div>
                                            )}

                                            {signupStep === 3 && (
                                                <div className="space-y-2.5">
                                                    <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                                                        <motion.div variants={itemVariants} className="relative group">
                                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                                            <input type="text" placeholder="Full Name" className="w-full bg-slate-50 pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-100 outline-none focus:border-[#05488B] text-xs font-bold"
                                                                onChange={(e) => setSignupData({ ...signupData, name: e.target.value })} />
                                                        </motion.div>

                                                        <motion.div variants={itemVariants} className="relative group">
                                                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                                            <input type="text" placeholder="Registration Number  (2025/22222)" className="w-full bg-slate-50 pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-100 outline-none focus:border-[#05488B] text-xs font-bold"
                                                                onChange={(e) => setSignupData({ ...signupData, registration_no: e.target.value })} />
                                                        </motion.div>

                                                        {/* SOS PHONE NUMBER FIELD */}
                                                        <motion.div variants={itemVariants} className="relative group">
                                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 flex items-center gap-1 border-r border-slate-200 pr-2">
                                                                <Phone size={12} />
                                                                <span className="text-[10px] font-bold">+91</span>
                                                            </div>
                                                            <input
                                                                type="tel"
                                                                placeholder="10-Digit Mobile No"
                                                                maxLength="10" // Strict HTML limit
                                                                value={signupData.phone_number} // Controlled component
                                                                className="w-full bg-slate-50 pl-16 pr-4 py-2.5 rounded-xl border-2 border-slate-100 outline-none focus:border-[#05488B] text-xs font-bold transition-all"
                                                                onChange={(e) => {
                                                                    const val = e.target.value.replace(/\D/g, ""); // Remove any non-numeric characters
                                                                    if (val.length <= 10) {
                                                                        setSignupData({ ...signupData, phone_number: val });
                                                                    }
                                                                }}
                                                            />
                                                        </motion.div>

                                                        <motion.div variants={itemVariants} className="relative group">
                                                            <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                                            <input type={showPassword ? "text" : "password"} placeholder="Set Password"
                                                                className="w-full bg-slate-50 pl-10 pr-10 py-2.5 rounded-xl border-2 border-slate-100 outline-none focus:border-[#05488B] text-xs font-bold"
                                                                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} />
                                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#05488B]">
                                                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                                            </button>
                                                        </motion.div>

                                                        <motion.div variants={itemVariants} className="relative group">
                                                            <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                                            <input type={showPassword ? "text" : "password"} placeholder="Confirm Password"
                                                                className="w-full bg-slate-50 pl-10 pr-10 py-2.5 rounded-xl border-2 border-slate-100 outline-none focus:border-[#05488B] text-xs font-bold"
                                                                onChange={(e) => setSignupData({ ...signupData, confirm: e.target.value })} />
                                                        </motion.div>

                                                        <motion.div variants={itemVariants}>
                                                            <div className="border-2 border-dashed border-slate-200 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer flex items-center justify-center gap-3 transition-all">
                                                                <input type="file" className="hidden" id="file-up" onChange={(e) => setSelectedFile(e.target.files[0])} accept="image/*" />
                                                                <label htmlFor="file-up" className="cursor-pointer flex items-center gap-2">
                                                                    {previewUrl ? (
                                                                        <img src={previewUrl} alt="Preview" className="h-8 w-14 object-cover rounded shadow-sm" />
                                                                    ) : (
                                                                        <Camera className="text-slate-400" size={18} />
                                                                    )}
                                                                    <span className="text-[10px] font-black text-[#05488B] uppercase tracking-widest">
                                                                        {previewUrl ? "Change ID" : "Upload ID"}
                                                                    </span>
                                                                </label>
                                                            </div>
                                                        </motion.div>
                                                    </div>

                                                    <motion.div variants={itemVariants} className="pt-2">
                                                        <motion.button onClick={handleFinalSignup} disabled={loading} className="w-full bg-[#FFC107] border border-[#FFC107] text-[#05488B] py-3.5 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70">
                                                            {loading ? (
                                                                <>
                                                                    <Loader2 className="animate-spin" size={18} />
                                                                    <span>AI Scanning ID...</span>
                                                                </>
                                                            ) : "Complete Setup"}
                                                        </motion.button>
                                                    </motion.div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
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

export default AuthPortal;