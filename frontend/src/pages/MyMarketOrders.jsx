import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, ShoppingBag, Calendar, IndianRupee,
    CheckCircle, Clock, ShieldCheck, MapPin,
    Star, X, Zap, Ticket, Download, Lock
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const MyMarketOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Feedback & Review States
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedItemForReview, setSelectedItemForReview] = useState(null);
    const [userRating, setUserRating] = useState(5);
    const [userComment, setUserComment] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const prevOrdersRef = useRef([]);

    const userEmail = localStorage.getItem("userEmail");

    const totalSpent = orders.reduce((sum, order) => sum + (Number(order.price) || 0), 0);

    const fetchOrders = useCallback(async () => {
        if (!userEmail) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/my-orders/${userEmail}`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Order fetch failed", error);
        } finally {
            setLoading(false);
        }
    }, [userEmail]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    /**
     * Trigger review modal if status changes to RECEIVED
     */
    useEffect(() => {
        if (orders.length > 0 && prevOrdersRef.current.length > 0) {
            const newlyReceived = orders.find(order => {
                const prevOrder = prevOrdersRef.current.find(p => p.id === order.id);
                return order.status === 'RECEIVED' && prevOrder?.status === 'PENDING_HANDOVER';
            });

            if (newlyReceived) {
                setSelectedOrder(newlyReceived);
                setShowReviewModal(true);
            }
        }
        prevOrdersRef.current = orders;
    }, [orders]);

    const handleReviewSubmit = async () => {
        try {
            const targetItem = selectedItemForReview || selectedOrder;
            await axios.post("http://127.0.0.1:8000/api/marketplace/review", {
                resource_id: targetItem?.id,
                rating: userRating,
                user_email: userEmail,
                comment: userComment
            });

            toast.success("Thank you for your feedback! +10 Points!");
            setShowReviewModal(false);
            setUserComment("");
        } catch (err) {
            console.error("Review Error:", err);
            toast.error("Failed to submit review.");
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "Scheduled" : date.toLocaleDateString();
    };

    // --- SECURE BLOB DOWNLOAD LOGIC ---
    const handleDownload = async (item) => {
        try {
            toast.info("Downloading from vault...");

            const response = await axios({
                url: `http://127.0.0.1:8000/api/marketplace/download/${item.id}`,
                method: 'GET',
                params: { user_email: userEmail },
                responseType: 'blob', // We still need this for the actual PDF
            });

            // --- CRITICAL ERROR CHECK ---
            // If the size is very small, it's likely a JSON error message, not a PDF
            if (response.data.size < 200) {
                const text = await response.data.text();
                if (text.includes("detail")) {
                    try {
                        const errorObj = JSON.parse(text);
                        toast.error(`Vault Error: ${errorObj.detail}`);
                    } catch (e) {
                        toast.error("Access Denied: One-time download already used.");
                    }
                    return;
                }
            }

            // If we get here, it's a real file
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;

            // Clean filename logic preserved
            const fileName = `${item.title.replace(/\s+/g, '_')}_CampusBuddy.pdf`;
            link.setAttribute('download', fileName);

            document.body.appendChild(link);
            link.click();

            // Cleanup logic preserved
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            // --- UI & STATE UPDATES (ORIGINAL LOGIC) ---
            // Update local state to immediately show "Vaulted" / Disable button
            setOrders(prev => prev.map(o => o.id === item.id ? { ...o, is_downloaded: true } : o));

            // Trigger review flow
            setSelectedItemForReview(item);
            setShowReviewModal(true);

            toast.success("Material Downloaded Successfully!");

        } catch (err) {
            // Check for explicit 403 from Axios catch block
            if (err.response && err.response.status === 403) {
                toast.error("One-time download limit reached for this asset.");
            } else {
                console.error("Download Error:", err);
                toast.error("Download failed. The file might be missing or already vaulted.");
            }
        }
    };

    // Styles
    const modalOverlayStyle = {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(5, 72, 139, 0.9)', display: 'flex', justifyContent: 'center',
        alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(10px)'
    };

    const modalContentStyle = {
        backgroundColor: '#0b213a', padding: '40px', borderRadius: '3rem',
        textAlign: 'center', width: '450px', border: '4px solid #FFC107',
        boxShadow: '0px 0px 50px rgba(255,193,7,0.2)'
    };

    const textareaStyle = {
        width: '100%', height: '100px', marginBottom: '20px', borderRadius: '1.5rem',
        padding: '15px', border: '2px solid rgba(255,193,7,0.3)', backgroundColor: '#05488B',
        color: 'white', outline: 'none'
    };

    return (
        <div className="min-h-screen bg-[#05488B] p-6 pt-24 pb-12 font-sans transition-colors duration-300 relative overflow-hidden text-white">

            {/* Background Animation */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {[...Array(25)].map((_, i) => (
                    <div
                        key={i}
                        className="order-glowing-rain"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`,
                            width: `${Math.random() * 8 + 4}px`,
                            height: `${Math.random() * 8 + 4}px`
                        }}
                    />
                ))}
            </div>

            <div className="max-w-5xl mx-auto relative z-10">

                <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-2 text-white/60 hover:text-[#FFC107] font-bold text-xs uppercase tracking-widest mb-6 transition-all"
                >
                    <ArrowLeft size={16} /> Back to Profile
                </button>

                {/* Header Card */}
                <div className="bg-[#0b213a] rounded-[3rem] p-10 md:p-14 mb-10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden border-4 border-[#FFC107]">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6 relative z-10">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase mb-4 tracking-widest">
                                <ShoppingBag size={14} /> Acquisition Vault
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                                Market <span className="text-[#FFC107]">Orders.</span>
                            </h1>
                            <p className="text-blue-200 font-medium mt-3 text-sm max-w-sm">Secure your digital downloads and manage physical handovers.</p>
                        </div>

                        <div className="bg-[#05488B] border-2 border-white/10 p-6 rounded-[2.5rem] shadow-inner flex flex-col items-center min-w-[220px]">
                            <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Total Procurement</p>
                            <p className="text-3xl font-black text-white flex items-center gap-1">
                                <IndianRupee size={22} className="text-[#FFC107]" /> {totalSpent}
                            </p>
                        </div>
                    </div>
                    <Ticket className="absolute -right-10 -top-10 text-white/5 w-64 h-64 rotate-12" />
                </div>

                {loading ? (
                    <div className="flex justify-center py-32">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#FFC107]"></div>
                    </div>
                ) : (
                    <div className="grid gap-8">
                        {orders.length === 0 ? (
                            <div className="bg-[#0b213a] border-4 border-dashed border-white/10 p-20 rounded-[3rem] text-center shadow-2xl">
                                <ShoppingBag size={48} className="mx-auto text-[#FFC107]/20 mb-4" />
                                <p className="text-blue-200 font-black uppercase tracking-widest text-sm opacity-40">No orders found in vault</p>
                            </div>
                        ) : (
                            orders.map((order, index) => {
                                const isDigital = order.category === "Notes" || order.category === "Old Papers";
                                const isReceived = order.status === 'RECEIVED' || order.status === 'AVAILABLE';

                                // FIX: Added index to ensure keys are absolutely unique to prevent React reconciliation errors
                                const hasBeenDownloaded = order.is_downloaded === true || order.is_downloaded === 1;

                                return (
                                    <div
                                        key={`${order.id}-${index}`}
                                        className={`group bg-[#0b213a] border-4 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 transition-all duration-300 shadow-2xl relative overflow-hidden ${!isReceived && !isDigital ? 'border-[#FFC107]' : 'border-white/5 opacity-80 hover:opacity-100'}`}
                                    >
                                        <div className="flex flex-col md:flex-row items-center gap-8 w-full relative z-10">
                                            <div className="relative w-32 h-32 shrink-0">
                                                <div className={`w-full h-full bg-[#05488B] rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-2xl flex items-center justify-center text-blue-300/20 font-black text-xs text-center transition-all duration-700 ${hasBeenDownloaded ? 'blur-lg grayscale opacity-40' : ''}`}>
                                                    {order.file_url || order.image ? (
                                                        <img
                                                            src={order.image ? order.image : `http://127.0.0.1:8000${order.file_url}`}
                                                            alt={order.title}
                                                            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110`}
                                                        />
                                                    ) : (
                                                        "VAULT ITEM"
                                                    )}
                                                </div>
                                                {!isReceived && !isDigital && (
                                                    <div className="absolute -top-3 -right-3 bg-[#FFC107] p-2 rounded-full animate-bounce shadow-lg border-2 border-[#05488B]">
                                                        <Clock size={16} className="text-[#05488B]" strokeWidth={3} />
                                                    </div>
                                                )}
                                                {hasBeenDownloaded && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Lock size={32} className="text-white opacity-50" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-center md:text-left flex-grow">
                                                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                                    <h3 className={`font-black text-2xl text-white uppercase tracking-tight group-hover:text-[#FFC107] transition-colors ${hasBeenDownloaded ? 'opacity-30' : ''}`}>
                                                        {order.title}
                                                    </h3>
                                                </div>

                                                <div className="flex flex-wrap justify-center md:justify-start gap-5">
                                                    <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                                                        <MapPin size={12} className="text-[#FFC107]" />
                                                        {isDigital ? "Cloud Delivery" : (order.meetup_location || "Campus Central")}
                                                    </p>
                                                    <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                                                        <Calendar size={12} className="text-[#FFC107]" />
                                                        {formatDate(order.created_at)}
                                                    </p>
                                                </div>

                                                {!isDigital && order.status === "PENDING_HANDOVER" && (
                                                    <div className="mt-6 p-4 bg-[#05488B] border-2 border-[#FFC107]/30 rounded-2xl inline-flex items-center gap-6 shadow-inner">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-[#FFC107] uppercase tracking-tighter leading-none mb-1">Handover Authorization</span>
                                                            <span className="text-xs text-white/60 font-medium">Verify this with the seller</span>
                                                        </div>
                                                        <div className="bg-[#FFC107] text-[#05488B] px-5 py-2 rounded-xl font-mono font-black text-lg shadow-lg border border-[#FFC107]">
                                                            {order.otp_code || "####"}
                                                        </div>
                                                    </div>
                                                )}

                                                {isDigital && (
                                                    <button
                                                        onClick={() => !hasBeenDownloaded && handleDownload(order)}
                                                        disabled={hasBeenDownloaded}
                                                        className={`mt-6 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${hasBeenDownloaded
                                                            ? 'bg-slate-900 text-slate-600 cursor-not-allowed border border-white/5 opacity-50'
                                                            : 'bg-[#FFC107] text-[#05488B] hover:bg-white hover:scale-105 shadow-xl'
                                                            }`}
                                                    >
                                                        {hasBeenDownloaded ? <><Lock size={16} /> Access Vaulted</> : <><Download size={16} /> Download Asset</>}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-6 border-t md:border-t-0 border-white/10 pt-6 md:pt-0 relative z-10">
                                            <div className="text-left md:text-right">
                                                <p className="text-3xl font-black text-white flex items-center justify-end leading-none">
                                                    <IndianRupee size={22} className="text-[#FFC107]" strokeWidth={3} />
                                                    {order.price}
                                                </p>
                                                <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mt-2 opacity-60">Secured Payment</p>
                                            </div>

                                            {isReceived ? (
                                                <span className="bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/30 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-inner">
                                                    <CheckCircle size={14} /> {isDigital ? 'Cloud Active' : 'Vaulted'}
                                                </span>
                                            ) : (
                                                <span className="bg-[#FFC107] text-[#05488B] px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl border border-[#FFC107]">
                                                    <ShieldCheck size={14} strokeWidth={3} /> Pending Delivery
                                                </span>
                                            )}
                                        </div>
                                        {hasBeenDownloaded && <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] pointer-events-none"></div>}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {showReviewModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-[#FFC107]/10 text-[#FFC107] p-4 rounded-2xl border border-[#FFC107]/20">
                                <Star size={32} className="fill-[#FFC107]" />
                            </div>
                            <button onClick={() => setShowReviewModal(false)} className="text-white/20 hover:text-white transition-all">
                                <X size={24} />
                            </button>
                        </div>
                        <h2 className="text-3xl font-black text-white mb-2 tracking-tighter">
                            Rate this <span className="text-[#FFC107]">Resource</span>
                        </h2>
                        <p className="text-blue-100/60 text-sm mb-6 font-medium">
                            How helpful was <strong>{selectedItemForReview?.title || selectedOrder?.title}</strong>?
                        </p>
                        <div className="flex justify-center gap-3 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => setUserRating(star)} className="hover:scale-125 transition-transform">
                                    <Star size={36} className={`${userRating >= star ? 'text-[#FFC107] fill-[#FFC107]' : 'text-blue-900'} transition-all`} />
                                </button>
                            ))}
                        </div>
                        <textarea placeholder="Write a quick review..." style={textareaStyle} value={userComment} onChange={(e) => setUserComment(e.target.value)} />
                        <div className="flex flex-col gap-3">
                            <button onClick={handleReviewSubmit} className="w-full py-4 rounded-2xl bg-[#FFC107] text-[#05488B] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl">
                                Submit Review
                            </button>
                            <button onClick={() => setShowReviewModal(false)} className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-white transition-all py-2">
                                Skip for now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .order-glowing-rain {
                    position: absolute;
                    top: -10%;
                    background: #FFC107;
                    border-radius: 50%;
                    opacity: 0;
                    box-shadow: 0 0 20px 4px #FFC107, 0 0 40px 8px rgba(255, 193, 7, 0.3);
                    animation: order-fall linear infinite;
                }
                @keyframes order-fall {
                    0% { transform: translateY(0); opacity: 0; }
                    10% { opacity: 0.8; }
                    50% { opacity: 0.4; }
                    90% { opacity: 0.8; }
                    100% { transform: translateY(115vh); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default MyMarketOrders;