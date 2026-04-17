import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Plus, Book, Info, X, Tag, BookOpen,
    FileText, ShoppingBag, Monitor, Star, Heart,
    ShoppingCart, Trash2, Zap, GraduationCap, Calendar,
    ArrowRight, MessageSquare, User, Share2, ShieldCheck, Clock,
    Download, Lock, MapPin, Settings, Package, AlertTriangle, Pencil,
    IndianRupee 
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

import ChatBox from "../components/ChatBox";
import PaymentModal from "../components/PaymentModal";
import RatingModal from '../components/RatingModal';

const Marketplace = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [editingPriceItem, setEditingPriceItem] = useState(null);
    const [newPriceValue, setNewPriceValue] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [activeTab, setActiveTab] = useState("details");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [purchasedIds, setPurchasedIds] = useState([]);

    const [wishlistIds, setWishlistIds] = useState(() => {
        const saved = localStorage.getItem('user_wishlist');
        return saved ? JSON.parse(saved) : [];
    });

    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem('user_cart');
        return saved ? JSON.parse(saved) : [];
    });

    const user = JSON.parse(localStorage.getItem('user')) || { username: 'Guest', email: '' };
    const currentUserEmail = user.email || localStorage.getItem("userEmail");
    const BACKEND_URL = "https://campus-buddy-05.vercel.app";

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${BACKEND_URL}/api/marketplace/items`);

            if (currentUserEmail) {
                try {
                    const ordersRes = await axios.get(`${BACKEND_URL}/api/my-orders/${currentUserEmail}`);
                    setPurchasedIds(ordersRes.data.map(order => order.id));
                } catch (err) {
                    console.error("Order fetch failed");
                }
            }

            setItems(Array.isArray(res.data) ? res.data : []);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching items:", err);
            toast.error("Unable to load marketplace");
            setLoading(false);
        }
    };

    useEffect(() => { fetchItems(); }, [currentUserEmail]);
    useEffect(() => { localStorage.setItem('user_wishlist', JSON.stringify(wishlistIds)); }, [wishlistIds]);
    useEffect(() => { localStorage.setItem('user_cart', JSON.stringify(cartItems)); }, [cartItems]);

    // --- NEW: REPORT LOGIC ---
    const handleReportItem = async (reportedEmail, itemId) => {
        const reason = prompt("Reason for reporting (e.g., Fake item, Suspicious seller, Spam):");
        if (!reason) return;

        try {
            await axios.post(`${BACKEND_URL}/api/report`, {
                reporter_email: currentUserEmail,
                reported_email: reportedEmail,
                reason: reason,
                category: "Marketplace",
                item_id: itemId
            });
            toast.success("Item reported. Admin will review this listing.");
        } catch (err) {
            console.error("Report failed", err);
            toast.error("Failed to submit report.");
        }
    };

    // --- NEW: AUTO-COVER TEMPLATE LOGIC ---
    const renderItemImage = (item, isModal = false) => {
        const isDigital = item.category === "Notes" || item.category === "Old Papers";

        if (isDigital) {
            const bgColor = item.category === "Notes" ? "bg-gradient-to-br from-emerald-500 to-teal-700" : "bg-gradient-to-br from-orange-500 to-red-700";
            return (
                <div className={`w-full ${isModal ? 'h-64 md:h-full' : 'h-40'} ${bgColor} flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500 rounded-xl shadow-inner`}>
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <Zap size={100} className="absolute -right-5 -bottom-5 rotate-12" />
                    </div>
                    <div className="flex gap-2 items-center">
                        <Package className="text-white/20 mb-2" size={isModal ? 60 : 32} />
                    </div>
                    <h3 className={`text-white font-black ${isModal ? 'text-xl' : 'text-[11px]'} uppercase tracking-tight leading-tight line-clamp-3 px-2`}>
                        {item.title}
                    </h3>
                    <div className="mt-3 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
                        <p className="text-[8px] text-white font-black uppercase tracking-widest">{item.category}</p>
                    </div>
                </div>
            );
        }

        return (
            <img
                src={getImageUrl(item)}
                alt={item.title}
                className={`w-full ${isModal ? 'h-full' : 'h-40'} object-cover group-hover:scale-110 transition-transform duration-500 rounded-xl`}
                onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=No+Preview'; }}
            />
        );
    };

    const handleDownloadOnce = async (item) => {
        if (item.is_downloaded) {
            toast.warning("This file has already been vaulted.");
            return;
        }

        try {
            const res = await axios.get(`${BACKEND_URL}/api/marketplace/download/${item.id}`, {
                params: { user_email: currentUserEmail }
            });
            window.open(`${BACKEND_URL}${res.data.file_url}`, '_blank');
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_downloaded: true } : i));
            toast.success("Download started.");
        } catch (err) {
            toast.error("Download limit reached or file unavailable.");
        }
    };

    const handleShare = (item) => {
        const shareUrl = `${window.location.origin}/item/${item.id}`;
        if (navigator.share) {
            navigator.share({ title: item.title, text: `Check out this ${item.title} on Market Buddy!`, url: shareUrl })
                .catch(() => toast.error("Sharing failed"));
        } else {
            navigator.clipboard.writeText(shareUrl);
            toast.success("Link copied to clipboard!");
        }
    };

    const handleOpenPayment = (item) => {
        const isActuallyFree = parseFloat(item.price) === 0 || !item.price;
        if (isActuallyFree) {
            toast.info("Claiming free asset...");
            handleFinalSuccess(null, item);
        } else {
            setSelectedItem(item);
            setIsPaymentModalOpen(true);
        }
    };

    const handleSuccess = (paymentData) => {
        handleFinalSuccess(paymentData, selectedItem);
    };

    const handleFinalSuccess = async (paymentData, itemOverride = null) => {
        const targetItem = itemOverride || selectedItem;
        try {
            const response = await fetch(`${BACKEND_URL}/api/payments/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    item_id: targetItem.id,
                    buyer_email: currentUserEmail,
                    payment_id: paymentData ? "STRIPE_SUCCESS" : "FREE_CLAIM",
                    status: 'success'
                })
            });

            if (response.ok) {
                toast.success(parseFloat(targetItem.price) === 0 ? "Item claimed for free!" : "Item purchased successfully!");
                setIsPaymentModalOpen(false);
                setSelectedItem(null);
                setCartItems(prev => prev.filter(i => i.id !== targetItem.id));
                fetchItems();
            }
        } catch (error) {
            toast.error("Network error during claim.");
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case "Books": return { icon: <Book size={18} className="text-[#05488B]" />, bg: "bg-[#05488B]/5 border border-[#05488B]/20", text: "text-[#05488B]" };
            case "Lab Equipments": return { icon: <Monitor size={18} className="text-[#05488B]" />, bg: "bg-[#05488B]/5 border border-[#05488B]/20", text: "text-[#05488B]" };
            case "Notes": return { icon: <BookOpen size={18} className="text-[#05488B]" />, bg: "bg-[#05488B]/5 border border-[#05488B]/20", text: "text-[#05488B]" };
            case "Old Papers": return { icon: <FileText size={18} className="text-[#05488B]" />, bg: "bg-[#05488B]/5 border border-[#05488B]/20", text: "text-[#05488B]" };
            default: return { icon: <Tag size={18} className="text-slate-500" />, bg: "bg-slate-50 border border-slate-200", text: "text-slate-600" };
        }
    };

    const getImageUrl = (item) => {
        if (!item) return "https://placehold.co/600x400/f8fafc/94a3b8?text=No+Item";
        const path = item.file_url || item.file_path || item.image || item.item_image;
        if (!path) return "https://placehold.co/600x400/f8fafc/94a3b8?text=No+Image";
        if (path.startsWith('http')) return path;
        return `${BACKEND_URL}/${path.replace(/^\/+/, '')}`;
    };

    const toggleWishlist = async (e, itemId) => {
        if (e) e.stopPropagation();
        if (!currentUserEmail) return toast.error("Please login first");
        const isWishlisted = wishlistIds.includes(itemId);
        try {
            if (isWishlisted) {
                setWishlistIds(prev => prev.filter(id => id !== itemId));
                await axios.delete(`${BACKEND_URL}/api/wishlist/${currentUserEmail}/${itemId}`);
                toast.info("Removed from Wishlist");
            } else {
                setWishlistIds(prev => [...prev, itemId]);
                await axios.post(`${BACKEND_URL}/api/wishlist/add`, { user_email: currentUserEmail, item_id: itemId });
                toast.success("Added to Wishlist!");
            }
        } catch (error) { toast.error("Action failed."); }
    };

    const handleDeleteItem = async (e, itemId) => {
        if (e) e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this listing?")) return;
        try {
            const res = await axios.delete(`${BACKEND_URL}/api/delete-resource/${itemId}`);
            toast.success("Listing removed");
            fetchItems();
        } catch (error) { toast.error("Delete failed"); }
    };

    const handleQuickPriceEdit = async (item) => {
        const newPrice = prompt(`Update price for "${item.title}":`, item.price);

        // Check if user cancelled or entered non-numeric value
        if (newPrice === null || isNaN(newPrice) || newPrice.trim() === "") return;

        try {
            const res = await axios.put(`${BACKEND_URL}/api/marketplace/edit/${item.id}`, {
                price: parseFloat(newPrice)
            });

            if (res.data.status === "success") {
                toast.success("Price updated successfully! 💰");
                fetchItems();
            }
        } catch (err) {
            console.error("Price update failed", err);
            toast.error("Failed to update price.");
        }
    };

    const handleAddToCart = (arg1, arg2) => {
        const e = (arg1 && arg1.stopPropagation) ? arg1 : null;
        const item = (arg1 && arg1.id) ? arg1 : arg2;
        if (e) e.stopPropagation();
        if (!currentUserEmail) return toast.error("Please login first");
        if (item.owner === currentUserEmail) return toast.error("You cannot buy your own item!");
        const alreadyInCart = cartItems.some(cartItem => cartItem.id === item.id);
        if (alreadyInCart) {
            setCartItems(prev => prev.filter(i => i.id !== item.id));
            toast.info("Removed from Cart");
        } else {
            setCartItems(prev => [...prev, item]);
            toast.success("Added to Cart! 🛒");
        }
    };

    const calculateTotal = () => cartItems.reduce((total, item) => total + (parseFloat(item.price) || 0), 0);

    const filteredItems = items.filter(item => {
        const isAlreadyPurchasedByMe = purchasedIds.includes(item.id);
        if (isAlreadyPurchasedByMe) return false;
        const title = item.title || "";
        const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === "All" || item.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = [
        { name: "All", icon: <Tag size={16} /> },
        { name: "Books", icon: <Book size={16} /> },
        { name: "Lab Equipments", icon: <Monitor size={16} /> },
        { name: "Notes", icon: <BookOpen size={16} /> },
        { name: "Old Papers", icon: <FileText size={16} /> }
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] premium-bg-pattern pt-24 pb-32 px-4 md:px-8 font-sans text-slate-900">
            {selectedItem && (
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    amount={selectedItem.price}
                    itemId={selectedItem.id}
                    onPaymentSuccess={handleSuccess}
                />
            )}

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="relative overflow-hidden bg-[#05488B] border border-[#04396f] rounded-[2rem] p-8 md:p-12 mb-10 shadow-xl">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/30 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
                                <Zap size={14} fill="currentColor" /> CAMPUS TRADE
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Market <span className="text-[#FFC107]">Buddy.</span></h1>
                            <p className="font-bold text-blue-50 text-lg leading-snug">
                                <span className="italic text-[#FFC107]">“By Students, For Students”</span>
                                <br />
                                <span className="text-blue-200 mt-1 inline-block text-sm font-medium uppercase">- A Network for Smarter Learning.</span>
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={() => setIsCartOpen(true)} className="relative group bg-[#05488B] border border-[#FFC107] hover:bg-[#04396f] text-[#FFC107] px-8 py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3">
                                <ShoppingCart size={20} strokeWidth={2} />
                                <span className="font-medium text-lg tracking-wide">View Cart</span>
                                {cartItems.length > 0 && (
                                    <span className="absolute -top-3 -right-3 bg-[#FFC107] text-[#05488B] text-[11px] font-black w-7 h-7 flex items-center justify-center rounded-full border-2 border-[#05488B] shadow-md">
                                        {cartItems.length}
                                    </span>
                                )}
                            </button>
                            <button onClick={() => navigate('/post-item')} className="group bg-[#FFC107] border border-[#FFC107] hover:bg-[#e0a800] text-[#05488B] px-8 py-3.5 rounded-xl flex items-center justify-center gap-3 shadow-xl transition-all">
                                <span className="font-medium text-lg tracking-wide">Sell Something</span>
                                <Plus size={20} strokeWidth={2} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row items-center gap-6 mb-12 w-full">
                    <div className="relative w-full lg:w-[400px] shrink-0">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#05488B]" size={20} strokeWidth={2} />
                        <input
                            placeholder="Search listings..."
                            className="w-full bg-white py-3.5 pl-14 pr-6 rounded-2xl shadow-sm border border-slate-300 outline-none focus:ring-2 focus:ring-[#05488B]/20 focus:border-[#05488B] text-[#05488B] font-medium"
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 w-full">
                        {categories.map((cat) => (
                            <button
                                key={cat.name}
                                onClick={() => setActiveCategory(cat.name)}
                                className={`flex items-center gap-2 px-5 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all border-2 shrink-0 ${activeCategory === cat.name ? "bg-[#05488B] text-[#FFC107] border-[#05488B] shadow-sm" : "bg-white text-[#05488B] border border-[#05488B] hover:bg-[#FFC107] hover:text-[#05488B]"}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map((item) => {
                        const categoryStyle = getCategoryIcon(item.category);
                        const isInCart = cartItems.some(i => i.id === item.id);
                        const isMyItem = item.owner === currentUserEmail;
                        return (
                            <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border-2 border-slate-200 flex flex-col hover:shadow-xl hover:border-[#FFC107] transition-all duration-300 relative h-[420px] group overflow-hidden">

                                {/* Image / Cover Holder */}
                                <div className="relative mb-4 overflow-hidden rounded-xl">
                                    {renderItemImage(item)}

                                    {/* Action Overlays */}
                                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {isMyItem ? (
                                            <>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingPriceItem(item);
                                                        setNewPriceValue(item.price);
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-[#05488B] shadow-lg border border-slate-100 hover:bg-[#FFC107] transition-all group"
                                                >
                                                    <Pencil size={14} />
                                                </button>

                                                <button onClick={(e) => handleDeleteItem(e, item.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-red-500 shadow-lg border border-slate-100 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={(e) => toggleWishlist(e, item.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-pink-500 shadow-lg border border-slate-100 hover:bg-pink-50 transition-all"><Heart size={14} className={wishlistIds.includes(item.id) ? "fill-current" : ""} /></button>
                                                {/* REPORT BUTTON ADDED HERE */}
                                                <button onClick={(e) => { e.stopPropagation(); handleReportItem(item.owner, item.id); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-orange-500 shadow-lg border border-slate-100 hover:bg-orange-500 hover:text-white transition-all" title="Report suspicious listing"><AlertTriangle size={14} /></button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col flex-1 px-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${categoryStyle.bg} ${categoryStyle.text}`}>{item.category}</span>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-[#FFC107]"><Star size={10} fill="currentColor" /> {item.avg_rating || "5.0"}</div>
                                    </div>

                                    <h3 className="text-lg font-black text-slate-900 mb-1 line-clamp-2 leading-tight group-hover:text-[#05488B] transition-colors">{item.title}</h3>

                                    <div className="flex items-center gap-1.5 mb-3 opacity-60">
                                        <User size={10} />
                                        <span className="text-[10px] font-bold uppercase truncate">{item.owner_name || "Campus Seller"}</span>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-slate-50">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Student Price</p>
                                        <div className="text-2xl font-black text-[#05488B] tracking-tight">{item.price === 0 || !item.price ? <span className="text-emerald-500">FREE</span> : `₹${item.price}`}</div>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => { setSelectedItem(item); setActiveTab("details"); }} className="flex-1 bg-slate-900 text-white hover:bg-[#05488B] rounded-xl font-bold text-[10px] uppercase tracking-widest py-3 transition-all">Details</button>
                                    {!isMyItem && (
                                        <button onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }} className={`w-11 flex items-center justify-center rounded-xl transition-all border-2 ${isInCart ? "bg-[#FFC107] text-[#05488B] border-[#FFC107]" : "bg-white text-slate-400 border-slate-100 hover:border-[#FFC107] hover:text-[#05488B]"}`}><ShoppingCart size={18} className={isInCart ? "fill-current" : ""} /></button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Selected Item Modal */}
            {selectedItem && !isPaymentModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border-2 border-[#05488B]">
                        <div className="w-full md:w-5/12 bg-slate-50 flex flex-col items-center justify-center p-8 border-r border-slate-200 relative">
                            <button onClick={() => setSelectedItem(null)} className="md:hidden absolute top-6 right-6 p-2 bg-white rounded-full shadow-sm border border-slate-200 z-10 text-slate-500"><X size={20} /></button>
                            <div className="relative group w-full h-full flex items-center justify-center">
                                {renderItemImage(selectedItem, true)}
                            </div>
                        </div>

                        <div className="w-full md:w-7/12 flex flex-col bg-white overflow-hidden relative">
                            <div className="absolute top-6 right-6 z-10 hidden md:flex gap-3">
                                <button onClick={() => handleShare(selectedItem)} className="p-2.5 bg-white border border-slate-200 hover:border-[#05488B] hover:text-[#05488B] rounded-full transition-all shadow-sm group" title="Share link"><Share2 size={16} /></button>
                                {/* REPORT BUTTON ADDED IN MODAL AS WELL */}
                                {selectedItem.owner !== currentUserEmail && (
                                    <button onClick={() => handleReportItem(selectedItem.owner, selectedItem.id)} className="p-2.5 bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-500 rounded-full transition-all shadow-sm group" title="Report listing"><AlertTriangle size={16} /></button>
                                )}
                                <button onClick={() => setSelectedItem(null)} className="p-2.5 bg-white border border-slate-200 hover:border-red-400 hover:text-red-500 rounded-full transition-all shadow-sm"><X size={16} strokeWidth={3} /></button>
                            </div>

                            <div className="p-8 pb-4">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getCategoryIcon(selectedItem.category).bg} ${getCategoryIcon(selectedItem.category).text}`}>
                                    {selectedItem.category}
                                </span>
                                <h2 className="text-2xl font-black text-slate-900 mt-4 leading-tight tracking-tight">{selectedItem.title}</h2>
                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-[#05488B]">₹{selectedItem.price || "0"}</span>
                                    <span className="text-slate-400 text-xs font-medium">Student-to-student price</span>
                                </div>
                            </div>

                            <div className="flex gap-6 px-8 border-b border-slate-100">
                                {["details", "reviews", "chat"].map((tab) => (
                                    <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 font-bold text-xs uppercase tracking-wider relative transition-all ${activeTab === tab ? "text-[#05488B]" : "text-slate-400 hover:text-slate-600"}`}>
                                        {tab} {activeTab === tab && <motion.div layoutId="modalTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFC107]" />}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-grow overflow-y-auto p-8 bg-slate-50/30">
                                {activeTab === "details" && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#05488B] border border-blue-100 shrink-0"><GraduationCap size={18} /></div>
                                                <div className="min-w-0"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Course</span><p className="font-bold text-slate-800 text-sm truncate">{selectedItem.course || "General"}</p></div>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#05488B] border border-blue-100 shrink-0"><Calendar size={18} /></div>
                                                <div className="min-w-0"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Semester</span><p className="font-bold text-slate-800 text-sm">{selectedItem.semester || "N/A"}</p></div>
                                            </div>
                                        </div>
                                        <div className="bg-[#05488B] p-5 rounded-2xl text-white flex items-center gap-4 shadow-md relative overflow-hidden group">
                                            <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:scale-110 transition-transform"><ShieldCheck size={80} /></div>
                                            <div className="h-12 w-12 bg-[#FFC107] rounded-xl flex items-center justify-center text-[#05488B] font-black text-xl shrink-0">
                                                {selectedItem.owner_name ? selectedItem.owner_name[0] : 'C'}
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5"><span className="text-[9px] font-black text-blue-200 uppercase tracking-widest">Verified Seller</span><ShieldCheck size={12} className="text-[#FFC107]" /></div>
                                                <span className="font-black text-lg">{selectedItem.owner_name || "Campus Student"}</span>
                                            </div>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#FFC107]"></div>
                                            <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Product Description</h4>
                                            <p className="text-slate-600 leading-relaxed text-sm font-normal">{selectedItem.description}</p>
                                        </div>
                                    </div>
                                )}
                                {activeTab === "reviews" && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-8">
                                            <div className="text-center">
                                                <h3 className="text-5xl font-black text-[#05488B] leading-none">{selectedItem.avg_rating?.toFixed(1) || "0.0"}</h3>
                                                <div className="flex justify-center mt-2">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <Star key={s} size={14} className={s <= selectedItem.avg_rating ? "text-[#FFC107] fill-current" : "text-slate-200"} />
                                                    ))}
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">{selectedItem.review_count} Verified Reviews</p>
                                            </div>
                                            <div className="flex-grow space-y-2">
                                                {[5, 4, 3, 2, 1].map((star) => {
                                                    const count = selectedItem.reviews?.filter(r => r.rating === star).length || 0;
                                                    const percent = selectedItem.review_count > 0 ? (count / selectedItem.review_count) * 100 : 0;
                                                    return (
                                                        <div key={star} className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                                            <span className="w-3">{star}</span>
                                                            <div className="flex-grow h-2 bg-slate-100 rounded-full overflow-hidden">
                                                                <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} className="h-full bg-[#FFC107]" />
                                                            </div>
                                                            <span className="w-8 text-right opacity-40">{count}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            {(!selectedItem.reviews || selectedItem.reviews.length === 0) ? (
                                                <div className="text-center py-12 opacity-40">
                                                    <MessageSquare size={40} className="mx-auto mb-3 text-slate-300" />
                                                    <p className="font-bold uppercase text-xs tracking-widest">No detailed feedback yet</p>
                                                </div>
                                            ) : (
                                                selectedItem.reviews.map((rev) => (
                                                    <div key={rev.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-[#FFC107]/30 transition-all">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden">
                                                                    <img src={rev.user_avatar ? `${BACKEND_URL}${rev.user_avatar}` : "/default-avatar.png"} className="w-full h-full object-cover" alt="" />
                                                                </div>
                                                                <div>
                                                                    <h5 className="text-sm font-black text-slate-800 leading-tight">{rev.user_name}</h5>
                                                                    <div className="flex gap-0.5 mt-0.5">
                                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                                            <Star key={s} size={10} className={s <= rev.rating ? "text-[#FFC107] fill-current" : "text-slate-200"} />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <span className="text-[9px] font-bold text-slate-300 uppercase">{new Date(rev.date).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-slate-600 text-sm leading-relaxed italic">"{rev.comment}"</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                                {activeTab === "chat" && <div className="h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"><ChatBox currentUserEmail={currentUserEmail} receiverEmail={selectedItem.owner} itemId={selectedItem.id} /></div>}
                            </div>

                            <div className="p-6 bg-white border-t border-slate-100 flex gap-4">
                                {selectedItem.owner === currentUserEmail ? (
                                    <button onClick={(e) => handleDeleteItem(e, selectedItem.id)} className="w-full bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 hover:text-white py-3.5 rounded-xl font-black uppercase text-xs tracking-widest transition-all">Remove Listing</button>
                                ) : (
                                    <>
                                        <button onClick={() => handleAddToCart(selectedItem)} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all border-2 font-black text-xs uppercase tracking-widest ${cartItems.some(i => i.id === selectedItem.id) ? "bg-[#05488B] text-[#FFC107] border-[#05488B]" : "bg-white text-slate-700 border-slate-200 hover:border-[#05488B] hover:text-[#05488B]"}`}>
                                            <ShoppingCart size={18} /> {cartItems.some(i => i.id === selectedItem.id) ? "In Bag" : "Add to Bag"}
                                        </button>

                                        <button onClick={() => handleOpenPayment(selectedItem)} className="flex-[1.5] bg-[#FFC107] border-2 border-[#FFC107] hover:bg-[#e0a800] hover:border-[#e0a800] text-[#05488B] py-3.5 rounded-xl font-black text-sm shadow-lg shadow-[#FFC107]/20 transition-all flex items-center justify-center gap-2">
                                            Claim Now <ArrowRight size={18} />
                                        </button>
                                    </>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {isCartOpen && (
                    <div className="fixed inset-0 z-[200] flex justify-end">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
                            <div className="p-6 bg-[#05488B] text-white flex items-center justify-between border-b-4 border-[#FFC107]">
                                <div className="flex items-center gap-3"><ShoppingCart className="text-[#FFC107]" size={24} /><h2 className="text-xl font-black uppercase tracking-tight">Your Cart</h2></div>
                                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} strokeWidth={3} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                                {cartItems.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                        <ShoppingBag size={64} className="mb-4 text-[#05488B]" />
                                        <p className="font-bold uppercase tracking-widest text-sm">Cart is empty</p>
                                    </div>
                                ) : (
                                    cartItems.map((item) => (
                                        <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex gap-4 shadow-sm group relative overflow-hidden">
                                            <div className="w-16 h-16 rounded-xl bg-slate-100 shrink-0 overflow-hidden border border-slate-200">
                                                {renderItemImage(item)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`font-bold text-[#05488B] truncate ${item.is_downloaded ? 'opacity-30' : ''}`}>{item.title}</h4>
                                                <p className="text-xs font-black text-slate-400">₹{item.price} • <span className="text-[#FFC107] uppercase font-bold text-[9px]">Verified</span></p>

                                                {(item.category === "Notes" || item.category === "Old Papers") && (
                                                    <button
                                                        onClick={() => handleDownloadOnce(item)}
                                                        disabled={item.is_downloaded}
                                                        className={`mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${item.is_downloaded ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#FFC107] text-[#05488B] hover:bg-white border border-[#FFC107]'}`}
                                                    >
                                                        {item.is_downloaded ? <><Lock size={10} /> VAULTED</> : <><Download size={10} /> DOWNLOAD ONCE</>}
                                                    </button>
                                                )}
                                            </div>
                                            <button onClick={() => handleAddToCart(item)} className="p-2 text-slate-300 hover:text-red-500 transition-colors self-start"><Trash2 size={18} /></button>
                                            {item.is_downloaded && <div className="absolute inset-0 bg-white/40 pointer-events-none"></div>}
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-6 bg-white border-t-2 border-slate-100">
                                <div className="flex justify-between items-center mb-6"><span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Total Amount</span><span className="text-2xl font-black text-[#05488B]">₹{calculateTotal()}</span></div>
                                <button disabled={cartItems.length === 0} onClick={() => handleOpenPayment(cartItems[0])} className="w-full bg-[#05488B] text-[#FFC107] py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50">Checkout Now</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {editingPriceItem && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl border-b-8 border-[#FFC107]"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-[#05488B]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <IndianRupee size={30} className="text-[#05488B]" />
                                </div>
                                <h2 className="text-xl font-black text-[#05488B] uppercase tracking-tight">Update Price</h2>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">{editingPriceItem.title}</p>
                            </div>

                            <div className="relative mb-6">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-[#05488B]">₹</span>
                                <input
                                    type="number"
                                    value={newPriceValue}
                                    onChange={(e) => setNewPriceValue(e.target.value)}
                                    autoFocus
                                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-10 rounded-2xl outline-none focus:border-[#05488B] font-black text-xl text-[#05488B] transition-all"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setEditingPriceItem(null)}
                                    className="flex-1 py-4 rounded-xl font-black uppercase text-[10px] text-slate-400 hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            await axios.put(`${BACKEND_URL}/api/marketplace/edit/${editingPriceItem.id}`, {
                                                price: parseFloat(newPriceValue)
                                            });
                                            toast.success("Price Updated!");
                                            setEditingPriceItem(null);
                                            fetchItems();
                                        } catch (err) {
                                            toast.error("Update Failed");
                                        }
                                    }}
                                    className="flex-1 bg-[#05488B] text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`.premium-bg-pattern { background-image: radial-gradient(#cbd5e1 1px, transparent 1px); background-size: 24px 24px; }`}</style>
        </div>
    );
};

export default Marketplace;