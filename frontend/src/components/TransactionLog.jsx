import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    ArrowLeft, ArrowDownLeft, ArrowUpRight, 
    Clock, Landmark, Receipt, Filter, Calendar
} from 'lucide-react';

const BACKEND_URL = "http://127.0.0.1:8000";

const TransactionLog = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const storedUser = JSON.parse(localStorage.getItem('user'));
    const userEmail = storedUser?.college_email || localStorage.getItem("userEmail");

    useEffect(() => {
        if (!userEmail) {
            navigate("/login");
            return;
        }

        const fetchLogs = async () => {
            try {
                // This matches the API we added to main.py
                const res = await axios.get(`${BACKEND_URL}/api/wallet/transactions/${userEmail}`);
                setLogs(res.data);
            } catch (err) {
                console.error("Error fetching financial records:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [userEmail, navigate]);

    return (
        <div className="min-h-screen bg-[#05488B] p-6 pt-24 font-sans relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#FFC107]/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-400/10 blur-[120px] rounded-full"></div>
            </div>

            <div className="max-w-3xl mx-auto relative z-10">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-8">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="p-4 bg-[#0b213a] text-white rounded-2xl border-2 border-white/10 hover:border-[#FFC107] transition-all group"
                    >
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Financial Ledger</h1>
                    <div className="p-4 bg-[#FFC107]/10 rounded-2xl border border-[#FFC107]/20">
                        <Receipt size={24} className="text-[#FFC107]" />
                    </div>
                </div>

                {/* Summary Card */}
                <div className="bg-[#0b213a] border-4 border-[#FFC107] rounded-[2.5rem] p-6 mb-8 flex items-center justify-between shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#05488B] rounded-xl text-[#FFC107]">
                            <Landmark size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Digital Vault Status</p>
                            <p className="text-xl font-black text-white uppercase">Verified Account</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Total Logs</p>
                        <p className="text-2xl font-black text-[#FFC107]">{logs.length}</p>
                    </div>
                </div>

                {/* Logs List */}
                <div className="space-y-4">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="h-24 w-full bg-white/5 animate-pulse rounded-3xl border-2 border-white/5"></div>
                        ))
                    ) : logs.length === 0 ? (
                        <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border-2 border-dashed border-white/10">
                            <Clock size={48} className="mx-auto text-blue-300 opacity-20 mb-4" />
                            <p className="text-blue-200 font-bold uppercase tracking-widest">No transactions found</p>
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div 
                                key={log.id} 
                                className="bg-[#0b213a] p-5 rounded-3xl border-2 border-white/5 hover:border-[#FFC107]/30 transition-all group relative overflow-hidden"
                            >
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-2xl ${
                                            log.type === 'EARNING' 
                                            ? 'bg-emerald-500/10 text-emerald-400' 
                                            : 'bg-blue-500/10 text-blue-300'
                                        } group-hover:scale-110 transition-transform`}>
                                            {log.type === 'EARNING' ? <ArrowDownLeft size={20}/> : <ArrowUpRight size={20}/>}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white text-sm tracking-tight uppercase">{log.description}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Calendar size={10} className="text-blue-300" />
                                                <p className="text-[10px] font-bold text-blue-300 uppercase opacity-60">
                                                    {new Date(log.timestamp).toLocaleDateString()} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xl font-black ${
                                            log.type === 'EARNING' ? 'text-emerald-400' : 'text-[#FFC107]'
                                        }`}>
                                            {log.type === 'EARNING' ? '+' : ''}₹{log.amount.toFixed(2)}
                                        </p>
                                        <div className={`inline-block px-2 py-0.5 rounded-md text-[8px] font-black uppercase mt-1 ${
                                            log.type === 'EARNING' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#FFC107]/20 text-[#FFC107]'
                                        }`}>
                                            {log.type}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionLog;