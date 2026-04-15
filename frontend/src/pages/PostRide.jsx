import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft, ShieldCheck, MapPin, Navigation,
    Calendar, Clock, Users, IndianRupee, Zap, Car, Hash, Shield
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import CarLoader from '../components/CarLoader';
const PostRide = () => {
    const navigate = useNavigate();
    const userEmail = localStorage.getItem("userEmail");
    const today = new Date().toISOString().split('T')[0];

    // --- STATES ---
    const [isCheckingStatus, setIsCheckingStatus] = useState(true);
    const [isDriverVerified, setIsDriverVerified] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [isSubmittingDL, setIsSubmittingDL] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showLoader, setShowLoader] = useState(true);

    const [dlData, setDlData] = useState({
        license_no: '',
        full_name: '',
        expiry_date: '',
        vehicle_class: 'LMV',
        dl_front: null
    });

    const [formData, setFormData] = useState({
        start_location: '',
        destination: '',
        departure_date: today,
        departure_time: '',
        seats_available: 4,
        price_per_seat: '',
        vehicle_no: '',
        vehicle_model: ''
    });

    const inputStyle = "w-full p-4 rounded-2xl border-2 border-slate-200 focus:border-[#05488B] focus:ring-4 focus:ring-[#05488B]/5 outline-none font-bold text-slate-800 bg-white shadow-sm transition-all";

    // --- 1. DRIVER STATUS CHECK ---
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await axios.get(`http://127.0.0.1:8000/api/users/me?email=${userEmail}`);
                if (res.data.is_driver_verified === true) {
                    setIsDriverVerified(true);
                    setShowVerifyModal(false);
                } else {
                    setShowVerifyModal(true);
                }
            } catch (err) {
                setShowVerifyModal(true);
            } finally {
                setIsCheckingStatus(false);
            }
        };
        if (userEmail) checkStatus();
        else setIsCheckingStatus(false);

        // Slowed down animation timing to 4.5 seconds
        const timer = setTimeout(() => {
            setShowLoader(false);
        }, 4500);

        return () => clearTimeout(timer);
    }, [userEmail]);

    // --- 2. DRIVER LICENSE SUBMISSION ---
    const handleDlSubmit = async (e) => {
        e.preventDefault();
        if (!dlData.dl_front) return toast.error("Please upload DL image");
        setIsSubmittingDL(true);
        const submitData = new FormData();
        submitData.append("email", userEmail);
        submitData.append("license_no", dlData.license_no);
        submitData.append("full_name", dlData.full_name);
        submitData.append("id_card", dlData.dl_front);

        try {
            await axios.post("http://127.0.0.1:8000/api/users/verify-driver", submitData);
            toast.success("✅ Driver Identity Verified!");
            setIsDriverVerified(true);
            setShowVerifyModal(false);
        } catch (err) {
            toast.error(err.response?.data?.detail || "Verification failed.");
        } finally {
            setIsSubmittingDL(false);
        }
    };

    // --- 3. RIDE POSTING LOGIC ---
    const handlePostRide = async (e) => {
        e.preventDefault();
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        if (!formData.departure_time) return toast.error("Please select a ride time.");
        const [selectedHour, selectedMinute] = formData.departure_time.split(':').map(Number);

        if (selectedHour < 8 || selectedHour >= 20) {
            return toast.error("SECURE LIMIT: Rides only permitted 08:00 AM - 08:00 PM.");
        }

        if (selectedHour < currentHour || (selectedHour === currentHour && selectedMinute <= currentMinute)) {
            return toast.error("TIME ERROR: You cannot post a ride for a time that has passed!");
        }

        if (!formData.vehicle_no.trim() || !formData.vehicle_model.trim()) {
            return toast.error("SAFETY: Vehicle info is mandatory.");
        }

        setLoading(true);
        const payload = {
            start_location: formData.start_location,
            destination: formData.destination,
            departure_time: `${today}T${formData.departure_time}:00`,
            seats_available: parseInt(formData.seats_available),
            price_per_seat: parseInt(formData.price_per_seat),
            vehicle_no: formData.vehicle_no.toUpperCase(),
            vehicle_model: formData.vehicle_model,
            driver_name: localStorage.getItem("userName") || "Buddy",
            contact: "Verified",
            owner: userEmail
        };

        try {
            await axios.post("http://127.0.0.1:8000/api/rides", payload);
            toast.success("🚀 Ride Broadcasted!");
            navigate("/rides");
        } catch (err) {
            toast.error("Network Error.");
        } finally {
            setLoading(false);
        }
    };

    // Show small spinner during status check only if loader animation hasn't started
    if (isCheckingStatus && showLoader) {
        return <CarLoader />;
    }

    return (
        <div className="relative min-h-screen bg-white pb-12 pt-24 px-4 font-sans overflow-hidden">

            {/* 🚗 CAR LOADER OVERLAY */}
            <AnimatePresence>
                {showLoader && (
                    <motion.div
                        className="fixed inset-0 z-[99999] bg-white"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <CarLoader />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- 1. THE LICENSE VERIFICATION MODAL --- */}
            <AnimatePresence>
                {showVerifyModal && !showLoader && (
                    <div className="fixed inset-0 z-[10000] bg-[#05488B]/40 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white/90 backdrop-blur-lg w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border-b-8 border-[#FFC107] relative z-10"
                        >
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-[#05488B]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#05488B]/5 shadow-inner">
                                    <ShieldCheck size={48} className="text-[#05488B]" />
                                </div>
                                <h2 className="text-3xl font-black text-[#05488B] uppercase tracking-tighter leading-none">Identity Check</h2>
                                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-2">Driver Verification Portal</p>
                            </div>

                            <form onSubmit={handleDlSubmit} className="space-y-4">
                                <input required className={inputStyle} placeholder="Driving License Number" onChange={e => setDlData({ ...dlData, license_no: e.target.value })} />
                                <input required className={inputStyle} placeholder="Full Name on DL" onChange={e => setDlData({ ...dlData, full_name: e.target.value })} />
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <label className="text-[9px] font-black ml-2 text-slate-400 uppercase">Expiry</label>
                                        <input type="date" required className={`${inputStyle} text-xs`} onChange={e => setDlData({ ...dlData, expiry_date: e.target.value })} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[9px] font-black ml-2 text-slate-400 uppercase">Class</label>
                                        <select className={`${inputStyle} text-xs`} onChange={e => setDlData({ ...dlData, vehicle_class: e.target.value })}>
                                            <option value="LMV">LMV (Car)</option>
                                            <option value="MCWG">MCWG (Bike)</option>
                                        </select>
                                    </div>
                                </div>
                                <label className="block border-2 border-dashed border-slate-200 p-5 rounded-2xl bg-slate-50 text-center cursor-pointer hover:border-[#05488B] hover:bg-white transition-all group">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-[#05488B]">
                                        {dlData.dl_front ? "✅ Image Captured" : "Upload DL Document"}
                                    </span>
                                    <input type="file" className="hidden" accept="image/*" onChange={e => setDlData({ ...dlData, dl_front: e.target.files[0] })} />
                                </label>
                                <button type="submit" disabled={isSubmittingDL} className="w-full bg-[#05488B] hover:bg-black text-white p-5 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                                    {isSubmittingDL ? "Validating..." : "Verify & Continue"}
                                </button>
                                <button type="button" onClick={() => navigate(-1)} className="w-full text-slate-400 font-bold text-[10px] uppercase hover:text-red-500 tracking-widest transition-colors mt-1 py-1">Exit Portal</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- 2. THE MAIN FORM --- */}
            <div className={`max-w-2xl mx-auto relative z-10 transition-all duration-700 ${!isDriverVerified ? "blur-xl grayscale pointer-events-none" : ""}`}>
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 font-black mb-6 uppercase text-xs hover:text-[#05488B] tracking-widest group">
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back
                </button>

                <div className="bg-[#05488B] rounded-[2rem] p-8 mb-6 text-white border-b-8 border-[#FFC107] relative overflow-hidden shadow-xl">
                    <Zap className="absolute right-[-20px] top-[-20px] text-white/5" size={150} />
                    <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Offer a <span className="text-[#FFC107]">Ride.</span></h1>
                    <p className="text-blue-100 text-sm font-medium italic mt-1.5 opacity-80">"Verified Buddy Network"</p>
                </div>

                <div className="bg-white/95 backdrop-blur-sm rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
                    <form onSubmit={handlePostRide} className="p-8 space-y-6">
                        {/* ROUTE */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#05488B]" size={18} />
                                <input required className={`${inputStyle} pl-12`} placeholder="Pickup Point" onChange={e => setFormData({ ...formData, start_location: e.target.value })} />
                            </div>
                            <div className="relative">
                                <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFC107]" size={18} />
                                <input required className={`${inputStyle} pl-12`} placeholder="Destination" onChange={e => setFormData({ ...formData, destination: e.target.value })} />
                            </div>
                        </div>

                        {/* DATE & TIME */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="date" value={today} readOnly className={`${inputStyle} pl-12 bg-slate-50 cursor-not-allowed`} />
                            </div>
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="time" required min="08:00" max="20:00" className={`${inputStyle} pl-12`} onChange={e => setFormData({ ...formData, departure_time: e.target.value })} />
                                <div className="flex justify-between px-2 mt-2">
                                    <span className="text-[9px] font-black text-[#05488B] uppercase">08:00 - 20:00</span>
                                    <span className="text-[9px] font-black text-red-500 uppercase">Today Only</span>
                                </div>
                            </div>
                        </div>

                        {/* VEHICLE BOX */}
                        <div className="bg-blue-50/50 p-6 rounded-3xl border-2 border-blue-100 space-y-4">
                            <label className="flex items-center gap-2 text-[10px] font-black text-[#05488B] uppercase tracking-widest">
                                <Shield size={14} /> Safety Details
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input required className={`${inputStyle} pl-12 uppercase`} placeholder="Plate No." onChange={e => setFormData({ ...formData, vehicle_no: e.target.value })} />
                                </div>
                                <div className="relative">
                                    <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input required className={`${inputStyle} pl-12`} placeholder="Vehicle Model" onChange={e => setFormData({ ...formData, vehicle_model: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        {/* SEATS & PRICE */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="number" required max="6" className={`${inputStyle} pl-12`} placeholder="Seats" onChange={e => setFormData({ ...formData, seats_available: e.target.value })} />
                            </div>
                            <div className="relative">
                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-[#05488B]" size={18} />
                                <input type="number" required className={`${inputStyle} pl-12`} placeholder="Price/Seat" onChange={e => setFormData({ ...formData, price_per_seat: e.target.value })} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-[#FFC107] text-[#05488B] p-6 rounded-[2.5rem] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 border-b-8 border-black/10 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#05488B] hover:text-white'}`}
                        >
                            {loading ? "SYNCING..." : "Broadcast Ride Offer"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PostRide;