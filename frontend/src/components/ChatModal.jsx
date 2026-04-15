import React from 'react';
import { X } from 'lucide-react';
import Particles from './Particles';
import ChatBox from './ChatBox';

const ChatModal = ({ isOpen, onClose, item, currentUserEmail, otherUserEmail }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
            
            {/* MAIN GLASS MODAL */}
            <div className="relative rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] backdrop-blur-xl bg-white/10 border border-white/20 animate-in fade-in zoom-in duration-200">
                
                {/* PARTICLES BACKGROUND */}
                <div className="absolute inset-0 z-0">
                    <Particles
                        particleColors={["#60a5fa", "#c084fc", "#ffffff"]}
                        particleCount={150}
                        particleSpread={8}
                        speed={0.08}
                        particleBaseSize={80}
                        moveParticlesOnHover
                        alphaParticles
                        disableRotation={false}
                    />
                </div>

                {/* HEADER */}
                <div className="p-6 border-b border-white/20 flex justify-between items-center bg-white/20 backdrop-blur-md relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {otherUserEmail[0].toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-white leading-none">
                                {otherUserEmail.split('@')[0]}
                            </h3>
                            <p className="text-[10px] text-blue-200 font-black uppercase tracking-widest mt-1">
                                Re: {item?.title || "Resource"}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                    >
                        <X size={20}/>
                    </button>
                </div>
                
                {/* CHAT AREA */}
                <div className="flex-1 overflow-hidden bg-transparent relative z-10">
                    {/* FIX: Changed otherUserEmail to receiverEmail */}
                    <ChatBox 
                        itemId={item?.id} 
                        currentUserEmail={currentUserEmail} 
                        receiverEmail={otherUserEmail} 
                    />
                </div>

            </div>
        </div>
    );
};

export default ChatModal;