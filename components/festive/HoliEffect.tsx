import React, { useEffect, useState } from 'react';

const HoliEffect = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const expiryDate = new Date('2026-03-06T00:00:00');
        const now = new Date();

        if (now < expiryDate) {
            setIsVisible(true);
        }
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {/* Colorful Splashes */}
            <div className="absolute -top-10 -left-10 w-40 h-40 md:w-64 md:h-64 bg-magenta-splash opacity-20 blur-3xl animate-pulse"></div>
            <div className="absolute top-1/4 -right-10 w-32 h-32 md:w-48 md:h-48 bg-gold-splash opacity-15 blur-2xl animate-bounce-slow"></div>
            <div className="absolute -bottom-10 left-1/4 w-40 h-40 md:w-60 md:h-60 bg-green-splash opacity-10 blur-3xl animate-pulse-slow"></div>

            {/* Floating Particles */}
            {[...Array(15)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-1 h-3 md:w-2 md:h-4 rounded-full opacity-40 animate- Holi-float"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        backgroundColor: ['#FF1493', '#FFD700', '#32CD32', '#00CED1', '#FF4500'][i % 5],
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${3 + Math.random() * 7}s`
                    }}
                />
            ))}

            {/* Festive Banner */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-6 py-2 rounded-full border border-gold/20 shadow-lg flex items-center gap-3 animate-slide-up pointer-events-auto">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-800">
                    Happy <span className="text-magenta-splash">H</span><span className="text-gold">o</span><span className="text-green-splash">l</span><span className="text-cyan-500">i</span> Celebration
                </span>
                <div className="h-3 w-px bg-slate-200"></div>
                <span className="text-[8px] font-serif italic text-slate-400">Festival of Colors</span>
            </div>

            <style>{`
                .bg-magenta-splash { background-color: #FF1493; }
                .bg-gold-splash { background-color: #FFD700; }
                .bg-green-splash { background-color: #32CD32; }
                
                @keyframes Holi-float {
                    0% { transform: translateY(0) rotate(0deg); opacity: 0; }
                    20% { opacity: 0.4; }
                    80% { opacity: 0.4; }
                    100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
                }
                
                @keyframes slide-up {
                    from { transform: translate(-50%, 100px); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }

                .animate-bounce-slow {
                    animation: bounce 5s infinite;
                }
                
                .animate-pulse-slow {
                    animation: pulse 8s infinite;
                }

                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }

                .animate- Holi-float {
                    animation: Holi-float linear infinite;
                }

                .animate-slide-up {
                    animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
};

export default HoliEffect;
