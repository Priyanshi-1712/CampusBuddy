import React, { useState, useEffect } from 'react';
import { AlertOctagon } from 'lucide-react';
import { toast } from 'react-hot-toast'; // Assuming you use react-hot-toast!
import axios from 'axios';

const SOSButton = ({ userEmail }) => {
    const [isPressing, setIsPressing] = useState(false);
    const [loading, setLoading] = useState(false);

    // --- NEW STATE: Check if SOS should be visible ---
    const [isVisible, setIsVisible] = useState(false);
    const email = userEmail || localStorage.getItem("userEmail");

    useEffect(() => {
        const checkActiveRide = async () => {
            if (!email) return;
            try {
                // Check if user has any active bookings or offered rides that are IN_TRANSIT
                const [bookingsRes, offeredRes] = await Promise.all([
                    axios.get(`http://127.0.0.1:8000/api/my-bookings/${email}`),
                    axios.get(`http://127.0.0.1:8000/api/my-offered-rides/${email}`)
                ]);

                const hasActiveBooking = bookingsRes.data.some(r => r.status === "IN_TRANSIT");
                const hasActiveOffer = offeredRes.data.some(r => r.status === "IN_TRANSIT");

                setIsVisible(hasActiveBooking || hasActiveOffer);
            } catch (err) {
                console.error("Status check failed", err);
            }
        };

        checkActiveRide();
        // Set up an interval to poll status every 10 seconds while on the page
        const interval = setInterval(checkActiveRide, 10000);
        return () => clearInterval(interval);
    }, [email]);

    const handleSOS = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser. Call security directly!");
            return;
        }

        setLoading(true);
        toast.loading("Acquiring GPS location...", { id: "sos-toast" });

        navigator.geolocation.getCurrentPosition(async (position) => {
            const payload = {
                email: userEmail || localStorage.getItem("userEmail") || "Anonymous",
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                location: `Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`
            };

            try {
                const res = await fetch("http://127.0.0.1:8000/api/sos/trigger", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    toast.success("🚨 EMERGENCY ALERT SENT! GPS coordinates transmitted to Admin.", { id: "sos-toast", duration: 5000 });
                } else {
                    const errData = await res.json();
                    toast.error(`SOS Failed: ${errData.detail}`, { id: "sos-toast" });
                }
            } catch (err) {
                console.error("SOS Connection Error:", err);
                toast.error("Could not connect to dispatch. Call security directly!", { id: "sos-toast" });
            } finally {
                setLoading(false);
            }
        }, (error) => {
            setLoading(false);
            toast.error("Please enable Location Access to use the SOS feature.", { id: "sos-toast" });
        });
    };

    // Only render the button if a ride is active (IN_TRANSIT)
    if (!isVisible) return null;

    return (
        <button
            onMouseDown={() => setIsPressing(true)}
            onMouseUp={() => setIsPressing(false)}
            onMouseLeave={() => setIsPressing(false)}
            onTouchStart={() => setIsPressing(true)}
            onTouchEnd={() => setIsPressing(false)}
            onClick={handleSOS}
            disabled={loading}
            className={`fixed bottom-8 right-8 p-5 rounded-full shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all active:scale-90 z-[9999] border-4 border-white flex items-center justify-center 
                ${isPressing ? 'bg-red-800 scale-110' : 'bg-red-600'} 
                ${loading ? 'opacity-80 cursor-wait animate-pulse' : 'cursor-pointer hover:bg-red-700'}`
            }
        >
            <AlertOctagon size={32} className={`text-white ${!loading && 'animate-pulse'}`} />

            <span className="absolute -top-12 right-0 bg-red-600 text-white text-[11px] px-3 py-1.5 rounded-full font-bold shadow-lg whitespace-nowrap uppercase tracking-wider">
                {loading ? "Acquiring GPS..." : "Tap for SOS"}
            </span>

            {/* Visual ripple effect for emergency button */}
            {!loading && (
                <div className="absolute inset-0 rounded-full animate-ping bg-red-500 opacity-30 duration-1000"></div>
            )}
        </button>
    );
};

export default SOSButton;