import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Trash2, Eye, X, ShoppingCart, ShieldCheck, User, Zap, MessageSquare, IndianRupee, Clock, Ticket } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Import your modals
import PaymentModal from '../components/PaymentModal';
import ChatBox from '../components/ChatBox';

const Wishlist = () => {
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState([]);
    const userEmail = localStorage.getItem("userEmail");

    // --- ANIMATION STATE ---
    const [floatingHearts, setFloatingHearts] = useState([]);

    // --- QUICK VIEW & ACTION STATES ---
    const [quickViewItem, setQuickViewItem] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [showChat, setShowChat] = useState(false);

    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem('user_cart');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => { localStorage.setItem('user_cart', JSON.stringify(cartItems)); }, [cartItems]);

    // Generate random properties for the floating hearts on mount
    useEffect(() => {
        const heartsArray = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 5}s`,
            duration: `${10 + Math.random() * 10}s`,
            scale: 0.5 + Math.random() * 1.5,
            rotation: Math.random() * 360
        }));
        setFloatingHearts(heartsArray);
    }, []);

    const fetchWishlist = async () => {
        if (!userEmail) return;
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/wishlist/${userEmail}`);
            if (res.data) setWishlist(res.data);
        } catch (err) {
            console.error("Wishlist fetch error:", err);
        }
    };

    const removeFromWishlist = async (itemId) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/wishlist/${userEmail}/${itemId}`);
            setWishlist(prev => prev.filter(item => item.id !== itemId));
            toast.success("Removed from wishlist");
            if (quickViewItem?.id === itemId) setQuickViewItem(null);
        } catch (err) {
            console.error("Remove failed:", err);
            toast.error("Failed to remove item");
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, [userEmail]);

    const handleAddToCart = (item) => {
        if (!userEmail) return toast.error("Please login first");
        if (cartItems.some(cartItem => cartItem.id === item.id)) {
            setCartItems(prev => prev.filter(i => i.id !== item.id));
            toast.info("Removed from Cart");
        } else {
            setCartItems(prev => [...prev, item]);
            toast.success("Added to Cart! 🛒");
        }
    };

    const handlePaymentSuccess = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/payments/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    item_id: quickViewItem.id,
                    buyer_email: userEmail,
                    payment_id: "COD",
                    status: 'success'
                })
            });

            if (response.ok) {
                toast.success("Item claimed successfully! 🎉");
                setIsPaymentModalOpen(false);
                setQuickViewItem(null);
                setCartItems(prev => prev.filter(i => i.id !== quickViewItem.id));
                removeFromWishlist(quickViewItem.id);
            } else {
                toast.error("Payment verification failed.");
            }
        } catch (error) {
            toast.error("Network error.");
        }
    };

    return (
        <div className="min-h-screen p-6 pt-24 bg-[#05488B] text-white relative overflow-hidden font-sans">

            {/* --- MAGICAL CSS KEYFRAMES --- */}
            <style>{`
                @keyframes floatUp {
                    0% { transform: translateY(100vh) scale(var(--scale)) rotate(var(--start-rot)); opacity: 0; }
                    10% { opacity: 0.6; }
                    90% { opacity: 0.6; }
                    100% { transform: translateY(-20vh) scale(var(--scale)) rotate(calc(var(--start-rot) + 180deg)); opacity: 0; }
                }
                .heart-particle {
                    position: fixed;
                    bottom: -10%;
                    color: #FFC107; 
                    animation: floatUp linear infinite;
                    z-index: 0;
                    pointer-events: none;
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                .wishlist-glowing-rain {
                    position: absolute;
                    top: -10%;
                    background: #FFC107;
                    border-radius: 50%;
                    opacity: 0.3;
                    box-shadow: 0 0 15px 2px #FFC107;
                    animation: rain-fall linear infinite;
                }
                @keyframes rain-fall {
                    to { transform: translateY(110vh); }
                }
            `}</style>

            {/* --- RAIN EFFECT --- */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={`rain-${i}`}
                        className="wishlist-glowing-rain"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDuration: `${3 + Math.random() * 3}s`,
                            animationDelay: `${Math.random() * 5}s`,
                            width: '4px', height: '4px'
                        }}
                    />
                ))}
            </div>

            {/* --- BLOOMING HEARTS BACKGROUND --- */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {floatingHearts.map((heart) => (
                    <div
                        key={heart.id}
                        className="heart-particle drop-shadow-[0_0_15px_rgba(255,193,7,0.6)]"
                        style={{
                            left: heart.left,
                            animationDuration: heart.duration,
                            animationDelay: heart.delay,
                            '--scale': heart.scale,
                            '--start-rot': `${heart.rotation}deg`
                        }}
                    >
                        <Heart size={24} fill="currentColor" />
                    </div>
                ))}
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="relative z-10 max-w-7xl mx-auto">
                <button onClick={() => navigate('/profile')} className="flex items-center gap-2 text-white/60 hover:text-[#FFC107] font-bold text-xs uppercase tracking-widest mb-8 transition-all w-fit">
                    <ArrowLeft size={18} /> Back to Profile
                </button>

                {/* --- 3D HEADER CARD --- */}
                <div className="bg-[#0b213a] rounded-[3rem] p-10 md:p-14 mb-12 shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden border-4 border-[#FFC107]">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                        <div className="text-center md:text-left">
                            <div className="inline-flex items-center gap-2 bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase mb-4 tracking-widest">
                                <Heart size={14} fill="currentColor" /> Saved Collection
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                                Your <span className="text-[#FFC107]">Wishlist.</span>
                            </h1>
                            <p className="text-blue-200 font-medium mt-3 text-sm max-w-sm opacity-60 uppercase tracking-widest">Items you are eyeing on campus.</p>
                        </div>
                        <div className="bg-[#05488B] border-2 border-white/10 px-8 py-4 rounded-[2.5rem] shadow-inner">
                            <span className="text-4xl font-black text-white">{wishlist.length}</span>
                            <span className="ml-2 text-xs font-black text-[#FFC107] uppercase tracking-tighter">Items Saved</span>
                        </div>
                    </div>
                    <Ticket className="absolute -right-10 -top-10 text-white/5 w-64 h-64 rotate-12" />
                </div>

                {wishlist.length === 0 ? (
                    <div className="bg-[#0b213a] border-4 border-dashed border-white/10 p-20 rounded-[3rem] text-center shadow-2xl flex flex-col items-center">
                        <Heart size={80} className="text-[#FFC107]/20 mb-4 animate-pulse" fill="currentColor" />
                        <p className="text-blue-200 font-black text-xl uppercase tracking-widest">Wishlist is empty</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {wishlist.map(item => (
                            <div key={item.id} className="group rounded-[2.5rem] overflow-hidden bg-[#0b213a] border-4 border-white/5 shadow-2xl hover:border-[#FFC107] transition-all duration-300 flex flex-col hover:scale-[1.02] relative">
                                <div className="h-56 bg-[#05488B] flex items-center justify-center overflow-hidden relative border-b-2 border-white/5">
                                    <img src={item.file_url ? `http://127.0.0.1:8000${item.file_url}` : "/placeholder-img.png"} alt="" className="h-full w-full object-cover group-hover:scale-110 transition-all duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b213a] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                        <Heart size={24} className="text-[#FFC107] animate-bounce" fill="currentColor" />
                                    </div>
                                </div>
                                <div className="p-6 flex-grow flex flex-col justify-between relative z-10">
                                    <div>
                                        <h3 className="font-black text-lg text-white line-clamp-1 mb-1 group-hover:text-[#FFC107] transition-colors">{item.title}</h3>
                                        <div className="flex items-center gap-1 text-2xl font-black text-white">
                                            <IndianRupee size={20} className="text-[#FFC107]" />
                                            <span>{item.price}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <button onClick={() => setQuickViewItem(item)} className="flex-1 flex items-center justify-center gap-2 bg-[#05488B] hover:bg-[#FFC107] border border-white/10 hover:border-[#FFC107] text-[#FFC107] hover:text-[#05488B] py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95">
                                            <Eye size={16} /> Details
                                        </button>
                                        <button onClick={() => removeFromWishlist(item.id)} className="p-3 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 rounded-2xl border border-red-500/20 transition-all active:scale-95 shadow-lg">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- QUICK VIEW MODAL OVERLAY --- */}
            {quickViewItem && (
                <div className="fixed inset-0 z-[100] bg-[#0b1120]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    <div className="absolute inset-0" onClick={() => setQuickViewItem(null)}></div>

                    <div className="relative w-full max-w-5xl h-[85vh] max-h-[800px] bg-white rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] flex flex-col md:flex-row animate-in zoom-in-95 duration-300 border-4 border-[#05488B]">

                        {/* Close Button */}
                        <button onClick={() => setQuickViewItem(null)} className="absolute top-6 right-6 z-50 p-3 bg-[#05488B] hover:bg-[#FFC107] rounded-full text-white hover:text-[#05488B] transition-all shadow-xl">
                            <X size={24} strokeWidth={3} />
                        </button>

                        {/* Left Side: Image */}
                        <div className="w-full md:w-1/2 h-[40%] md:h-full bg-slate-100 flex items-center justify-center relative p-8">
                            <img
                                src={quickViewItem.file_url ? `http://127.0.0.1:8000${quickViewItem.file_url}` : "/placeholder-img.png"}
                                alt={quickViewItem.title}
                                className="max-w-full max-h-full object-contain drop-shadow-2xl scale-110"
                            />
                        </div>

                        {/* Right Side: Details & Actions */}
                        <div className="w-full md:w-1/2 h-[60%] md:h-full flex flex-col bg-white overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-8 sm:p-12 no-scrollbar">

                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-4 py-1.5 bg-[#05488B]/10 text-[#05488B] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#05488B]/20">
                                        {quickViewItem.category}
                                    </span>
                                    <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
                                        <Zap size={12} fill="currentColor" /> Live
                                    </span>
                                </div>

                                <h2 className="text-3xl sm:text-4xl font-black text-[#05488B] tracking-tight leading-tight mb-4">
                                    {quickViewItem.title}
                                </h2>

                                <div className="text-4xl font-black text-[#05488B] mb-8 flex items-center gap-1">
                                    <IndianRupee size={28} className="text-[#FFC107]" strokeWidth={3} />
                                    {quickViewItem.price === 0 ? <span className="text-emerald-500">FREE</span> : quickViewItem.price}
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Item Description</h3>
                                    <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 shadow-inner">
                                        {quickViewItem.description || "No description provided."}
                                    </p>
                                </div>

                                {/* Seller Info */}
                                <div className="bg-[#05488B] rounded-[2rem] p-6 text-white flex items-center justify-between shadow-2xl mb-8 border-b-4 border-[#FFC107]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-[#FFC107] text-[#05488B] rounded-2xl flex items-center justify-center font-black text-xl border-2 border-white/20">
                                            {(quickViewItem.owner_name || "S")[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-[#FFC107] uppercase tracking-widest flex items-center gap-1 mb-1">
                                                <ShieldCheck size={12} /> Campus Verified
                                            </p>
                                            <h4 className="text-lg font-black leading-none">{quickViewItem.owner_name || "Campus Student"}</h4>
                                        </div>
                                    </div>
                                    {quickViewItem.owner !== userEmail && (
                                        <button onClick={() => setShowChat(true)} className="w-12 h-12 bg-white/10 hover:bg-[#FFC107] hover:text-[#05488B] text-white rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-90">
                                            <MessageSquare size={20} strokeWidth={2.5} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Sticky Action Footer inside Modal */}
                            {quickViewItem.owner !== userEmail && (
                                <div className="p-8 bg-white border-t-2 border-slate-100 flex gap-4 shrink-0">
                                    <button
                                        onClick={() => handleAddToCart(quickViewItem)}
                                        className={`flex-1 flex items-center justify-center gap-2 rounded-2xl font-black uppercase text-xs tracking-widest transition-all py-5 border-2 ${cartItems.some(i => i.id === quickViewItem.id) ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        <ShoppingCart size={20} /> {cartItems.some(i => i.id === quickViewItem.id) ? "In Bag" : "Add to Bag"}
                                    </button>
                                    <button
                                        onClick={() => setIsPaymentModalOpen(true)}
                                        className="flex-[1.5] bg-[#05488B] hover:bg-[#FFC107] text-white hover:text-[#05488B] rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl transition-all active:scale-95 border-2 border-[#05488B] hover:border-[#FFC107]"
                                    >
                                        Secure Claim
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- SUB-MODALS --- */}
            {quickViewItem && (
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    amount={quickViewItem?.price}
                    itemId={quickViewItem?.id}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            )}

            {showChat && quickViewItem && (
                <div className="fixed inset-0 bg-[#0b1120]/95 backdrop-blur-md z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0" onClick={() => setShowChat(false)} />
                    <div className="relative w-full max-w-2xl h-[80vh] bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 border-4 border-[#05488B]">
                        <div className="p-6 border-b-4 border-[#FFC107] flex justify-between items-center bg-[#05488B]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#FFC107] rounded-xl flex items-center justify-center text-[#05488B] font-black text-xl shadow-lg">
                                    {(quickViewItem.owner_name || "S")[0].toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tight leading-none mb-1">{quickViewItem.owner_name || "Seller"}</h3>
                                    <p className="text-[10px] text-blue-200 font-black uppercase tracking-widest">Market Direct Chat</p>
                                </div>
                            </div>
                            <button onClick={() => setShowChat(false)} className="p-2 text-white hover:bg-white/10 rounded-full transition-all">
                                <X size={32} strokeWidth={3} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden bg-slate-50">
                            <ChatBox currentUserEmail={userEmail} receiverEmail={quickViewItem.owner} itemId={quickViewItem.id} />
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Wishlist;