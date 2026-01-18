import React, { useState, useEffect } from 'react';

const ChatBox = ({ receiverEmail, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const myEmail = localStorage.getItem("userEmail");

    // Fetch messages every 3 seconds (Polling)
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/messages/${myEmail}/${receiverEmail}`);
                const data = await res.json();
                setMessages(data);
            } catch (err) { console.error("Chat error:", err); }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [receiverEmail, myEmail]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        await fetch("http://127.0.0.1:8000/api/messages/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sender: myEmail,
                receiver: receiverEmail,
                content: newMessage
            })
        });
        setNewMessage("");
    };

    return (
        <div className="fixed bottom-5 right-5 w-80 h-[450px] bg-white shadow-2xl rounded-3xl flex flex-col border border-slate-200 z-50 overflow-hidden">
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                <span className="font-bold text-sm truncate">Chat: {receiverEmail}</span>
                <button onClick={onClose} className="hover:bg-blue-700 rounded-full p-1">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender_email === myEmail ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender_email === myEmail ? 'bg-blue-600 text-white' : 'bg-white text-slate-800 border'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t bg-white flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm outline-none"
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold">Send</button>
            </form>
        </div>
    );
};

export default ChatBox;