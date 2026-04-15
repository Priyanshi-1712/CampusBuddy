import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Mail, Package, Car, Heart, ChevronRight, LogOut,
    Ticket, ShoppingCart, BadgeCheck, CalendarDays, Trophy, Star,
    Settings, HelpCircle, Info, RefreshCw, ShieldCheck, Zap, Clock,
    Wallet, ArrowUpRight, TrendingUp, History, Landmark
} from 'lucide-react';

const BACKEND_URL = "http://127.0.0.1:8000";

const Profile = () => {
    const navigate = useNavigate();
    const [isRedeemOpen, setIsRedeemOpen] = useState(false);
    const [bankDetails, setBankDetails] = useState({
        amount: "",
        account_holder: "",
        account_number: "",
        ifsc_code: "",
        bank_name: ""
    });
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const userEmail = storedUser?.college_email || localStorage.getItem("userEmail") || null;

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- VERIFICATION MODAL STATES ---
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [isSubmittingDL, setIsSubmittingDL] = useState(false);
    const [dlData, setDlData] = useState({
        license_no: '', full_name: '', expiry_date: '', vehicle_class: 'LMV', dl_front: null
    });

    const handleRedeem = async () => {
        const response = await fetch("http://127.0.0.1:8000/api/wallet/redeem", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: userData.college_email,
                ...bankDetails,
                amount: parseFloat(bankDetails.amount)
            })
        });

        if (response.ok) {
            toast.success("Redemption Request Sent!");
            setIsRedeemOpen(false);
            // Refresh logic
            window.location.reload();
        } else {
            const error = await response.json();
            toast.error(error.detail || "Redemption Failed");
        }
    };

    const inputStyle = "w-full p-4 rounded-2xl border-2 border-slate-200 focus:border-[#FFC107] focus:ring-4 focus:ring-[#FFC107]/20 outline-none font-bold text-slate-800 bg-white shadow-sm transition-all";

    useEffect(() => {
        if (!userEmail) {
            navigate("/login");
            return;
        }

        setLoading(true);
        setError(null);

        fetch(`${BACKEND_URL}/api/users/me?email=${userEmail}`)
            .then(res => {
                if (!res.ok) throw new Error("User not found");
                return res.json();
            })
            .then(data => setUserData(data))
            .catch(err => setError("User details not found."))
            .finally(() => setLoading(false));

    }, [userEmail, navigate]);

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
            await axios.post(`${BACKEND_URL}/api/users/verify-driver`, submitData);

            toast.success("✅ License Verified Successfully!");
            setUserData(prev => ({ ...prev, is_driver_verified: true, license_no: dlData.license_no.toUpperCase() }));
            setShowVerifyModal(false);
        } catch (err) {
            const errorMsg = err.response?.data?.detail || "Verification failed.";
            toast.error(errorMsg);
        } finally {
            setIsSubmittingDL(false);
        }
    };

    if (loading) return <LoadingScreen />;

    if (error || !userData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#05488B] p-6">
                <div className="bg-[#0b213a] p-8 rounded-[3rem] shadow-xl border-4 border-[#FFC107] text-center max-w-md">
                    <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Info className="text-red-400" size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">Network Error</h2>
                    <p className="text-slate-400 font-bold mb-6">{error || "User data not found"}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center justify-center gap-2 w-full bg-[#FFC107] text-[#05488B] py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white transition-all shadow-lg"
                    >
                        <RefreshCw size={16} /> Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    const profileImage = userData.avatar_url
        ? (userData.avatar_url.startsWith('http')
            ? userData.avatar_url
            : `${BACKEND_URL}${userData.avatar_url.startsWith('/') ? '' : '/'}${userData.avatar_url}`)
        : null;

    const wallet = {
        balance: userData.wallet_balance || 0,
        totalEarned: userData.wallet_total || 0,
        pendingSettlement: userData.wallet_pending || 0,
        commissionRate: "25%"
    };

    return (
        <div className="min-h-screen bg-[#05488B] p-6 pt-24 pb-12 font-sans transition-colors duration-300 relative overflow-hidden">

            {/* --- BIG GLOWING RAIN EFFECT --- */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className="big-glowing-dot"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`,
                            width: `${Math.random() * 10 + 4}px`,
                            height: `${Math.random() * 10 + 4}px`
                        }}
                    />
                ))}
            </div>

            {/* Redeem Modal */}
            {isRedeemOpen && userData && (
                <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-[10001] p-4">
                    <div className="bg-white w-full max-w-sm p-6 rounded-3xl shadow-xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold mb-4 text-[#05488B]">Bank Details</h3>
                        <div className="space-y-3">
                            <input type="number" placeholder="Amount" className="w-full p-2 border rounded-lg" onChange={e => setBankDetails({ ...bankDetails, amount: e.target.value })} />
                            <input type="text" placeholder="Account Holder" className="w-full p-2 border rounded-lg" onChange={e => setBankDetails({ ...bankDetails, account_holder: e.target.value })} />
                            <input type="text" placeholder="Bank Name" className="w-full p-2 border rounded-lg" onChange={e => setBankDetails({ ...bankDetails, bank_name: e.target.value })} />
                            <input type="text" placeholder="Account Number" className="w-full p-2 border rounded-lg" onChange={e => setBankDetails({ ...bankDetails, account_number: e.target.value })} />
                            <input type="text" placeholder="IFSC Code" className="w-full p-2 border rounded-lg" onChange={e => setBankDetails({ ...bankDetails, ifsc_code: e.target.value })} />

                            <div className="flex gap-2 pt-2">
                                <button onClick={() => setIsRedeemOpen(false)} className="flex-1 py-2 text-slate-500 font-bold">Cancel</button>
                                <button onClick={handleRedeem} className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold">Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* --- VERIFICATION MODAL OVERLAY --- */}
            {
                showVerifyModal && (
                    <div className="fixed inset-0 z-[10000] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border-4 border-[#FFC107] animate-in fade-in zoom-in duration-300">
                            <div className="text-center mb-6">
                                <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-[#05488B]/20">
                                    <ShieldCheck size={32} className="text-[#05488B]" />
                                </div>
                                <h2 className="text-2xl font-black text-[#05488B]">Driving License</h2>
                                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-1 text-center">Join the Trusted Driver Network</p>
                            </div>

                            <form onSubmit={handleDlSubmit} className="space-y-4">
                                <input required className={inputStyle} placeholder="License Number" onChange={e => setDlData({ ...dlData, license_no: e.target.value })} />
                                <input required className={inputStyle} placeholder="Full Name on License" onChange={e => setDlData({ ...dlData, full_name: e.target.value })} />

                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <label className="text-[10px] font-black ml-2 text-slate-400 uppercase">Expiry</label>
                                        <input type="date" required className={inputStyle} onChange={e => setDlData({ ...dlData, expiry_date: e.target.value })} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[10px] font-black ml-2 text-slate-400 uppercase">Class</label>
                                        <select className={inputStyle} onChange={e => setDlData({ ...dlData, vehicle_class: e.target.value })}>
                                            <option value="LMV">LMV (Car)</option>
                                            <option value="MCWG">MCWG (Bike)</option>
                                        </select>
                                    </div>
                                </div>

                                <label className="block border-2 border-dashed border-slate-200 p-4 rounded-2xl bg-slate-50 text-center cursor-pointer hover:border-[#05488B] transition-colors">
                                    <span className="text-[10px] font-black text-slate-500 uppercase">{dlData.dl_front ? "✅ Image Selected" : "Upload Front Side of DL"}</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={e => setDlData({ ...dlData, dl_front: e.target.files[0] })} />
                                </label>

                                <button type="submit" disabled={isSubmittingDL} className="w-full bg-[#05488B] text-[#FFC107] p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#04396f] shadow-lg border-2 border-[#05488B]">
                                    {isSubmittingDL ? "Verifying..." : "Verify & Unlock"}
                                </button>
                                <button type="button" onClick={() => setShowVerifyModal(false)} className="w-full text-slate-400 font-bold text-[10px] uppercase mt-2 hover:text-red-500 transition-colors">Cancel</button>
                            </form>
                        </div>
                    </div>
                )
            }

            <div className={`max-w-5xl mx-auto transition-all duration-500 ${showVerifyModal || isRedeemOpen ? 'blur-md scale-[0.98]' : 'blur-0 scale-100'} relative z-10`}>

                {/* --- 3D HEADER --- */}
                <div className="bg-[#0b213a] rounded-[3rem] p-8 mb-8 border-4 border-[#FFC107] shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col md:flex-row items-center gap-8 relative overflow-hidden transition-colors">

                    <div className="w-32 h-40 bg-[#05488B] rounded-2xl overflow-hidden flex items-center justify-center text-[#FFC107] text-5xl font-black shadow-xl border-4 border-[#FFC107]/30 shrink-0">
                        {profileImage ? (
                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${userData.full_name || 'User'}&background=05488B&color=FFC107&bold=true`;
                            }} />
                        ) : (
                            <span className="uppercase text-[#FFC107]">{userData.full_name?.[0] || 'U'}</span>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                            <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                                {userData.full_name || "Buddy"}
                            </h1>
                            <div className="flex items-center gap-1 bg-[#FFC107]/10 text-[#FFC107] px-3 py-1 rounded-full self-center border border-[#FFC107]/30">
                                <BadgeCheck size={14} className="fill-[#FFC107] text-[#05488B]" />
                                <span className="text-[10px] font-black uppercase tracking-wider">Poornima Verified</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4 items-center mb-6">
                            <div className="flex items-center gap-2 text-blue-100 font-bold text-sm">
                                <Mail size={16} className="text-[#FFC107]" /> {userData.college_email || userEmail}
                            </div>
                            <div className="flex items-center gap-2 text-blue-200 font-bold text-sm">
                                <CalendarDays size={16} className="text-[#FFC107]" />
                                Member since {userData.created_at ? new Date(userData.created_at).getFullYear() : '2026'}
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center md:justify-start">
                            <StatBox icon={<Trophy size={16} />} label="Points" value={userData.points || 0} color="bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/30" />
                            <StatBox icon={<Star size={16} />} label="Rating" value="4.9" color="bg-blue-500/10 text-blue-300 border border-blue-400/20" />
                        </div>

                        {userData.is_driver_verified ? (
                            <div className="mt-6 flex items-center gap-3 bg-emerald-500/10 text-emerald-400 p-4 rounded-2xl border border-emerald-500/30 max-w-sm">
                                <BadgeCheck size={20} className="shrink-0" />
                                <div className="text-left">
                                    <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">Status: Verified Driver</p>
                                    <p className="text-sm font-bold opacity-80">License: {userData.license_no}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6 flex items-center justify-between bg-white/5 p-4 rounded-2xl border-2 border-dashed border-white/10 max-w-sm transition-all hover:border-[#FFC107]">
                                <div className="flex items-center gap-3 text-blue-200">
                                    <Car size={20} />
                                    <p className="text-sm font-bold uppercase tracking-tighter">Driver Identity Pending</p>
                                </div>
                                <button onClick={() => setShowVerifyModal(true)} className="text-[10px] font-black uppercase tracking-widest bg-[#FFC107] text-[#05488B] px-3 py-1.5 rounded-lg hover:bg-white transition-all shadow-lg">
                                    Get Verified
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 self-start md:self-center">
                        <button onClick={() => navigate('/settings')} className="p-4 bg-white/5 text-white border-2 border-white/10 rounded-2xl hover:border-[#FFC107] hover:bg-[#FFC107] hover:text-[#05488B] transition-all group">
                            <Settings size={24} className="group-hover:rotate-90 transition-transform duration-500" />
                        </button>
                        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="p-4 bg-red-500/10 text-red-400 border-2 border-red-500/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                            <LogOut size={24} />
                        </button>
                    </div>
                </div>

                {/* --- UNIVERSAL WALLET SECTION (Visible to all users) --- */}
                <div className="mb-8 animate-in fade-in slide-in-from-bottom duration-700">
                    <h2 className="text-xs font-black text-white uppercase tracking-[0.3em] ml-4 mb-4 flex items-center gap-2">
                        <Wallet size={14} className="text-[#FFC107]" /> Buddy Wallet (Earnings & Revenue)
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Wallet Card */}
                        <div className="lg:col-span-2 bg-gradient-to-br from-[#FFC107] to-[#e6ac00] rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group border-4 border-white/20">
                            <Landmark className="absolute -right-10 -bottom-10 text-black/10 rotate-12 group-hover:scale-110 transition-transform duration-700" size={250} />

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <p className="text-[#05488B] font-black text-xs uppercase tracking-widest">Available Balance</p>
                                        <h3 className="text-6xl font-black text-[#05488B] tracking-tighter drop-shadow-sm">₹{wallet.balance.toFixed(2)}</h3>
                                    </div>
                                    <div className="bg-white/30 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                                        <TrendingUp size={32} className="text-[#05488B]" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-[#05488B] p-4 rounded-2xl text-white shadow-lg border border-white/10 flex flex-col justify-center">
                                        <p className="text-[9px] font-black uppercase opacity-60 tracking-wider">Gross Revenue</p>
                                        <p className="text-xl font-black">₹{wallet.totalEarned.toFixed(2)}</p>
                                    </div>

                                    {/* Integrated Redeem Button */}
                                    <button 
                                        onClick={() => setIsRedeemOpen(true)}
                                        className="bg-white p-4 rounded-2xl text-[#05488B] font-black flex flex-col items-center justify-center gap-1 hover:bg-[#0b213a] hover:text-white transition-all shadow-lg group border-2 border-transparent hover:border-[#05488B]"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs uppercase tracking-tighter">Redeem to Bank</span>
                                            <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                        </div>
                                        <p className="text-[8px] opacity-50 uppercase font-bold">Transfer Funds</p>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Settlement Status Card */}
                        <div className="bg-[#0b213a] border-4 border-[#FFC107] rounded-[3rem] p-8 shadow-2xl flex flex-col justify-between text-white relative overflow-hidden">
                            <Zap size={100} className="absolute -right-8 -top-8 text-white/5 -rotate-12" />
                            <div>
                                <div className="flex items-center gap-2 text-[#FFC107] mb-2">
                                    <Clock size={20} className="animate-pulse" />
                                    <p className="font-black text-xs uppercase tracking-widest">Payout Schedule</p>
                                </div>
                                <h4 className="text-3xl font-black mb-1">Today @ 9:00 PM</h4>
                                <p className="text-blue-200 text-[11px] font-bold leading-relaxed opacity-80">
                                    Earnings from rides and marketplace sales are collected here. Transfers are automated nightly for security.
                                </p>
                            </div>

                            <div className="space-y-3 mt-6 relative z-10">
                                <div className="flex justify-between text-xs font-black uppercase tracking-tighter">
                                    <span className="text-slate-400">Next Payout</span>
                                    <span className="text-[#FFC107]">₹{wallet.pendingSettlement.toFixed(2)}</span>
                                </div>
                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className="bg-[#FFC107] h-full shadow-[0_0_15px_#FFC107] transition-all duration-1000"
                                        style={{ width: `${wallet.totalEarned > 0 ? (wallet.pendingSettlement / wallet.totalEarned) * 100 : 0}%` }}
                                    ></div>
                                </div>
                                <button
                                    onClick={() => navigate('/transaction-log')}
                                    className="w-full bg-white/5 text-white border-2 border-white/10 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-[#FFC107] hover:text-[#05488B] hover:border-[#FFC107] transition-all mt-4"
                                >
                                    <History size={14} /> Transaction Log
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- GRID SYSTEM --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-6">
                        <h2 className="text-xs font-black text-white uppercase tracking-[0.3em] ml-4 flex items-center gap-2"><Zap size={14} className="text-[#FFC107] fill-[#FFC107]" /> My Creations</h2>
                        <ProfileCard icon={<Car size={20} />} title="Offered Rides" desc="Rides you are driving" onClick={() => navigate('/my-offered-rides')} />
                        <ProfileCard icon={<Package size={20} />} title="Listed Items" desc="Products you are selling" onClick={() => navigate('/my-listed-items')} />
                        <ProfileCard icon={<Heart size={20} />} title="Wishlist" desc="Saved for later" onClick={() => navigate('/wishlist')} />
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-xs font-black text-white uppercase tracking-[0.3em] ml-4 flex items-center gap-2"><Clock size={14} className="text-[#FFC107]" /> History</h2>
                        <div className="bg-[#0b213a] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group border-4 border-[#FFC107] transition-all min-h-[350px]">
                            <Ticket className="absolute -right-4 -bottom-4 text-white/5 rotate-12" size={150} />
                            <h3 className="text-xl font-black mb-10 uppercase tracking-tighter">Purchase History</h3>
                            <div className="space-y-4 relative z-10">
                                <NestedButton icon={<Car size={18} />} label="Booked Rides" color="text-[#FFC107]" onClick={() => navigate('/my-bookings')} />
                                <NestedButton icon={<ShoppingCart size={18} />} label="Market Orders" color="text-white" onClick={() => navigate('/my-market-orders')} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xs font-black text-white uppercase tracking-[0.3em] ml-4 flex items-center gap-2"><Info size={14} className="text-[#FFC107]" /> Support & Info</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ProfileCard icon={<HelpCircle size={20} />} title="Help Center" desc="FAQs & Support" onClick={() => navigate('/help')} />
                        <ProfileCard icon={<Info size={20} />} title="About Us" desc="Our Mission & Team" onClick={() => navigate('/about')} />
                    </div>
                </div>
            </div>

            <style>{`
                .big-glowing-dot {
                    position: absolute;
                    top: -10%;
                    background: #FFC107;
                    border-radius: 50%;
                    opacity: 0;
                    box-shadow: 0 0 20px 4px #FFC107, 0 0 40px 8px rgba(255, 193, 7, 0.3);
                    animation: fall-glow linear infinite;
                }
                @keyframes fall-glow {
                    0% { transform: translateY(0); opacity: 0; }
                    10% { opacity: 0.8; }
                    50% { opacity: 0.4; }
                    90% { opacity: 0.8; }
                    100% { transform: translateY(110vh); opacity: 0; }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #FFC107; border-radius: 10px; }
            `}</style>
        </div >
    );
};

// --- HELPER COMPONENTS ---
const StatBox = ({ icon, label, value, color }) => (
    <div className={`bg-white/5 border-2 border-white/10 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-inner transition-all hover:border-[#FFC107]`}>
        <div className={`p-2 rounded-lg ${color} relative z-10`}>{icon}</div>
        <div className="relative z-10">
            <p className="text-[9px] font-black text-blue-200 uppercase leading-none mb-1 tracking-widest">{label}</p>
            <p className="text-lg font-black text-white leading-none">{value}</p>
        </div>
    </div>
);

const ProfileCard = ({ icon, title, desc, onClick }) => (
    <button onClick={onClick} className="w-full bg-[#0b213a] p-6 rounded-[2.5rem] border-4 border-white/5 flex items-center justify-between group hover:border-[#FFC107] hover:scale-[1.02] shadow-2xl transition-all duration-300 overflow-hidden relative">
        <div className="flex items-center gap-5 relative z-10">
            <div className="p-4 bg-[#05488B] border border-white/10 rounded-2xl group-hover:bg-[#FFC107] group-hover:text-[#05488B] transition-all duration-300 text-[#FFC107]">
                {icon}
            </div>
            <div className="text-left">
                <h4 className="font-black text-white tracking-tight leading-none mb-1 group-hover:text-[#FFC107] transition-colors">{title}</h4>
                <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest opacity-60 leading-none">{desc}</p>
            </div>
        </div>
        <ChevronRight size={20} className="text-white/20 group-hover:text-[#FFC107] group-hover:translate-x-1 transition-all relative z-10" />
    </button>
);

const NestedButton = ({ icon, label, color, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between p-5 bg-white/5 rounded-2xl border-2 border-white/10 hover:bg-white/10 hover:border-[#FFC107] transition-all group shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
            <div className={`p-3 bg-[#05488B] border border-white/10 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <span className="font-bold text-sm uppercase tracking-widest text-white group-hover:text-[#FFC107]">{label}</span>
        </div>
        <ChevronRight size={18} className="text-white/20 group-hover:text-[#FFC107] group-hover:translate-x-1 transition-all relative z-10" />
    </button>
);

const LoadingScreen = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#05488B] p-6">
        <div className="w-16 h-16 border-4 border-[#FFC107] border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-white font-black tracking-widest uppercase">Loading Buddy Assets...</div>
    </div>
);

export default Profile;