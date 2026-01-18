import React, { useState } from 'react';

const UploadModal = ({ isOpen, onClose, onUpload }) => {
  const [isPaid, setIsPaid] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Notes',
    price: '0',
    location: '',
    limit: '1',
    owner: 'Student'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpload({ 
      ...formData, 
      id: Date.now(), 
      isFree: !isPaid,
      status: 'Available' 
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">Draft Resource Post</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title & Category */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
            <input type="text" required placeholder="e.g. Drafter or Unit 1 Notes" className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, title: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
            <select className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none" onChange={(e) => setFormData({...formData, type: e.target.value})}>
              <option value="Notes">Notes (Handwritten)</option>
              <option value="Books">Books</option>
              <option value="Equipments">Equipments</option>
            </select>
          </div>

          {/* Price Logic */}
          <div className="flex gap-4 p-1 bg-gray-100 rounded-xl">
            <button type="button" onClick={() => {setIsPaid(false); setFormData({...formData, price: '0'})}} className={`flex-1 py-2 rounded-lg font-bold transition ${!isPaid ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500'}`}>Free</button>
            <button type="button" onClick={() => setIsPaid(true)} className={`flex-1 py-2 rounded-lg font-bold transition ${isPaid ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500'}`}>Paid</button>
          </div>

          {isPaid && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹)</label>
              <input type="number" placeholder="Enter amount" className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, price: e.target.value})} />
            </div>
          )}

          {/* Location & Limit */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Meeting Place (Around Campus)</label>
            <input type="text" placeholder="e.g. Canteen, Library Gate" className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, location: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Availability Limit (Persons)</label>
            <input type="number" placeholder="1" className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, limit: e.target.value})} />
          </div>

          <button type="submit" className="w-full py-4 bg-blue-900 text-white font-bold rounded-2xl hover:bg-blue-800 transition shadow-lg pt-4">Publish Post</button>
          <button type="button" onClick={onClose} className="w-full text-gray-400 font-medium text-sm">Discard</button>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;