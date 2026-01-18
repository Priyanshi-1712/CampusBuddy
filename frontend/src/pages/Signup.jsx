import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [selectedFile, setSelectedFile] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirm: ''
    });

    // Handle text input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle file selection for ID Card
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSignup = async () => {
        // 1. Validation
        if (formData.password !== formData.confirm) {
            alert("Passwords do not match!");
            return;
        }
        if (!selectedFile) {
            alert("Please upload your College ID for verification.");
            return;
        }

        // 2. Prepare FormData (This handles both text and the image file)
        const dataToSend = new FormData();
        dataToSend.append("full_name", formData.name);
        dataToSend.append("email", formData.email);
        dataToSend.append("password", formData.password);
        dataToSend.append("file", selectedFile);

        try {
            // 3. Send to Backend
            const res = await fetch("http://127.0.0.1:8000/api/auth/signup", {
                method: "POST",
                // Note: No 'Content-Type' header! The browser sets it to multipart/form-data automatically.
                body: dataToSend,
            });

            if (res.ok) {
                alert("Account created successfully! Please log in.");
                navigate("/login");
            } else {
                const errorData = await res.json();
                alert(errorData.detail || "Signup failed");
            }
        } catch (error) {
            console.error("Signup error:", error);
            alert("Server is offline. Please check your backend.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 pt-20">
            <div className="bg-white w-full max-w-[420px] rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">

                {/* Progress Bar */}
                <div className="flex gap-2 mb-8">
                    <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
                    <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
                </div>

                <h1 className="text-2xl font-black text-slate-800 text-center mb-6">
                    {step === 1 ? "Create Account" : "Verify Identity"}
                </h1>

                {step === 1 ? (
                    /* STEP 1: Basic Info */
                    <div className="space-y-4">
                        <input
                            name="name" type="text" placeholder="Full Name"
                            className="w-full bg-slate-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 transition"
                            onChange={handleChange}
                        />
                        <input
                            name="email" type="email" placeholder="name@poornima.edu.in"
                            className="w-full bg-slate-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 transition"
                            onChange={handleChange}
                        />
                        <input
                            name="password" type="password" placeholder="Password"
                            className="w-full bg-slate-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 transition"
                            onChange={handleChange}
                        />
                        <input
                            name="confirm" type="password" placeholder="Confirm Password"
                            className="w-full bg-slate-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 transition"
                            onChange={handleChange}
                        />
                        <button
                            onClick={() => setStep(2)}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition shadow-lg"
                        >
                            Next Step →
                        </button>
                    </div>
                ) : (
                    /* STEP 2: ID Upload */
                    <div className="space-y-6 text-center">
                        <div className="border-4 border-dashed border-slate-100 rounded-[2rem] py-10 bg-slate-50 hover:bg-slate-100 transition relative">
                            <input
                                type="file" id="id-upload" className="hidden"
                                onChange={handleFileChange} accept="image/*"
                            />
                            <label htmlFor="id-upload" className="cursor-pointer block">
                                <div className="text-4xl mb-2">🪪</div>
                                <span className="text-blue-600 font-bold block">
                                    {selectedFile ? selectedFile.name : "Upload Poornima ID Card"}
                                </span>
                                <p className="text-xs text-slate-400 mt-2">Format: JPG, PNG (Max 5MB)</p>
                            </label>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 bg-slate-100 py-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-200 transition"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSignup}
                                className="flex-[2] bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition"
                            >
                                Complete Signup
                            </button>
                        </div>
                    </div>
                )}

                <p className="text-center text-sm text-slate-500 mt-6">
                    Already have an account? <span onClick={() => navigate("/login")} className="text-blue-600 font-bold cursor-pointer hover:underline">Login</span>
                </p>
            </div>
        </div>
    );
};

export default Signup;