import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const RatingModal = ({ isOpen, onClose, targetEmail, targetName, type }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const user = JSON.parse(localStorage.getItem('user'));

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Please select a star rating");
            return;
        }

        try {
            // 1. Submit the Rating
            await axios.post('http://127.0.0.1:8000/api/users/rate', {
                reviewer_email: user.email,
                target_email: targetEmail,
                stars: rating,
                type: type // 'ride' or 'product'
            });

            // 2. Award Points to the reviewer for giving feedback
            await axios.post('http://127.0.0.1:8000/api/users/add-points', {
                email: user.email,
                amount: 10 // Reward for rating
            });

            toast.success(`Rating submitted! You earned 10 points.`);
            onClose();
        } catch (err) {
            console.error("Rating failed", err);
            toast.error("Could not submit rating.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        Rate your {type}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="text-center mb-8">
                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-4">
                        How was your experience with <span className="text-blue-600 dark:text-blue-400 font-bold">{targetName}</span>?
                    </p>

                    {/* Star Selection */}
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                className="transition-transform active:scale-90"
                            >
                                <Star
                                    size={40}
                                    strokeWidth={1.5}
                                    className={`${star <= (hover || rating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-slate-300 dark:text-slate-700'
                                        } transition-colors duration-200`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                >
                    Submit Review
                </button>
            </div>
        </div>
    );
};

export default RatingModal;