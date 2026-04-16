import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    ArrowLeft, MapPin, IndianRupee, FileUp, Send,
    CheckCircle2, GraduationCap, Calendar, Clock,
    Layers, Tag, Package, BookOpen, FileText, ImageIcon, Zap, Plus,
    AlertCircle, ShieldCheck, X, ArrowRight, Scale
} from 'lucide-react';

const BACKEND_URL = "http://127.0.0.1:8000";

const PostItem = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState("Notes");
    const [isFree, setIsFree] = useState(false);

    const [showGuidelines, setShowGuidelines] = useState(true);
    const [rulesAccepted, setRulesAccepted] = useState(false);

    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const [attachment, setAttachment] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        courseName: '',
        semester: '',
        price: '',
        meetup_location: 'Campus Central'
    });

    const CATEGORY_LIMITS = {
        "Notes": 200,
        "Old Papers": 150,
        "Books": 1000,
        "Lab Equipments": 10000,
    };

    const getThemeConfig = () => {
        switch (category) {
            case "Notes": return { bgGradient: "from-blue-200 via-indigo-100 to-blue-300", accentColor: "text-blue-700", floatingIcons: ["📝", "✒️", "📓", "💡", "📒", "🧠", "✍️"], moodLabel: "Study Session" };
            case "Old Papers": return { bgGradient: "from-orange-200 via-amber-100 to-yellow-300", accentColor: "text-orange-700", floatingIcons: ["📄", "📜", "📂", "🎓", "📑", "🕰️", "🏆"], moodLabel: "Exam Mode" };
            case "Books": return { bgGradient: "from-emerald-200 via-teal-100 to-green-300", accentColor: "text-emerald-700", floatingIcons: ["📚", "📖", "🔖", "📕", "📔", "🍃", "🧐"], moodLabel: "Library Vibes" };
            case "Lab Equipments": return { bgGradient: "from-purple-200 via-fuchsia-100 to-purple-300", accentColor: "text-purple-700", floatingIcons: ["🧪", "🔬", "🥽", "⚙️", "🔋", "⚡", "🤖"], moodLabel: "Lab Research" };
            default: return { bgGradient: "from-slate-100 to-slate-300", accentColor: "text-slate-700", floatingIcons: ["✨"], moodLabel: "Marketplace" };
        }
    };

    const currentTheme = getThemeConfig();
    const isDigital = category === "Notes" || category === "Old Papers";

    // --- NEW: ACADEMIC VALIDATION LOGIC ---
    const validateAcademicItem = (title, currentCategory) => {
        const spamWords = ["slippers", "bedsheet", "pillow", "fashion", "dress", "shoes", "makeup", "food", "kurti", "tshirt", "jeans"];
        const lowerTitle = title.toLowerCase();

        // Check for spam
        if (spamWords.some(word => lowerTitle.includes(word))) {
            toast.error("❌ This is a Student Marketplace. Only academic items are allowed.");
            return false;
        }

        // Category Logic Warning
        if (currentCategory === "Notes" && !lowerTitle.includes("notes") && !lowerTitle.includes("unit")) {
            toast.info("Tip: Include 'Notes' or 'Unit No' in your title for better visibility.");
        }

        return true;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const ext = file.name.split('.').pop().toLowerCase();

        // 1. Logic for Digital items (Notes / Old Papers)
        if (isDigital) {
            if (ext !== 'pdf' && ext !== 'docx' && ext !== 'doc') {
                toast.error("Format Denied! Notes must be PDF or DOCX for AI Scanning.");
                e.target.value = ""; // Reset input
                return;
            }
            setAttachment(file);
            toast.success("Document verified for AI Scanning");
        }
        // 2. Logic for Physical items (Books / Lab Equipments)
        else {
            const imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
            if (!imageExtensions.includes(ext)) {
                toast.error("Please upload an image (JPG/PNG) of the physical item.");
                e.target.value = ""; // Reset input
                return;
            }
            setAttachment(file);
            toast.success("Item photo attached successfully!");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePriceChange = (e) => {
        const val = parseFloat(e.target.value);
        const max = CATEGORY_LIMITS[category] || 5000;
        if (val > max) {
            toast.error(`Price limit for ${category} is ₹${max}`);
            return;
        }
        setFormData({ ...formData, price: e.target.value });
    };

    const handlePost = async (e) => {
        e.preventDefault();

        // --- INTEGRATED VALIDATION ---
        if (!validateAcademicItem(formData.title, category)) return;

        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) return toast.error("Please login first");

        const data = new FormData();
        data.append("title", formData.title);
        data.append("category", category);
        data.append("description", formData.description || (isDigital ? "" : "Physical item listing"));
        data.append("courseName", formData.courseName);
        data.append("semester", formData.semester);
        data.append("owner_email", userEmail);
        data.append("owner_name", localStorage.getItem("userName") || "Campus Student");
        data.append("isFree", String(isFree));
        data.append("price", isFree ? "0" : String(formData.price));
        data.append("meetup_location", formData.meetup_location);

        if (attachment) {
            data.append("file", attachment);
        }

        try {
            setLoading(true);
            const response = await axios.post(`${BACKEND_URL}/api/marketplace/post`, data);
            if (response.data.status === "success") {
                toast.success("Listing Published Successfully!");
                navigate('/marketplace');
            }
        } catch (err) {
            if (err.response && err.response.data.detail) {
                toast.error(err.response.data.detail);
            } else {
                toast.error("Submission failed. Please check your network.");
            }
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen relative transition-all duration-1000 bg-gradient-to-br ${currentTheme.bgGradient} pt-24 pb-12 px-4 font-sans overflow-hidden`}>

            {/* BIGGER & FASTER FLOATING BACKGROUND ANIMATION */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                {currentTheme.floatingIcons.map((icon, index) => (
                    <motion.div
                        key={`${category}-${index}`}
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: window.innerHeight + 200,
                            opacity: 0
                        }}
                        animate={{
                            y: -300,
                            opacity: [0, 0.7, 0.7, 0], // Higher opacity
                            rotate: index % 2 === 0 ? 360 : -360
                        }}
                        transition={{
                            duration: 5 + Math.random() * 5, // Faster speed (5-10s instead of 10-20s)
                            repeat: Infinity,
                            delay: index * 1.2,
                            ease: "linear"
                        }}
                        className="absolute text-7xl select-none" // Much bigger (text-7xl)
                    >
                        {icon}
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {showGuidelines && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#0b213a] w-full max-w-lg rounded-[2.5rem] p-8 border-4 border-[#FFC107] shadow-2xl relative overflow-hidden">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-[#FFC107] p-3 rounded-2xl text-[#05488B]"><AlertCircle size={32} /></div>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Seller Guidelines</h2>
                                    <p className="text-[#FFC107] text-[10px] font-bold uppercase tracking-widest">Quality Control Protocol</p>
                                </div>
                            </div>
                            <div className="space-y-4 mb-8">
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-white/80">
                                    <h4 className="text-[#FFC107] font-black uppercase text-[10px] tracking-widest mb-3 flex items-center gap-2"><ShieldCheck size={14} /> Campus Quality Standards</h4>
                                    <ul className="text-xs space-y-2 leading-relaxed list-disc ml-4 font-bold">
                                        <li>Notes/Papers must be clear PDF or DOCX files.</li>
                                        <li>Photos must show the actual item condition.</li>
                                        <li>Strictly Student-to-Student trade only.</li>
                                    </ul>
                                </div>
                                <label className="flex items-center gap-4 cursor-pointer group bg-white/5 p-4 rounded-2xl border border-transparent hover:border-[#FFC107]/50 transition-all">
                                    <input type="checkbox" checked={rulesAccepted} onChange={(e) => setRulesAccepted(e.target.checked)} className="w-6 h-6 rounded-lg border-2 border-[#FFC107] accent-[#FFC107] cursor-pointer" />
                                    <span className="text-white font-bold text-xs uppercase group-hover:text-[#FFC107] transition-colors">I accept the guidelines and price limits</span>
                                </label>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => navigate(-1)} className="flex-1 py-4 rounded-2xl font-black uppercase text-xs text-white border-2 border-white/10 hover:bg-white/5 transition-all">Cancel</button>
                                <button disabled={!rulesAccepted} onClick={() => setShowGuidelines(false)} className={`flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 ${rulesAccepted ? 'bg-[#FFC107] text-[#05488B]' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}>Proceed to Sell <ArrowRight size={16} /></button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="max-w-4xl mx-auto relative z-10">
                <motion.div layout className="bg-[#05488B] rounded-[2.5rem] p-10 mb-8 shadow-2xl relative overflow-hidden text-white border-b-8 border-[#FFC107]">
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-[#FFC107] px-4 py-1 rounded-full text-xs font-black uppercase mb-4 tracking-widest border border-white/10">
                                <Zap size={14} className="fill-[#FFC107]" /> {currentTheme.moodLabel}
                            </div>
                            <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">Market <span className="text-[#FFC107]">Buddy.</span></h1>
                        </div>
                        <motion.div key={category} initial={{ scale: 0 }} animate={{ scale: 1 }} className="hidden md:block text-8xl">{currentTheme.floatingIcons[0]}</motion.div>
                    </div>
                </motion.div>

                <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100">
                    <form onSubmit={handlePost} className="p-10 md:p-16 space-y-12">
                        <div className="space-y-6">
                            <label className={`flex items-center gap-3 ${currentTheme.accentColor} font-black text-sm uppercase tracking-widest`}><Layers size={22} /> Item Classification</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <select name="category" value={category} onChange={(e) => setCategory(e.target.value)} className="market-input-lg" required>
                                    <option value="Notes">Notes - Digital</option>
                                    <option value="Old Papers">Old Papers - Digital</option>
                                    <option value="Books">Books - Physical</option>
                                    <option value="Lab Equipments">Equipments - Physical</option>
                                </select>
                                <input name="title" value={formData.title} onChange={handleInputChange} placeholder="Product Title *" className="market-input-lg" required />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className="flex items-center gap-3 text-[#05488B] font-black text-sm uppercase tracking-widest"><GraduationCap size={22} /> Academic Context</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input name="courseName" value={formData.courseName} onChange={handleInputChange} placeholder="Course Name *" className="market-input-lg" required />
                                <select name="semester" value={formData.semester} onChange={handleInputChange} className="market-input-lg" required>
                                    <option value="">Select Semester *</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div onClick={() => (isDigital ? fileInputRef : imageInputRef).current.click()} className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-14 flex flex-col items-center justify-center cursor-pointer hover:border-[#05488B] transition-all group">
                                <input type="file" ref={isDigital ? fileInputRef : imageInputRef} hidden accept={isDigital ? ".pdf,.doc,.docx" : "image/*"} onChange={handleFileChange} />
                                {isDigital ? <FileUp size={48} className="text-blue-500 mb-4" /> : <ImageIcon size={48} className="text-slate-400 mb-4" />}
                                <p className="font-black text-slate-500 text-sm uppercase tracking-widest">{attachment ? attachment.name : `Upload ${isDigital ? 'Document (PDF/DOCX)' : 'Photograph'}`}</p>
                            </div>
                        </div>

                        {isDigital && (
                            <div className="space-y-6">
                                <label className="flex items-center gap-3 text-[#05488B] font-black text-sm uppercase tracking-widest">
                                    <FileText size={22} /> Description & Main Topics
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="List the main topics (e.g., Recursion, SQL Joins). AI will scan your file to confirm these topics and rank your trust score."
                                    rows="4"
                                    className="market-input-lg resize-none border-2 border-blue-50 focus:border-[#FFC107]"
                                    required={isDigital}
                                ></textarea>
                                <div className="bg-blue-50 p-3 rounded-xl flex items-start gap-2 border border-blue-100">
                                    <Zap size={14} className="text-blue-500 mt-1 shrink-0" />
                                    <p className="text-[10px] text-blue-600 font-bold leading-tight">
                                        PRO TIP: An accurate description with relevant keywords improves your AI Trust Rank, making your listing appear higher in search!
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="pt-10 border-t border-slate-100 space-y-8">
                            <div className="flex bg-slate-100 p-2 rounded-[1.5rem] max-w-md mx-auto">
                                <button type="button" onClick={() => setIsFree(false)} className={`flex-1 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${!isFree ? 'bg-[#05488B] text-white shadow-xl scale-105' : 'text-slate-500'}`}>PAID</button>
                                <button type="button" onClick={() => setIsFree(true)} className={`flex-1 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${isFree ? 'bg-green-600 text-white shadow-xl scale-105' : 'text-slate-500'}`}>FREE</button>
                            </div>

                            {!isFree && (
                                <div className="relative flex items-center max-w-md mx-auto group">
                                    <div className="absolute left-6 z-10 text-[#05488B]"><IndianRupee size={28} strokeWidth={3} /></div>
                                    <input
                                        name="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={handlePriceChange}
                                        placeholder="0.00"
                                        className="market-input-lg !pl-20 text-2xl font-black"
                                        required={!isFree}
                                    />
                                </div>
                            )}

                            <button type="submit" disabled={loading} className="w-full bg-[#FFC107] hover:bg-[#05488B] text-[#05488B] hover:text-white py-7 rounded-[2rem] font-black text-xl uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 border-b-8 border-black/10">
                                {loading ? "POSTING..." : <>CONFIRM & POST ITEM <Send size={24} /></>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                .market-input-lg { width: 100%; background: #ffffff; border: 3px solid #F1F5F9; padding: 1.25rem 1.75rem; border-radius: 1.5rem; color: #1E293B; font-size: 1.1rem; font-weight: 700; outline: none; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .market-input-lg:focus { border-color: #05488B; transform: translateY(-3px); box-shadow: 0 20px 25px -5px rgba(5, 72, 139, 0.1); }
            `}</style>
        </div>
    );
};

export default PostItem;