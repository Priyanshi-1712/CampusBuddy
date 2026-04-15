import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, MessageSquare, Clock, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import axios from 'axios';
import RatingModal from '../components/RatingModal';
import { toast } from 'react-toastify';

const RideBuddy = () => {
    // --- State Variables ---
    const [rides, setRides] = useState([]);
    const [destination, setDestination] = useState("");
    const [departureTime, setDepartureTime] = useState("");
    const [seats, setSeats] = useState("");
    const [price, setPrice] = useState("");
    const [contactInfo, setContactInfo] = useState("");

    const navigate = useNavigate();

    // Get current user email from localStorage
    const currentUserEmail = localStorage.getItem("userEmail");

    // Fetch rides from backend
    const fetchRides = () => {
        fetch("http://127.0.0.1:8000/api/rides")
            .then(res => res.json())
            .then(data => setRides(data))
            .catch(err => console.log("Error fetching rides"));
    };

    useEffect(() => {
        fetchRides();
    }, []);

    // --- NEW: 12-Hour Status Logic ---
    const getRideStatus = (time) => {
        const now = new Date();
        const start = new Date(time);
        const diff = (start - now) / (1000 * 60);

        if (diff < 0) return { label: "Ride Started", color: "text-red-500 bg-red-50 dark:bg-red-500/10" };
        if (diff <= 30) return { label: "Starting Soon!", color: "text-orange-500 bg-orange-50 dark:bg-orange-500/10 animate-pulse" };

        return {
            label: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
            color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10"
        };
    };

    // --- NEW: Report Logic Implementation ---
    const handleReportUser = async (reportedEmail, rideId) => {
        const reason = prompt("Enter reason for reporting (e.g. Suspicious activity, Over-pricing, Safety concerns):");
        if (!reason) return;

        try {
            await axios.post("http://127.0.0.1:8000/api/report", {
                reporter_email: currentUserEmail,
                reported_email: reportedEmail,
                reason: reason,
                category: "Ride",
                item_id: rideId
            });
            toast.success("Ride reported successfully. Security team will review it.");
        } catch (err) {
            console.error("Report failed", err);
            toast.error("Failed to submit report.");
        }
    };

    // --- Logic Functions Preserved ---

    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = localStorage.getItem("userEmail");
        const name = localStorage.getItem("userName");

        if (!email) {
            alert("Please log in first!");
            return;
        }

        const rideData = {
            destination: destination,
            departure_time: new Date(departureTime).toISOString(),
            seats_available: parseInt(seats),
            price_per_seat: parseInt(price),
            driver_name: name || "Student",
            contact: contactInfo || "N/A",
            license_number: "PENDING",
            owner: email.toLowerCase()
        };

        try {
            await axios.post("http://127.0.0.1:8000/api/rides", rideData);
            alert("Ride posted successfully!");
            navigate('/ride-buddy');
            fetchRides();
        } catch (err) {
            console.error("VALIDATION ERROR:", err.response?.data?.detail);
            alert("Server error. Look at the Browser Console (F12) for detail.");
        }
    };

    const handleBookRide = async (rideId) => {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) {
            alert("Please log in to book a ride!");
            return;
        }

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/rides/${rideId}/book`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ booker_email: userEmail })
            });

            const data = await response.json();
            if (response.ok) {
                alert("🎉 Booking Successful!");
                fetchRides();
                navigate('/my-bookings');
            } else {
                alert(`Booking Failed: ${data.detail}`);
            }
        } catch (err) {
            console.error("Booking Error:", err);
            alert("Network error.");
        }
    };

    const handleDeleteRide = async (rideId) => {
        if (window.confirm("Are you sure you want to delete this ride?")) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/rides/${rideId}`);
                alert("Ride deleted successfully");
                fetchRides();
            } catch (err) {
                console.error("Delete failed:", err);
                alert("Failed to delete ride");
            }
        }
    };

    // --- OrderItem component ---
    const OrderItem = ({ order }) => {
        const [showRating, setShowRating] = useState(false);
        const handleCompleteOrder = async () => {
            try {
                setShowRating(true);
            } catch (err) {
                console.error("Error completing order", err);
            }
        };

        return (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 transition-colors mb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">{order.item_name}</h3>
                        <p className="text-sm text-slate-500">Seller: {order.seller_name}</p>
                    </div>
                    <button
                        onClick={handleCompleteOrder}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all active:scale-95"
                    >
                        Mark as Received
                    </button>
                </div>
                <RatingModal
                    isOpen={showRating}
                    onClose={() => setShowRating(false)}
                    targetEmail={order.seller_email}
                    targetName={order.seller_name}
                    type="product"
                />
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 pt-24 dark:bg-slate-950 transition-colors">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white">RideBuddy</h1>
                    <button
                        onClick={() => navigate('/post-ride')}
                        className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition flex items-center gap-2 dark:bg-white dark:text-black"
                    >
                        <Plus size={20} /> Offer Ride
                    </button>
                </div>
                <p className="text-slate-500 mb-8 font-medium">Find a ride or offer a seat to your college mates.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rides.map((ride) => {
                        const isOwner = ride.owner === currentUserEmail;
                        const isAlreadyBooked = ride.passengers?.includes(currentUserEmail);
                        const isFull = ride.seats_available <= 0;
                        const status = getRideStatus(ride.departure_time);

                        return (
                            <div key={ride.id} className="relative bg-white p-6 rounded-[2rem] shadow-sm border-2 border-slate-100 dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between hover:shadow-xl transition-all group">

                                {/* ACTION BUTTONS AREA */}
                                <div className="absolute top-6 right-6 flex gap-3">
                                    {/* REPORT BUTTON (Visible to everyone except owner) */}
                                    {!isOwner && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleReportUser(ride.owner, ride.id); }}
                                            className="text-slate-300 hover:text-orange-500 transition-all transform hover:scale-110"
                                            title="Report Suspicious Ride"
                                        >
                                            <AlertTriangle size={20} />
                                        </button>
                                    )}

                                    {isOwner && (
                                        <button
                                            onClick={() => handleDeleteRide(ride.id)}
                                            className="text-slate-300 hover:text-red-500 transition-all transform hover:scale-110"
                                        >
                                            <Trash2 size={22} />
                                        </button>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                                            {status.label}
                                        </span>
                                    </div>

                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1">To: {ride.destination}</h3>

                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-1">
                                        <Clock size={12} />
                                        {new Date(ride.departure_time).toLocaleDateString([], {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        })}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">
                                        {ride.driver_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">Driver</p>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{ride.driver_name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">₹{ride.price_per_seat}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                                                {ride.seats_available} seats left
                                            </p>
                                        </div>

                                        {!isOwner && (
                                            <button
                                                onClick={() => navigate(`/messages/${ride.owner}`)}
                                                className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                title="Chat with Driver"
                                            >
                                                <MessageSquare size={18} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {isOwner ? (
                                            <div className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl font-black uppercase text-[10px] tracking-widest">
                                                My Ride
                                            </div>
                                        ) : isAlreadyBooked ? (
                                            <button disabled className="bg-green-600/10 text-green-500 px-6 py-3 rounded-2xl font-black uppercase text-xs border border-green-500/20">
                                                Booked
                                            </button>
                                        ) : isFull ? (
                                            <button disabled className="bg-slate-100 text-slate-400 px-6 py-3 rounded-2xl font-black uppercase text-xs border border-slate-200">
                                                Full
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleBookRide(ride.id)}
                                                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                                            >
                                                Book Seat
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {rides.length === 0 && (
                    <div className="bg-white p-16 rounded-[3rem] text-center border-2 border-dashed border-slate-200 mt-10 dark:bg-slate-900 dark:border-slate-800">
                        <p className="text-slate-400 font-bold uppercase tracking-widest">No rides available right now</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RideBuddy;