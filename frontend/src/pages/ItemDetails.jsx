import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    User, ArrowLeft, Clock, MapPin, CheckCircle2,
    AlertCircle, ShieldCheck, XCircle, Mail, Zap, IndianRupee, Package, Trash2
} from 'lucide-react';

const ItemDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const currentUserEmail = localStorage.getItem("userEmail");

    useEffect(() => {
        fetchItemDetails();
    }, [id]);

    const fetchItemDetails = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/marketplace/item/${id}`);
            if (!res.ok) throw new Error("Item not found");
            const data = await res.json();
            setItem(data);
        } catch (err) {
            toast.error("Could not load item details.");
            navigate('/marketplace');
        } finally {
            setLoading(false);
        }
    };

    const handleClaimAction = async (action) => {
        try {
            // action will be 'approve' or 'reject'
            const res = await fetch(`http://127.0.0.1:8000/api/marketplace/claim-action/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, seller_email: currentUserEmail })
            });

            if (res.ok) {
                toast.success(`Claim ${action}ed successfully!`);
                fetchItemDetails(); // Refresh UI
            } else {
                toast.error("Failed to update claim status");
            }
        } catch (err) {
            toast.error("Connection error");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
            <div className="w-16 h-16 border-4 border-[#05488B] border-t-[#FFC107] rounded-full animate-spin mb-4"></div>
            <div className="font-black text-[#05488B] tracking-widest animate-pulse uppercase text-xs">Authenticating Vault...</div>
        </div>
    );

    if (!item) return null;

    const isOwner = item.owner === currentUserEmail;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-12 px-4 font-sans transition-colors duration-300">
            <div className="max-w-5xl mx-auto">

                {/* --- NAVIGATION --- */}
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-[#05488B] font-black mb-8 transition-all group uppercase text-xs tracking-widest">
                    <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover:bg-blue-50 border border-slate-100 group-hover:border-blue-200">
                        <ArrowLeft size={18} />
                    </div>
                    Back to Marketplace
                </button>

                {/* --- HEADER BANNER (Institutional Theme) --- */}
                <div className="bg-[#05488B] rounded-[2.5rem] p-10 mb-10 shadow-2xl relative overflow-hidden text-white border-b-8 border-[#FFC107]">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-[#FFC107] px-4 py-1.5 rounded-full text-[10px] font-black uppercase mb-4 tracking-widest border border-[#FFC107]/20">
                                <Zap size={14} className="fill-[#FFC107]" /> Product Showcase
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none mb-3">Item <span className="text-[#FFC107]">Details.</span></h1>
                            <p className="text-blue-100 font-medium text-sm opacity-80 flex items-center justify-center md:justify-start gap-2">
                                <Package size={16} /> Campus Asset Management System
                            </p>
                        </div>
                        <div className="hidden lg:block bg-white/5 p-6 rounded-[2.5rem] border border-white/10 shadow-inner">
                            <Clock size={48} className="text-[#FFC107] opacity-40" />
                        </div>
                    </div>
                    <Zap className="absolute -right-10 -bottom-10 text-white/5 w-64 h-64 rotate-12" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* --- LEFT SIDE: PRODUCT CONTENT --- */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 relative">
                            <div className="flex flex-wrap items-center gap-4 mb-8">
                                <span className="bg-[#05488B] text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/20">
                                    {item.category}
                                </span>
                                <span className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-tighter">
                                    <Clock size={16} className="text-[#FFC107]" /> Active Listing
                                </span>
                            </div>

                            <h2 className="text-4xl font-black text-slate-900 mb-8 leading-tight tracking-tight">{item.title}</h2>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <FileUp size={16} className="text-[#05488B]" />
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Specifications</h4>
                                </div>
                                <div className="text-slate-600 text-lg leading-relaxed bg-[#F8FAFC] p-8 rounded-[2rem] border-2 border-slate-50 shadow-inner italic">
                                    "{item.description || "The owner has not provided a detailed description for this campus asset."}"
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT SIDE: 3D ACTION CENTER --- */}
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden relative group">
                            {/* Visual Polish */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full -mr-20 -mt-20 z-0 transition-transform group-hover:scale-110"></div>

                            <div className="relative z-10">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 pl-1">Appraised Value</div>
                                <div className="flex items-center text-5xl font-black text-[#05488B] mb-10 drop-shadow-sm">
                                    <IndianRupee size={32} className="text-[#FFC107]" strokeWidth={3} />
                                    <span>{item.price === 0 || item.price === "0" ? "FREE" : item.price}</span>
                                </div>

                                {isOwner ? (
                                    <div className="space-y-6">
                                        <div className="p-6 bg-[#05488B] rounded-[2rem] text-white shadow-xl border-b-4 border-black/20 relative overflow-hidden">
                                            <div className="flex items-center gap-3 mb-2 relative z-10">
                                                <div className="bg-[#FFC107] p-2 rounded-lg text-[#05488B]">
                                                    <ShieldCheck size={18} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest">Ownership Terminal</span>
                                            </div>
                                            <p className="text-xs text-blue-100 opacity-80 leading-relaxed relative z-10 font-medium">This is your listing. Use the tools below to manage seeker requests.</p>
                                            <Zap className="absolute -right-4 -bottom-4 text-white/10 w-20 h-20" />
                                        </div>

                                        {/* OWNER CLAIM CONTROL */}
                                        {item.is_claimed ? (
                                            <div className="bg-yellow-50 border-4 border-[#FFC107]/30 p-6 rounded-[2.5rem] animate-in zoom-in-95 duration-300 shadow-xl">
                                                <div className="flex items-center gap-2 text-[#05488B] font-black text-[11px] uppercase tracking-widest mb-4">
                                                    <AlertCircle size={18} /> Claim Pending
                                                </div>
                                                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl mb-6 border border-yellow-200">
                                                    <div className="w-12 h-12 bg-[#05488B] rounded-xl flex items-center justify-center text-[#FFC107] font-black text-xl">
                                                        {item.claimed_by?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Seeker Email</p>
                                                        <p className="text-sm font-bold truncate text-[#05488B]">{item.claimed_by}</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        onClick={() => handleClaimAction('approve')}
                                                        className="bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                                    >
                                                        <CheckCircle2 size={16} /> Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => handleClaimAction('reject')}
                                                        className="bg-white hover:bg-red-50 text-red-600 border-2 border-red-100 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                                                    >
                                                        <XCircle size={16} /> Deny
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-10 px-6 border-4 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50">
                                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm">
                                                    <User size={32} />
                                                </div>
                                                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest leading-relaxed">System awaiting seeker interaction...</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* --- BUYER ACTION BLOCK --- */
                                    <div className="space-y-4">
                                        <button
                                            disabled={item.is_claimed}
                                            className={`w-full py-6 rounded-[1.8rem] font-black text-sm uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-3 border-b-4 ${item.is_claimed
                                                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                                    : "bg-[#05488B] hover:bg-[#043a70] text-white border-blue-950"
                                                }`}
                                        >
                                            {item.is_claimed ? <XCircle size={20} /> : <Zap size={20} className="fill-[#FFC107] text-[#FFC107]" />}
                                            {item.is_claimed ? "Item Unavailable" : "Initiate Claim"}
                                        </button>

                                        <div className="grid grid-cols-1 gap-4">
                                            <button className="w-full bg-white border-2 border-slate-100 hover:border-[#FFC107] hover:bg-yellow-50/30 text-slate-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95">
                                                <Mail size={18} className="text-[#05488B]" /> Direct Contact
                                            </button>
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#05488B] border border-slate-200 shadow-sm">
                                                    <MapPin size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Pickup Zone</p>
                                                    <p className="text-xs font-bold text-slate-700 uppercase tracking-tighter">{item.meetup_location || "Campus Central"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SECURITY FOOTER */}
                        <div className="p-6 bg-[#FFC107]/10 border-2 border-[#FFC107]/20 rounded-[2rem] flex items-start gap-4">
                            <ShieldCheck className="text-[#05488B] shrink-0" size={24} />
                            <div>
                                <h5 className="text-[10px] font-black text-[#05488B] uppercase tracking-widest mb-1">Buddy Security</h5>
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">All transactions require in-person verification via OTP for total seeker safety.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ItemDetail;