import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);

  const requestOtp = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        setShowOtp(true); // This shows the 4-digit input boxes
      } else {
        const errorData = await res.json();
        alert(errorData.detail); // This will show "Account not found..." from Python
      }
    } catch (err) {
      alert("Backend is not running!");
    }
  };

  // Inside Login.jsx

  const verifyLogin = async () => {
    // Combine the 4 separate boxes into one string "1234"
    const finalOtp = otp.join("");

    if (finalOtp.length < 4) {
      alert("Please enter all 4 digits");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          otp: finalOtp
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Login Successful!");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", data.username);
        navigate("/marketplace");
      } else {
        alert(data.detail || "Invalid OTP");
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert("Connection to server failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-[400px] rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
        <h2 className="text-2xl font-black text-slate-800 text-center mb-8">{showOtp ? "Verify" : "Login"}</h2>

        {!showOtp ? (
          <div className="space-y-4">
            <input
              type="email"
              placeholder="name@poornima.edu.in"
              className="w-full bg-slate-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button onClick={requestOtp} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold">Send OTP →</button>
            <p className="text-center text-sm text-slate-500 mt-4">New student? <span onClick={() => navigate("/signup")} className="text-blue-600 font-bold cursor-pointer">Sign Up</span></p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between gap-2">
              {otp.map((d, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength="1"
                  className="w-14 h-14 text-center text-xl font-bold bg-slate-50 rounded-xl border-2 border-slate-100 outline-none"
                  onChange={e => {
                    let next = [...otp];
                    next[i] = e.target.value;
                    setOtp(next);
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={verifyLogin}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition"
            >
              Verify & Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// CRITICAL FIX: This line makes the component "visible" to App.jsx
export default Login;