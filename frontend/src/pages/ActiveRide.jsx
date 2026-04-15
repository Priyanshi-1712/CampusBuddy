import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Key, ShieldCheck, Phone, Star, AlertTriangle, CreditCard, Navigation2, CheckCircle, IndianRupee, User, Zap } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import polyline from '@mapbox/polyline';

// --- CUSTOM RAPIDO-STYLE MARKERS ---
const getRotatedCarIcon = (angle) => L.divIcon({
    className: 'bg-transparent',
    html: `<div style="transform: rotate(${angle}deg); transition: transform 0.6s linear; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; filter: drop-shadow(0 6px 8px rgba(0,0,0,0.5));">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFC107" stroke="#05488B" stroke-width="2.5" stroke-linejoin="round">
              <path d="M12 2L3 21l9-4 9 4z" />
            </svg>
           </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24]
});

const pickupIcon = L.divIcon({
    className: 'bg-transparent',
    html: `<div style="width: 18px; height: 18px; background-color: #05488B; border: 3px solid #FFC107; border-radius: 50%; box-shadow: 0 0 15px rgba(255,193,7,0.6);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
});

const dropoffIcon = L.divIcon({
    className: 'bg-transparent',
    html: `<div style="width: 18px; height: 18px; background-color: #ef4444; border: 3px solid white; border-radius: 4px; box-shadow: 0 0 15px rgba(239,68,68,0.5);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
});

const MapTracker = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) map.flyTo(position, map.getZoom(), { animate: true, duration: 0.5 });
    }, [position, map]);
    return null;
};

const ActiveRide = () => {
    const { rideId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const initialRideData = location.state?.ride || null;
    const [ride, setRide] = useState(initialRideData);
    const [otpInput, setOtpInput] = useState("");

    const userEmail = localStorage.getItem("userEmail");
    const isDriver = ride?.owner?.toLowerCase().trim() === userEmail?.toLowerCase().trim();

    // --- STATES ---
    const [sheetState, setSheetState] = useState("half");
    const [touchStartY, setTouchStartY] = useState(null);
    const [hasArrived, setHasArrived] = useState(false);
    const [collectedCashFrom, setCollectedCashFrom] = useState([]);

    const startCoords = [26.9124, 75.7873];
    const destCoords = [26.8289, 75.8056];

    const [realRoute, setRealRoute] = useState([]);
    const [carAngle, setCarAngle] = useState(0);
    const [progressIndex, setProgressIndex] = useState(0);

    // --- RATING STATES ---
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [ratingSubmitted, setRatingSubmitted] = useState(false);

    useEffect(() => {
        if (!ride) {
            toast.error("Ride details not found!");
            navigate(-1);
        }
    }, [ride, navigate]);

    // --- FIX: BACKGROUND HEARTBEAT SENSOR ---
    useEffect(() => {
        if (!ride || ride.status === 'COMPLETED') return;

        const checkStatus = async () => {
            try {
                const endpoint = isDriver
                    ? `http://127.0.0.1:8000/api/my-offered-rides/${userEmail}`
                    : `http://127.0.0.1:8000/api/my-bookings/${userEmail}`;

                const res = await axios.get(endpoint);
                const updatedRide = res.data.find(r => String(r.id) === String(ride.id));

                if (updatedRide && updatedRide.status !== ride.status) {
                    setRide(prev => ({ ...prev, status: updatedRide.status }));

                    if (updatedRide.status === 'COMPLETED' && !isDriver) {
                        toast.success("Driver has ended the trip. Safe travels!");
                        setTimeout(() => navigate('/rides'), 3000);
                    }
                }
            } catch (err) {
                console.debug("Background sync paused.");
            }
        };

        const syncInterval = setInterval(checkStatus, 4000);
        return () => clearInterval(syncInterval);
    }, [ride?.id, ride?.status, isDriver, userEmail, navigate]);

    // --- MAP ROUTING ---
    useEffect(() => {
        const getRoute = async () => {
            const url = `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${destCoords[1]},${destCoords[0]}?overview=full`;
            try {
                const res = await axios.get(url);
                const decodedPath = polyline.decode(res.data.routes[0].geometry);
                setRealRoute(decodedPath);
            } catch (error) {
                setRealRoute([startCoords, destCoords]);
            }
        };
        getRoute();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const calculateBearing = (start, end) => {
        const startLat = start[0] * Math.PI / 180;
        const startLng = start[1] * Math.PI / 180;
        const endLat = end[0] * Math.PI / 180;
        const endLng = end[1] * Math.PI / 180;
        const dLng = endLng - startLng;
        const y = Math.sin(dLng) * Math.cos(endLat);
        const x = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);
        const bearing = Math.atan2(y, x) * 180 / Math.PI;
        return (bearing + 360) % 360;
    };

    useEffect(() => {
        let interval;
        if (ride?.status === 'IN_TRANSIT' && realRoute.length > 0 && !hasArrived) {
            interval = setInterval(() => {
                setProgressIndex(prev => {
                    if (prev >= realRoute.length - 2) {
                        clearInterval(interval);
                        setHasArrived(true);
                        if (sheetState === "minimized") setSheetState("half");
                        return realRoute.length - 1;
                    }
                    const currentPoint = realRoute[prev];
                    const nextPoint = realRoute[prev + 1];
                    setCarAngle(calculateBearing(currentPoint, nextPoint));
                    return prev + 1;
                });
            }, 800);
        }
        return () => clearInterval(interval);
    }, [ride?.status, realRoute, hasArrived, sheetState]);

    const currentPos = realRoute.length > 0 ? realRoute[progressIndex] : startCoords;
    const routeCovered = realRoute.slice(0, progressIndex + 1);
    const routeRemaining = realRoute.slice(progressIndex);

    // --- GESTURE HANDLERS ---
    const handleTouchStart = (e) => setTouchStartY(e.touches[0].clientY);
    const handleTouchEnd = (e) => {
        if (!touchStartY) return;
        const diff = e.changedTouches[0].clientY - touchStartY;
        if (diff > 50) setSheetState(prev => prev === "full" ? "half" : "minimized");
        else if (diff < -50) setSheetState(prev => prev === "minimized" ? "half" : "full");
        setTouchStartY(null);
    };

    const handleTapToggle = () => setSheetState(prev => (prev === "minimized" ? "half" : "minimized"));

    const getSheetHeight = () => {
        if (sheetState === "minimized") return "h-[18vh]";
        if (sheetState === "full") return "h-[85vh]";
        return "h-[45vh]";
    };

    // --- ACTIONS ---
    const handleVerifyOTP = async (passengerEmail) => {
        if (otpInput.length !== 4) return toast.error("OTP must be 4 digits");
        try {
            const res = await axios.post("http://127.0.0.1:8000/api/rides/start", {
                ride_id: ride.id,
                passenger_email: passengerEmail,
                otp_code: otpInput
            });
            if (res.data.status === "success") {
                toast.success("Ride Started!");
                setRide(prev => ({ ...prev, status: "IN_TRANSIT" }));
                setOtpInput("");
            }
        } catch (err) {
            toast.error(err.response?.data?.detail || "Invalid OTP!");
        }
    };

    const handleCollectCash = (email, name) => {
        setCollectedCashFrom(prev => [...prev, email]);
        toast.success(`Collected ₹${ride.price_per_seat} from ${name}!`);
    };

    const handleCompleteRide = async () => {
        try {
            const res = await axios.post("http://127.0.0.1:8000/api/rides/complete", { ride_id: ride.id });
            if (res.data.status === "success") {
                toast.success(`Trip Completed Successfully!`);
                setRide(prev => ({ ...prev, status: "COMPLETED" }));
                setTimeout(() => navigate('/profile'), 2500);
            }
        } catch (err) {
            toast.error("Failed to complete ride.");
        }
    };

    const handleSubmitRating = async (stars) => {
        setRating(stars);
        try {
            const targetEmail = isDriver
                ? (ride.bookings && ride.bookings.length > 0 ? ride.bookings[0].booker_email : null)
                : ride.owner;

            if (!targetEmail) {
                setRatingSubmitted(true);
                return;
            }

            const res = await axios.post("http://127.0.0.1:8000/api/submit-rating", {
                reviewer_email: userEmail,
                target_email: targetEmail,
                stars: stars,
                type: "ride"
            });

            if (res.data) {
                toast.success(res.data.message || "Feedback submitted! +10 Points");
                setRatingSubmitted(true);
            }
        } catch (err) {
            toast.error("Failed to submit rating.");
        }
    };

    if (!ride) return null;

    const isMockUPI = (index) => index % 2 !== 0;

    return (
        <div className="relative h-[100dvh] w-full bg-[#F8FAFC] font-sans overflow-hidden flex flex-col">

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .custom-shadow-3d { box-shadow: 0 15px 35px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.05); }
            `}</style>

            {/* TOP FLOATING HEADER */}
            <div className="absolute top-0 left-0 right-0 z-[1000] p-4 sm:p-6 pt-16 sm:pt-20 pointer-events-none flex justify-between items-start">
                <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white shadow-2xl border-2 border-slate-100 rounded-full flex items-center justify-center text-[#05488B] hover:bg-slate-50 transition-all pointer-events-auto active:scale-90">
                    <ArrowLeft size={24} />
                </button>

                <div className="bg-[#05488B] shadow-2xl px-6 py-2.5 rounded-full border-2 border-[#FFC107] flex items-center gap-3 pointer-events-auto">
                    {hasArrived && ride.status !== "COMPLETED" ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse"></div>
                    ) : (
                        <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${ride.status === 'IN_TRANSIT' ? 'bg-[#FFC107] shadow-[0_0_10px_#FFC107]' : 'bg-orange-500'}`}></div>
                    )}
                    <span className="text-white font-black uppercase tracking-widest text-[10px] sm:text-xs">
                        {ride.status === 'COMPLETED' ? 'Trip Ended' : hasArrived ? 'Arrived' : ride.status === 'IN_TRANSIT' ? 'Live Trip' : 'En Route'}
                    </span>
                </div>
            </div>

            {/* MAP SECTION */}
            <div className="absolute inset-0 z-0">
                <MapContainer center={startCoords} zoom={14} zoomControl={false} className="w-full h-full grayscale-[0.2]">
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
                    {realRoute.length > 0 && (
                        <>
                            <Polyline positions={routeCovered} color="#05488B" weight={6} opacity={0.9} />
                            <Polyline positions={routeRemaining} color="#cbd5e1" weight={4} opacity={0.6} dashArray="8 12" />
                        </>
                    )}
                    <Marker position={startCoords} icon={pickupIcon} />
                    <Marker position={destCoords} icon={dropoffIcon} />
                    {(ride.status === 'IN_TRANSIT' || ride.status === 'COMPLETED') && (
                        <>
                            <Marker position={currentPos} icon={getRotatedCarIcon(carAngle)} />
                            {ride.status === 'IN_TRANSIT' && !hasArrived && <MapTracker position={currentPos} />}
                        </>
                    )}
                </MapContainer>
            </div>

            {/* BOTTOM SHEET (Themed 3D Console) */}
            <div
                className={`absolute bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.15)] border-t-8 border-[#FFC107] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col ${getSheetHeight()}`}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* Drag Handle */}
                <div className="w-full pt-4 pb-6 flex justify-center cursor-pointer touch-none" onClick={handleTapToggle}>
                    <div className="w-16 h-2 bg-slate-200 rounded-full hover:bg-slate-300 transition-colors"></div>
                </div>

                <div className="max-w-2xl mx-auto w-full px-6 sm:px-10 overflow-y-auto pb-10 no-scrollbar">

                    {/* DRIVER WAITING: OTP CONSOLE */}
                    {isDriver && ride.status === "SCHEDULED" && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4">
                            <div className="text-center mb-4">
                                <div className="inline-flex items-center gap-2 bg-[#FFC107]/10 text-[#05488B] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#FFC107]/30">
                                    <ShieldCheck size={14} /> Security Checkpoint
                                </div>
                            </div>
                            {ride.bookings && ride.bookings.length > 0 ? (
                                <div className="bg-[#05488B] p-3 rounded-[2rem] border-4 border-[#FFC107] flex gap-3 shadow-2xl">
                                    <input
                                        type="text" maxLength="4" placeholder="0000"
                                        value={otpInput} onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                                        className="flex-1 bg-transparent px-6 text-center text-4xl font-black tracking-[0.4em] text-[#FFC107] outline-none placeholder:text-blue-900/50 font-mono"
                                    />
                                    <button
                                        onClick={() => handleVerifyOTP(ride.bookings[0].booker_email)} disabled={otpInput.length !== 4}
                                        className="bg-[#FFC107] disabled:bg-blue-900/30 disabled:text-white/20 hover:bg-white text-[#05488B] px-8 rounded-2xl font-black uppercase text-sm tracking-widest transition-all active:scale-95 shadow-xl"
                                    >
                                        Start
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-slate-50 p-8 rounded-[2.5rem] text-center border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Waiting for passenger check-in...</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* PASSENGER WAITING: OTP DISPLAY */}
                    {!isDriver && ride.status === "SCHEDULED" && (
                        <div className="bg-[#05488B] p-8 rounded-[3rem] shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 border-b-8 border-[#FFC107] relative overflow-hidden">
                            <Zap className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 rotate-12" />
                            <div className="flex justify-between items-center relative z-10">
                                <div>
                                    <p className="text-[10px] font-black text-[#FFC107] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                        <ShieldCheck size={14} /> Verification PIN
                                    </p>
                                    <p className="text-lg text-white font-black tracking-tight">Boarding Pass</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-2xl border-2 border-[#FFC107]/40 shadow-inner">
                                    <p className="text-4xl font-black text-[#FFC107] tracking-[0.2em] font-mono">{ride.otp_code || "----"}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* LIVE RIDE TRACKING */}
                    {ride.status === "IN_TRANSIT" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8">

                            {hasArrived && !isDriver && (
                                <div className="bg-emerald-50 border-4 border-emerald-400/30 p-6 rounded-[2.5rem] text-center animate-in zoom-in-95 shadow-xl">
                                    <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <CheckCircle className="text-emerald-600" size={28} />
                                    </div>
                                    <p className="text-emerald-800 font-black uppercase tracking-widest text-xs mb-1">Destination Reached</p>
                                    <p className="text-slate-600 text-sm font-medium">Please pay <span className="font-black text-2xl text-[#05488B] mx-1">₹{ride.price_per_seat}</span> to the driver.</p>
                                </div>
                            )}

                            {!hasArrived && (
                                <div className="space-y-8">
                                    {/* DRIVER INFO BOX */}
                                    <div className="flex items-center justify-between bg-slate-50 p-5 rounded-[2rem] border border-slate-200">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-[#05488B] rounded-2xl flex items-center justify-center text-[#FFC107] font-black text-2xl shadow-xl border-2 border-white">
                                                {(ride.driver_name || "D")[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-[#05488B] capitalize tracking-tight leading-none mb-1">{ride.driver_name || "Buddy Driver"}</h4>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-0.5 bg-yellow-400/20 px-2 py-0.5 rounded-md">
                                                        <Star size={12} className="text-[#05488B] fill-[#05488B]" />
                                                        <span className="text-[10px] font-black text-[#05488B]">4.9</span>
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RJ-14 Campus</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-[#05488B] hover:bg-slate-100 transition shadow-sm active:scale-90">
                                                <Phone size={22} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* JOURNEY STATUS */}
                                    <div className="bg-[#05488B] p-6 rounded-[2.5rem] border-b-8 border-[#FFC107] shadow-2xl relative overflow-hidden">
                                        <div className="flex gap-6 relative z-10">
                                            <div className="flex flex-col items-center">
                                                <div className="w-4 h-4 rounded-full bg-[#FFC107] shadow-[0_0_10px_#FFC107]"></div>
                                                <div className="w-1 h-12 bg-white/20 my-1 rounded-full"></div>
                                                <div className="w-4 h-4 rounded-sm bg-red-400"></div>
                                            </div>
                                            <div className="flex flex-col justify-between py-1 w-full text-white">
                                                <div>
                                                    <p className="text-[9px] font-black text-[#FFC107] uppercase tracking-[0.2em] mb-0.5">Departed</p>
                                                    <p className="text-base font-bold truncate opacity-90">Main Gate Hub</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-[#FFC107] uppercase tracking-[0.2em] mb-0.5">Approach</p>
                                                    <p className="text-base font-bold truncate opacity-90">{ride.destination || "Destination"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isDriver && hasArrived && (
                                <div className="animate-in fade-in slide-in-from-bottom-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#05488B] pl-1">Payment Manifest</h5>
                                        <span className="text-[10px] font-black text-slate-400">{ride.bookings?.length} Passengers</span>
                                    </div>
                                    <div className="space-y-4">
                                        {ride.bookings?.map((passenger, idx) => {
                                            const paidUPI = passenger.payment_method === 'UPI' || isMockUPI(idx);
                                            const cashCollected = collectedCashFrom.includes(passenger.booker_email);

                                            return (
                                                <div key={idx} className="flex items-center justify-between bg-slate-50 p-5 rounded-3xl border-2 border-slate-100 shadow-sm">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-[#05488B] text-[#FFC107] flex items-center justify-center font-black border-2 border-white shadow-md">
                                                            {passenger.booker_name[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-[#05488B] truncate max-w-[120px]">{passenger.booker_name}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{paidUPI ? 'Digital Transaction' : 'Cash on Arrival'}</p>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        {paidUPI || cashCollected ? (
                                                            <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-emerald-200">
                                                                <CheckCircle size={14} /> Received
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleCollectCash(passenger.booker_email, passenger.booker_name)}
                                                                className="bg-[#FFC107] hover:bg-[#05488B] hover:text-white text-[#05488B] px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 border border-[#FFC107]"
                                                            >
                                                                Collect ₹{ride.price_per_seat}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={handleCompleteRide}
                                        className="w-full mt-10 bg-[#05488B] hover:bg-slate-800 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 border-b-8 border-black/20"
                                    >
                                        <Navigation2 size={22} className="fill-white" /> Complete Mission
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TRIP COMPLETED MODAL CONTENT */}
                    {ride.status === "COMPLETED" && (
                        <div className="text-center py-10 animate-in zoom-in-95">
                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-white shadow-2xl">
                                <CheckCircle size={48} className="text-emerald-500" />
                            </div>
                            <h3 className="text-3xl font-black text-[#05488B] tracking-tight mb-2">Trip Finalized</h3>
                            <p className="text-slate-500 text-sm mb-10 font-bold uppercase tracking-widest">Safe Arrival. No more buddy miles left.</p>

                            {!ratingSubmitted ? (
                                <div className="bg-[#05488B]/5 p-8 rounded-[3rem] border-2 border-[#05488B]/10 mb-10 shadow-inner">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#05488B] mb-6">
                                        Rate your {isDriver ? "Passenger" : "Driver"} experience
                                    </p>
                                    <div className="flex justify-center gap-4">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                onClick={() => handleSubmitRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className="transition-transform hover:scale-125 active:scale-95"
                                            >
                                                <Star
                                                    size={44}
                                                    className={`${(hoverRating || rating) >= star ? 'text-[#FFC107] fill-[#FFC107] drop-shadow-[0_0_10px_rgba(255,193,7,0.5)]' : 'text-slate-300'} transition-all duration-200`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-[#FFC107]/10 border-2 border-[#FFC107] p-6 rounded-[2.5rem] mb-10 animate-in zoom-in">
                                    <p className="text-[#05488B] text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                        <Star size={20} className="fill-[#05488B]" /> Mission Rewarded • +10 Points
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={() => navigate('/rides')}
                                className="w-full bg-[#05488B] hover:bg-slate-800 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 border-b-4 border-black/20"
                            >
                                Dismiss Dashboard
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ActiveRide;