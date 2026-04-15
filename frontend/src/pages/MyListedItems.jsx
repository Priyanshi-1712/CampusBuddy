import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Trash2, Edit3, ShoppingBag, IndianRupee, Info, Plus, ShieldCheck, Loader2, Zap, Clock, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

// --- SELLER OTP COMPONENT ---
const SellerOTPVerify = ({ orderId, buyerName, onVerified }) => {
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const handleVerify = async () => {
        if (otp.length !== 4) {
            toast.error("Please enter a valid 4-digit OTP");
            return;
        }

        setIsVerifying(true);
        try {
            const res = await axios.post(`http://127.0.0.1:8000/api/marketplace/verify-handover`, {
                order_id: orderId,
                otp_code: otp
            });

            if (res.status === 200) {
                toast.success("Handover Confirmed!");
                onVerified();
            }
        } catch (err) {
            toast.error(err.response?.data?.detail || "Invalid OTP. Please try again.");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="bg-[#05488B] border-2 border-[#FFC107]/50 rounded-[1.5rem] p-4 shadow-inner mt-4 relative z-10">
            <div className="flex items-center gap-3 mb-3">
                <div className="bg-[#FFC107]/20 p-2 rounded-lg text-[#FFC107]">
                    <ShieldCheck size={16} />
                </div>
                <div>
                    <h4 className="font-black text-white text-[10px] uppercase tracking-tighter">Physical Handover</h4>
                    <p className="text-[9px] text-[#FFC107] font-bold uppercase truncate max-w-[120px]">
                        Buyer: {buyerName || 'Verified Buddy'}
                    </p>
                </div>
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    maxLength="4"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="0000"
                    className="w-20 bg-slate-900 border-2 border-white/10 rounded-xl px-2 py-2 text-[#FFC107] font-mono text-center text-sm focus:border-[#FFC107] focus:outline-none transition-all"
                />
                <button
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="flex-1 bg-[#FFC107] hover:bg-yellow-500 disabled:bg-slate-700 text-[#05488B] rounded-xl font-black text-[10px] transition-all flex items-center justify-center gap-2 uppercase border border-[#FFC107]"
                >
                    {isVerifying ? <Loader2 className="animate-spin" size={14} /> : 'Verify OTP'}
                </button>
            </div>
        </div>
    );
};

const MyListedItems = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const userEmail = localStorage.getItem("userEmail");

    const fetchListings = async () => {
        if (!userEmail) return;
        setLoading(true);
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/my-activity/${userEmail}`);
            setItems(res.data.listings || []);
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error("Failed to sync inventory");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, [userEmail]);

    const handleDelete = async (itemId) => {
        if (!window.confirm("Permanent delete? This action cannot be undone.")) return;
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/delete-resource/${itemId}`, { method: 'DELETE' });
            if (res.ok) {
                setItems(items.filter(item => item.id !== itemId));
                toast.success("Listing Removed");
            }
        } catch (err) {
            toast.error("Error deleting item");
        }
    };

    return (
        <div className="min-h-screen bg-[#05488B] p-6 pt-24 pb-12 font-sans transition-colors duration-300 relative overflow-hidden text-white">

            <div className="absolute inset-0 pointer-events-none z-0">
                {[...Array(25)].map((_, i) => (
                    <div
                        key={i}
                        className="inventory-glowing-rain"
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

            <div className="max-w-7xl mx-auto relative z-10">

                <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-2 text-white/60 hover:text-[#FFC107] font-bold text-xs uppercase tracking-widest mb-8 transition-all"
                >
                    <ArrowLeft size={16} /> Back to Profile
                </button>

                <div className="bg-[#0b213a] rounded-[3rem] p-10 mb-12 border-4 border-[#FFC107] shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase mb-4 tracking-widest">
                            <Package size={14} /> Seller Hub
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">
                            My Listed <span className="text-[#FFC107]">Items.</span>
                        </h1>
                        <p className="text-blue-200 font-medium mt-3 uppercase text-xs tracking-widest opacity-60">Management Console • {items.length} Active Listings</p>
                    </div>

                    <button
                        onClick={() => navigate('/post-item')}
                        className="bg-[#FFC107] border-2 border-[#FFC107] hover:bg-white hover:text-[#05488B] px-8 py-4 rounded-2xl text-[#05488B] text-sm font-black shadow-xl transition-all active:scale-95 flex items-center gap-2 uppercase tracking-widest"
                    >
                        <Plus size={20} strokeWidth={3} /> New Listing
                    </button>
                    <Zap className="absolute -right-10 -top-10 text-white/5 w-64 h-64 rotate-12" />
                </div>

                {loading ? (
                    <div className="flex justify-center py-32">
                        <Loader2 className="animate-spin text-[#FFC107]" size={48} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {items.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-32 text-center bg-white/5 rounded-[3rem] border-4 border-dashed border-white/10 shadow-inner">
                                <ShoppingBag size={60} className="text-[#FFC107]/20 mb-4" />
                                <p className="text-blue-200 font-black text-xl uppercase tracking-widest">Inventory Empty</p>
                            </div>
                        ) : (
                            items.map((item) => {
                                // Logic to restrict OTP to physical items only
                                const isPhysical = item.category === "Books" || item.category === "Lab Equipments";
                                const isDigital = item.category === "Notes" || item.category === "Old Papers";

                                return (
                                    <div
                                        key={item.id}
                                        className="rounded-[2.5rem] overflow-hidden bg-[#0b213a] border-4 border-white/5 shadow-2xl flex flex-col group transition-all duration-300 hover:border-[#FFC107] hover:scale-[1.02] relative"
                                    >
                                        <div className="px-6 pt-6 flex justify-between items-center relative z-10">
                                            <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border-2 ${item.status === 'RECEIVED' || item.status === 'SOLD' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                item.status === 'PENDING_HANDOVER' ? 'bg-[#FFC107]/10 text-[#FFC107] border-[#FFC107]/20 animate-pulse' :
                                                    'bg-blue-500/10 text-blue-300 border-blue-500/20'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'RECEIVED' || item.status === 'SOLD' ? 'bg-emerald-400' :
                                                    item.status === 'PENDING_HANDOVER' ? 'bg-[#FFC107]' : 'bg-blue-400'
                                                    }`}></span>
                                                {item.status.replace('_', ' ')}
                                            </div>
                                            <Info size={16} className="text-white/10 group-hover:text-[#FFC107] transition-colors" />
                                        </div>

                                        <div className="p-6 flex flex-col flex-grow relative z-10">
                                            <div className="bg-[#05488B] w-14 h-14 rounded-2xl flex items-center justify-center text-[#FFC107] mb-5 border-2 border-white/10 shadow-lg group-hover:bg-[#FFC107] group-hover:text-[#05488B] transition-all duration-300">
                                                {isDigital ? <FileText size={28} /> : <Package size={28} />}
                                            </div>

                                            <h4 className="font-black text-white text-xl leading-tight mb-2 group-hover:text-[#FFC107] transition-colors">
                                                {item.title}
                                            </h4>
                                            <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-6 opacity-60">
                                                {item.category}
                                            </p>

                                            <div className="mt-auto bg-white/5 p-4 rounded-2xl border-2 border-white/5 flex justify-between items-center shadow-inner group-hover:border-[#FFC107]/30 transition-all">
                                                <span className="text-[10px] font-black text-blue-200 uppercase tracking-tighter">Listed For</span>
                                                <span className="text-2xl font-black text-white flex items-center gap-0.5">
                                                    <IndianRupee size={18} className="text-[#FFC107]" />{item.price}
                                                </span>
                                            </div>

                                            {/* Smart OTP Box: Only shows for physical items in handover status */}
                                            {item.status === 'PENDING_HANDOVER' && isPhysical && (
                                                <SellerOTPVerify
                                                    orderId={item.id}
                                                    buyerName={item.buyer_email?.split('@')[0]}
                                                    onVerified={fetchListings}
                                                />
                                            )}

                                            {/* Digital Note: Informs seller that digital handover is automatic */}
                                            {item.status === 'PENDING_HANDOVER' && isDigital && (
                                                <div className="bg-emerald-500/10 border-2 border-emerald-500/20 p-3 rounded-2xl mt-4 flex items-center gap-2">
                                                    <ShieldCheck className="text-emerald-400" size={14}/>
                                                    <p className="text-[9px] font-black text-emerald-400 uppercase leading-tight">Digital Handover Active (Auto-confirm)</p>
                                                </div>
                                            )}
                                        </div>

                                        {item.status === 'AVAILABLE' && (
                                            <div className="p-6 pt-0 flex gap-3 relative z-10">
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="w-full py-4 bg-red-500/10 text-red-400 border-2 border-red-500/10 rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-lg"
                                                >
                                                    <Trash2 size={16} /> Delete Listing
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .inventory-glowing-rain {
                    position: absolute;
                    top: -10%;
                    background: #FFC107;
                    border-radius: 50%;
                    opacity: 0;
                    box-shadow: 0 0 20px 4px #FFC107, 0 0 40px 8px rgba(255, 193, 7, 0.3);
                    animation: inventory-fall linear infinite;
                }
                @keyframes inventory-fall {
                    0% { transform: translateY(0); opacity: 0; }
                    10% { opacity: 0.9; }
                    50% { opacity: 0.5; }
                    90% { opacity: 0.9; }
                    100% { transform: translateY(115vh); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default MyListedItems;