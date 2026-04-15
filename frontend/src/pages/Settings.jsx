import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft, User, Bell, Smartphone,
    Trash2, ChevronRight, Lock, Save, X, Camera, Zap, Mail, Phone
} from 'lucide-react';
import { toast } from 'react-toastify';

const Settings = () => {
    const navigate = useNavigate();

    // --- STATE MANAGEMENT ---
    const [view, setView] = useState('menu');
    const [notifications, setNotifications] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    // --- USER DATA STATE ---
    const [profileData, setProfileData] = useState({
        full_name: localStorage.getItem('userName') || '',
        email: localStorage.getItem('userEmail') || '',
        phone_number: '',
        last_updated: localStorage.getItem('profile_last_updated') || null
    });

    // --- 30 DAY LIMIT LOGIC ---
    const getDaysRemaining = () => {
        if (!profileData.last_updated) return 0;
        const lastDate = new Date(profileData.last_updated);
        const nextUpdateDate = new Date(lastDate);
        nextUpdateDate.setDate(lastDate.getDate() + 30);

        const today = new Date();
        const diffTime = nextUpdateDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const daysRemaining = getDaysRemaining();
    const isLocked = daysRemaining > 0;

    // --- FETCH CURRENT PROFILE FROM DB ---
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/users/me?email=${profileData.email}`);
                const data = await res.json();
                if (res.ok) {
                    setProfileData(prev => ({
                        ...prev,
                        full_name: data.full_name,
                        phone_number: data.phone_number || '',
                    }));
                }
            } catch (err) { console.error("Fetch failed"); }
        };
        if (profileData.email) fetchProfile();
    }, [profileData.email]);

    // --- SAVE CHANGES LOGIC ---
    const handleUpdateProfile = async () => {
        if (isLocked) return toast.error(`Profile locked. Wait ${daysRemaining} more days.`);

        setLoading(true);
        try {
            // Logic to update backend would go here
            const now = new Date().toISOString();
            localStorage.setItem('profile_last_updated', now);
            localStorage.setItem('userName', profileData.full_name);
            setProfileData(prev => ({ ...prev, last_updated: now }));

            toast.success("Profile updated! Locked for next 30 days.");
            setView('menu');
        } catch (err) {
            toast.error("Update failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleTerminateAccount = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/auth/terminate-account?email=${profileData.email}`, { method: 'DELETE' });
            if (res.ok) {
                localStorage.clear();
                toast.success("Account Terminated.");
                navigate('/login');
            }
        } catch (err) { toast.error("Termination failed."); }
    };

    // --- FORM RENDERING LOGIC ---
    const renderEditProfile = () => (
        <div className="bg-[#0b213a] rounded-[2.5rem] border-4 border-[#FFC107] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.4)] animate-in zoom-in-95 duration-300 relative overflow-hidden">
            <div className="flex flex-col items-center mb-8 relative z-10">
                <div className="relative">
                    <div className="h-24 w-24 bg-[#05488B] rounded-[2rem] flex items-center justify-center text-[#FFC107] text-4xl font-black border-2 border-white/10 shadow-xl uppercase">
                        {profileData.full_name[0]}
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-2.5 bg-[#FFC107] text-[#05488B] rounded-xl border-4 border-[#0b213a] shadow-lg hover:scale-110 transition-transform">
                        <Camera size={18} strokeWidth={3} />
                    </button>
                </div>
                {isLocked && (
                    <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase px-4 py-1.5 rounded-full tracking-widest">
                        Updates Locked: {daysRemaining} Days Left
                    </div>
                )}
            </div>

            <div className="space-y-5 relative z-10">
                <div>
                    <label className="text-[10px] font-black text-[#FFC107] uppercase ml-4 mb-2 block tracking-widest flex items-center gap-2">
                        <User size={12} /> Display Name
                    </label>
                    <input
                        disabled={isLocked}
                        type="text"
                        value={profileData.full_name}
                        onChange={e => setProfileData({ ...profileData, full_name: e.target.value })}
                        className={`input-style-settings ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                </div>
                <div>
                    <label className="text-[10px] font-black text-[#FFC107] uppercase ml-4 mb-2 block tracking-widest flex items-center gap-2">
                        <Mail size={12} /> Registered Email
                    </label>
                    <input disabled type="text" value={profileData.email} className="input-style-settings opacity-40 cursor-not-allowed" />
                </div>
                <div>
                    <label className="text-[10px] font-black text-[#FFC107] uppercase ml-4 mb-2 block tracking-widest flex items-center gap-2">
                        <Phone size={12} /> Phone Number
                    </label>
                    <input
                        disabled={isLocked}
                        type="text"
                        value={profileData.phone_number}
                        onChange={e => setProfileData({ ...profileData, phone_number: e.target.value })}
                        className={`input-style-settings ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                </div>
            </div>

            <div className="flex gap-4 mt-10 relative z-10">
                <button onClick={() => setView('menu')} className="flex-1 p-4 bg-white/5 text-white/50 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">Cancel</button>
                <button
                    disabled={isLocked || loading}
                    onClick={handleUpdateProfile}
                    className={`flex-1 p-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl border-b-4 border-black/20 active:scale-95 transition-all ${isLocked ? 'bg-slate-700 text-slate-400 cursor-not-allowed border-none' : 'bg-[#FFC107] text-[#05488B]'}`}
                >
                    <Save size={16} strokeWidth={3} /> {loading ? "Updating..." : "Save Changes"}
                </button>
            </div>
            <Zap className="absolute -right-10 -bottom-10 text-white/5 w-48 h-48 rotate-12" />
        </div>
    );

    const renderChangePassword = () => (
        <div className="bg-[#0b213a] rounded-[2.5rem] border-4 border-[#FFC107] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.4)] animate-in zoom-in-95 duration-300">
            <div className="space-y-5">
                <div>
                    <label className="text-[10px] font-black text-[#FFC107] uppercase ml-4 mb-2 block tracking-widest">New Password</label>
                    <input type="password" placeholder="••••••••" className="input-style-settings" />
                </div>
                <div>
                    <label className="text-[10px] font-black text-[#FFC107] uppercase ml-4 mb-2 block tracking-widest">Confirm New Password</label>
                    <input type="password" placeholder="••••••••" className="input-style-settings" />
                </div>
            </div>
            <div className="flex gap-4 mt-10">
                <button onClick={() => setView('menu')} className="flex-1 p-4 bg-white/5 text-white/50 rounded-2xl font-black text-xs uppercase tracking-widest">Cancel</button>
                <button onClick={() => setView('menu')} className="flex-1 p-4 bg-[#FFC107] text-[#05488B] rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl border-b-4 border-black/20 active:scale-95 transition-all">Update Security</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#05488B] p-6 pt-24 pb-12 font-sans relative overflow-hidden text-white">

            <div className="absolute inset-0 pointer-events-none z-0">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className="settings-glowing-drop"
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

            <div className="max-w-2xl mx-auto relative z-10">
                <div className="flex items-center gap-4 mb-10">
                    <button
                        onClick={() => view === 'menu' ? navigate(-1) : setView('menu')}
                        className="p-3 bg-[#0b213a] rounded-2xl shadow-xl border-2 border-white/10 text-[#FFC107] hover:scale-110 active:scale-90 transition-all"
                    >
                        {view === 'menu' ? <ChevronLeft size={24} strokeWidth={3} /> : <X size={24} strokeWidth={3} />}
                    </button>
                    <div>
                        <div className="inline-flex items-center gap-2 bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/20 px-3 py-1 rounded-full text-[10px] font-black uppercase mb-1 tracking-widest">
                            <Zap size={12} className="fill-[#FFC107]" /> Control Center
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                            {view === 'menu' ? 'Settings' : view === 'profile' ? 'Profile' : 'Security'}
                        </h1>
                    </div>
                </div>

                {view === 'profile' ? renderEditProfile() :
                    view === 'password' ? renderChangePassword() : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <section>
                                <h2 className="text-[10px] font-black text-[#FFC107] uppercase tracking-[0.4em] mb-4 ml-6 opacity-60">Identity & Shield</h2>
                                <div className="bg-[#0b213a] rounded-[2.5rem] border-4 border-white/5 overflow-hidden shadow-2xl">
                                    <SettingsItem icon={<User size={20} />} label="Edit Profile" desc={isLocked ? `Locked for ${daysRemaining} days` : "Change name or info"} onClick={() => setView('profile')} />
                                    <SettingsItem icon={<Lock size={20} />} label="Security" desc="Update your password" onClick={() => setView('password')} />

                                    <div className="flex items-center justify-between p-7 hover:bg-white/5 transition-all cursor-pointer border-b border-white/5">
                                        <div className="flex items-center gap-5">
                                            <div className="p-3.5 bg-[#05488B] text-[#FFC107] rounded-2xl shadow-lg border border-white/10"><Bell size={20} strokeWidth={2.5} /></div>
                                            <div>
                                                <p className="font-black text-white text-lg tracking-tight leading-none mb-1">Push Notifications</p>
                                                <p className="text-[10px] font-bold text-blue-300/50 uppercase tracking-tighter">Alerts for rides & items</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setNotifications(!notifications)}
                                            className={`w-14 h-7 rounded-full transition-all relative shadow-inner ${notifications ? 'bg-[#FFC107]' : 'bg-white/10'}`}
                                        >
                                            <div className={`absolute top-1 w-5 h-5 rounded-full shadow-md transition-all duration-300 ${notifications ? 'left-8 bg-[#05488B]' : 'left-1 bg-white/40'}`} />
                                        </button>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-[10px] font-black text-[#FFC107] uppercase tracking-[0.4em] mb-4 ml-6 opacity-60">System Registry</h2>
                                <div className="bg-[#0b213a] rounded-[2.5rem] border-4 border-white/5 overflow-hidden shadow-2xl">
                                    <SettingsItem icon={<Smartphone size={20} />} label="App Version" desc="v1.0.4-Stable" showArrow={false} />
                                </div>
                            </section>

                            <section>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="w-full bg-red-500/10 p-7 rounded-[2.5rem] border-4 border-red-500/20 flex items-center justify-between group hover:bg-red-500/20 transition-all"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="p-3.5 bg-red-500 text-white rounded-2xl shadow-lg"><Trash2 size={20} strokeWidth={2.5} /></div>
                                        <div className="text-left">
                                            <p className="font-black text-red-500 text-lg tracking-tight leading-none mb-1 uppercase">Terminate Account</p>
                                            <p className="text-[10px] font-bold text-red-400/50 uppercase tracking-tighter">This action is permanent</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-red-500/30 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </section>
                        </div>
                    )}
            </div>

            {/* --- CUSTOM TERMINATION POPUP --- */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[10002] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm p-8 rounded-[2.5rem] border-4 border-red-500 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="text-center mb-6">
                            <div className="bg-red-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={32} className="text-red-500" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">Final Warning</h3>
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-2">
                                This action is permanent and irreversible
                            </p>
                        </div>

                        <p className="text-slate-500 text-sm font-bold text-center mb-8 leading-relaxed">
                            Are you sure you want to delete your profile? All your rides and items will be vanished.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-200 transition-all"
                            >
                                Keep Account
                            </button>
                            <button
                                onClick={handleTerminateAccount}
                                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-red-500/40 hover:bg-red-600 active:scale-95 transition-all"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .input-style-settings {
                    width: 100%;
                    background: rgba(5, 72, 139, 0.4);
                    border: 2px solid rgba(255, 255, 255, 0.05);
                    padding: 1.1rem 1.5rem;
                    border-radius: 1.25rem;
                    color: white;
                    font-weight: 800;
                    outline: none;
                    transition: all 0.3s;
                }
                .input-style-settings:focus {
                    border-color: #FFC107;
                    background: rgba(5, 72, 139, 0.6);
                    box-shadow: 0 0 20px rgba(255, 193, 7, 0.1);
                }
                .settings-glowing-drop {
                    position: absolute;
                    top: -10%;
                    background: #FFC107;
                    border-radius: 50%;
                    opacity: 0;
                    box-shadow: 0 0 20px 4px #FFC107, 0 0 40px 8px rgba(255, 193, 7, 0.3);
                    animation: settings-fall linear infinite;
                }
                @keyframes settings-fall {
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

const SettingsItem = ({ icon, label, desc, onClick, showArrow = true, isDisabled = false }) => (
    <div
        onClick={!isDisabled ? onClick : null}
        className={`flex items-center justify-between p-7 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all cursor-pointer group ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
    >
        <div className="flex items-center gap-5">
            <div className="p-3.5 bg-[#05488B] text-[#FFC107] rounded-2xl shadow-lg border border-white/10 group-hover:scale-110 transition-transform">{icon}</div>
            <div>
                <p className="font-black text-white text-lg tracking-tight leading-none mb-1">{label}</p>
                <p className="text-[10px] font-bold text-blue-300/50 uppercase tracking-tighter">{desc}</p>
            </div>
        </div>
        {showArrow && <ChevronRight size={20} className="text-[#FFC107]/20 group-hover:text-[#FFC107] group-hover:translate-x-1 transition-all" />}
    </div>
);

export default Settings;