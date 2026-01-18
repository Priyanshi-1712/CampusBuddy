import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, BookOpen, Microscope, FileText, MessageCircle } from 'lucide-react';
import ChatBox from '../components/ChatBox'; // Make sure the path is correct

const Marketplace = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Chat States
  const [showChat, setShowChat] = useState(false);
  const [selectedReceiver, setSelectedReceiver] = useState(null);

  const currentUser = localStorage.getItem("userEmail");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/api/resources")
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setFilteredItems(data);
      });
  }, []);

  useEffect(() => {
    let result = items;
    if (activeCategory !== "All") {
      result = result.filter(item => item.type === activeCategory);
    }
    if (searchTerm) {
      result = result.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredItems(result);
  }, [searchTerm, activeCategory, items]);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-4xl font-black text-slate-800">Marketplace</h1>
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search books, notes..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => navigate('/post-item')} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition">
            + Sell Item
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="flex gap-3 mb-10 overflow-x-auto pb-2">
          {["All", "Books", "Lab Equipments", "Notes"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full font-bold transition-all whitespace-nowrap ${activeCategory === cat
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex justify-between mb-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase">{item.type}</span>
                  <p className="font-black text-xl text-slate-800">{item.price > 0 ? `₹${item.price}` : "FREE"}</p>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">{item.title}</h3>
                <p className="text-xs text-slate-400 mb-4 italic">Sold by: Student</p>
              </div>

              {item.owner === currentUser ? (
                <button
                  onClick={async () => {
                    if (window.confirm("Delete this listing?")) {
                      await fetch(`http://localhost:8000/api/resources/${item.id}`, { method: 'DELETE' });
                      window.location.reload();
                    }
                  }}
                  className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-600 hover:text-white transition"
                >
                  Remove Listing
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectedReceiver(item.owner);
                    setShowChat(true);
                  }}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition"
                > 
                  <MessageCircle size={18} />
                  Message Seller
                </button>
              )}
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 font-medium">No items found in this category.</p>
          </div>
        )}
      </div>

      {/* Persistent Chat Window */}
      {showChat && (
        <ChatBox 
          receiverEmail={selectedReceiver} 
          onClose={() => setShowChat(false)} 
        />
      )}
    </div>
  );
};

export default Marketplace;