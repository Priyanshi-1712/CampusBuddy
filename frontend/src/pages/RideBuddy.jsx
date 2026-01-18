import React, { useState, useEffect } from 'react';

const RideBuddy = () => {
    const [rides, setRides] = useState([]);

    useEffect(() => {
        // Fetch rides from backend
        fetch("http://localhost:8000/api/rides")
            .then(res => res.json())
            .then(data => setRides(data))
            .catch(err => console.log("Error fetching rides"));
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 p-6 pt-24">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-black text-slate-800 mb-2">RideBuddy</h1>
                // Add this button in RideBuddy.jsx inside the top header section
                <button
                    onClick={() => navigate('/post-ride')}
                    className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold shadow-lg"
                >
                    + Offer Ride
                </button>
                <p className="text-slate-500 mb-8">Find a ride or offer a seat to your college mates.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rides.map((ride) => (
                        <div key={ride.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">To: {ride.destination}</h3>
                                <p className="text-blue-600 font-medium">{ride.departure_time}</p>
                                <p className="text-sm text-slate-400 mt-2">Driver: {ride.driver_name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-slate-900">₹{ride.price_per_seat}</p>
                                <p className="text-xs text-slate-400 mb-3">{ride.seats_available} seats left</p>
                                <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 transition">
                                    Book Seat
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {rides.length === 0 && (
                    <div className="bg-white p-12 rounded-[3rem] text-center border-2 border-dashed border-slate-200 mt-10">
                        <p className="text-slate-400 font-medium">No rides available right now.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RideBuddy;