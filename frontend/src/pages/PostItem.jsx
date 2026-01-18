import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PostItem = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('Books');
  const [isPaid, setIsPaid] = useState(false); // Track Free vs Paid
  const [formData, setFormData] = useState({
    title: '',
    price: 0,
    location: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userEmail = localStorage.getItem("userEmail");

    const payload = {
      title: formData.title,
      type: category,
      price: isPaid ? formData.price : 0, // Force price to 0 if Free
      location: formData.location,
      owner: userEmail,
      description: category === "Notes" ? "Digital Sharing" : "Physical Handover"
    };

    try {
      const res = await fetch("http://localhost:8000/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("🎉 Posted successfully!");
        navigate('/marketplace');
      }
    } catch (err) {
      alert("Error connecting to server");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 px-6 flex justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
        <h2 className="text-3xl font-black mb-8 text-slate-800">List an Item</h2>
        
        {/* 1. Category Dropdown */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-700 mb-2">What are you listing?</label>
          <select 
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Books">Books</option>
            <option value="Lab Equipments">Lab Equipments</option>
            <option value="Notes">Notes</option>
          </select>
        </div>

        {/* 2. Dynamic Title Label */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-700 mb-2">
            {category === "Notes" ? "Subject/Notes Name" : "Item Name"}
          </label>
          <input 
            type="text" 
            required 
            placeholder={category === "Notes" ? "e.g. Data Structures Unit 1" : "e.g. Engineering Physics Book"}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl"
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>

        {/* 3. Free vs Paid Selection (Bullets/Radio) */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-700 mb-3">Pricing Type</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="priceType" checked={!isPaid} onChange={() => setIsPaid(false)} className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-600">Free (Donation)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="priceType" checked={isPaid} onChange={() => setIsPaid(true)} className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-600">Paid</span>
            </label>
          </div>
        </div>

        {/* 4. Conditional Price Field - Only shows if 'Paid' is selected */}
        {isPaid && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="block text-sm font-bold text-slate-700 mb-2">Price (₹)</label>
            <input 
              type="number" 
              required 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl"
              onChange={(e) => setFormData({...formData, price: e.target.value})}
            />
          </div>
        )}

        {/* 5. Dynamic Location Field */}
        <div className="mb-8">
          <label className="block text-sm font-bold text-slate-700 mb-2">
            {category === "Notes" ? "Sharing Link (Google Drive)" : "Pickup Location (Hostel/Room)"}
          </label>
          <input 
            type="text" 
            required 
            placeholder={category === "Notes" ? "https://drive.google.com/..." : "e.g. Hostel A, Room 302"}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl"
            onChange={(e) => setFormData({...formData, location: e.target.value})}
          />
        </div>

        <button className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">
          Post Listing
        </button>
      </form>
    </div>
  );
};

export default PostItem;