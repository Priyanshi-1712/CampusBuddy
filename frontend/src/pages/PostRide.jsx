import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PostRide = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        destination: "",
        time: "", // This will now store the ISO string from the datetime picker
        seats: "",
        price: "",
        contact: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Get info from localStorage
        const userEmail = localStorage.getItem("userEmail");
        const userName = localStorage.getItem("userName") || "Student";

        const ridePayload = {
            destination: formData.destination,
            time: formData.time,
            seats: parseInt(formData.seats),
            price: parseInt(formData.price),
            driver: userName,
            contact: formData.contact,
            owner: userEmail
        };

        try {
            const res = await fetch("http://127.0.0.1:8000/api/rides", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(ridePayload)
            });

            if (res.ok) {
                alert("Ride Posted Successfully!");
                navigate("/ride-buddy");
            } else {
                const errorData = await res.json();
                alert("Error: " + (errorData.detail || "Could not post ride"));
            }
        } catch (error) {
            console.error("Error posting ride:", error);
            alert("Server is not responding. Check if your backend is running.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 pt-20">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-xl p-10 border border-slate-100">
                <h1 className="text-2xl font-black text-slate-800 mb-6 text-center">Offer a Ride 🚗</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Destination Input */}
                    <input
                        type="text"
                        placeholder="Destination (e.g., Jaipur City)"
                        required
                        value={formData.destination}
                        className="w-full bg-slate-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500"
                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    />

                    {/* Enhanced Date and Time Picker */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-500 ml-2 uppercase tracking-wide">Departure Date & Time</label>
                        <input
                            type="datetime-local"
                            required
                            value={formData.time}
                            className="w-full bg-slate-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 text-slate-600"
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        />
                    </div>

                    {/* Seats and Price Row */}
                    <div className="flex gap-4">
                        <div className="w-1/2 flex flex-col gap-1">
                            <input
                                type="number"
                                placeholder="Seats"
                                required
                                min="1"
                                value={formData.seats}
                                className="w-full bg-slate-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500"
                                onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                            />
                        </div>
                        <div className="w-1/2 flex flex-col gap-1">
                            <input
                                type="number"
                                placeholder="Price (₹)"
                                required
                                min="0"
                                value={formData.price}
                                className="w-full bg-slate-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500"
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Contact Number */}
                    <input
                        type="text"
                        placeholder="Phone / WhatsApp (for admin only)"
                        required
                        value={formData.contact}
                        className="w-full bg-slate-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500"
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    />

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95 mt-4"
                    >
                        Share Ride →
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PostRide;