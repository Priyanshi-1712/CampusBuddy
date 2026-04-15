import { motion } from "framer-motion";
import carImg from "../assets/car.png";

const CarLoader = () => {
    return (
        // fixed inset-0 ensures it sits directly on top of your app content
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-[99999] bg-slate-900/10 backdrop-blur-[2px]">

            {/* Central Animation Track */}
            <div className="relative w-full flex flex-col items-center justify-center">

                {/* 🛣️ The Professional Road Track */}
                <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-slate-400/30 to-transparent relative">

                    {/* Slower Moving Lane Lines */}
                    <motion.div
                        className="absolute inset-0 flex justify-around items-center"
                        initial={{ x: 0 }}
                        animate={{ x: "-20%" }}
                        transition={{
                            repeat: Infinity,
                            duration: 3, // SLOWED the road movement
                            ease: "linear"
                        }}
                    >
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="h-[2px] w-20 bg-white/40 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                        ))}
                    </motion.div>
                </div>

                {/* 🚗 The Large Professional Car */}
                <motion.img
                    src={carImg}
                    alt="car"
                    // Increased width to 64 (256px) for a much bigger presence
                    className="w-64 absolute mb-20 drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
                    style={{
                        mixBlendMode: "screen",
                        filter: "brightness(1.1) contrast(1.2) drop-shadow(0 0 15px rgba(255,193,7,0.2))"
                    }}
                    initial={{ x: "-120vw" }}
                    animate={{
                        x: "120vw",
                        y: [0, -5, 0] // Smooth suspension bounce
                    }}
                    transition={{
                        duration: 8, // Very slow, steady glide
                        ease: "easeInOut",
                        repeat: Infinity
                    }}
                />

                {/* 💨 Subtle Speed Trails (Professional create-in-bg effect) */}
                <motion.div
                    className="absolute right-1/2 w-40 h-1 bg-gradient-to-l from-white/20 to-transparent blur-md"
                    animate={{ opacity: [0, 0.5, 0], x: [-20, -100] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </div>

            {/* 📝 Minimalist Professional Text */}
            <div className="absolute bottom-1/4 flex flex-col items-center gap-4">
                <motion.p
                    className="text-[#05488B] text-xl font-black italic uppercase tracking-[0.8em] drop-shadow-md"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    Preparing Ride
                </motion.p>

                {/* Progress Bar Style Loader */}
                <div className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-[#FFC107]"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                </div>
            </div>

        </div>
    );
};

export default CarLoader;