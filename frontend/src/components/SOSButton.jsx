import React from 'react';

const SOSButton = () => {
  const handleSOS = () => {
    const user = localStorage.getItem("userName") || "Anonymous";

    // 1. Get GPS Location from the browser
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const payload = {
          user: user,
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // 2. Send to Backend
        try {
          const res = await fetch("http://localhost:8000/api/sos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          if (res.ok) alert("🚨 Emergency alert sent to Campus Security!");
        } catch (err) {
          alert("Could not connect to emergency services.");
        }
      });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <button 
      onClick={handleSOS}
      className="fixed bottom-8 right-8 bg-red-600 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center font-black text-xl hover:bg-red-700 hover:scale-110 transition-all z-50 border-4 border-white"
    >
      SOS
    </button>
  );
};

export default SOSButton;