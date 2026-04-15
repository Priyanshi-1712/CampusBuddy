import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    } else {
      setResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Step 1: Verify email + password & send OTP
  const requestOtp = async (e) => {
    if (e) e.preventDefault();

    if (!email || !password) {
      toast.warning("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Credentials verified! OTP sent.");
        setShowOtp(true);
        setResendDisabled(true);
        setCountdown(60);
      } else {
        toast.error(data.detail || "Invalid credentials.");
      }

    } catch (err) {
      toast.error("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Login
  const verifyLogin = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length < 4) {
      toast.warning("Please enter the full 4-digit code.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: finalOtp })
      });

      const data = await res.json();

      if (res.ok && data.status === "success") {

        // ✅ Properly structured user object
        const userObject = {
          username: data.username,
          college_email: data.email
        };

        // ✅ Store everything correctly
        localStorage.setItem("user", JSON.stringify(userObject));
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("userName", data.username);

        toast.success(`Welcome back, ${data.username}!`);
        navigate("/marketplace");

      } else {
        toast.error(data.detail || "Invalid or expired OTP.");
      }

    } catch (err) {
      toast.error("Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendDisabled(true);
    setCountdown(60);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        toast.success("A new OTP has been sent.");
      } else {
        toast.error("Failed to resend OTP.");
      }

    } catch (err) {
      toast.error("Error connecting to server.");
    }
  };

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-[440px] rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 border border-slate-100">

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-200">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {showOtp ? "Verify OTP" : "Welcome Back"}
          </h2>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            {showOtp ? "Check your college email for the code" : "Log in to access your campus community"}
          </p>
        </div>

        {!showOtp ? (
          <form onSubmit={requestOtp} className="space-y-5">

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-all" size={20} />
              <input
                type="email"
                placeholder="College Email"
                className="w-full bg-slate-50 pl-12 pr-4 py-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-all" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full bg-slate-50 pl-12 pr-12 py-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              {loading ? "Verifying..." : "Continue"} <ArrowRight size={20} />
            </button>

          </form>
        ) : (
          <div className="space-y-8">

            <div className="flex justify-between gap-3">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={inputRefs[i]}
                  type="text"
                  maxLength="1"
                  className="w-16 h-16 text-center text-2xl font-black bg-slate-50 rounded-2xl border-2 border-slate-300 focus:border-blue-600 outline-none"
                  value={digit}
                  onChange={e => handleOtpChange(e.target.value, i)}
                />
              ))}
            </div>

            <button
              onClick={verifyLogin}
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold"
            >
              {loading ? "Verifying..." : "Verify & Access"}
            </button>

            <button
              onClick={handleResendOTP}
              disabled={resendDisabled}
              className="text-sm font-bold text-blue-600"
            >
              {resendDisabled ? `Resend in ${countdown}s` : "Resend OTP"}
            </button>

          </div>
        )}

      </div>
    </div>
  );
};

export default Login;