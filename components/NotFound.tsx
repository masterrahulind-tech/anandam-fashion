import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    useEffect(() => {
        document.title = "Page Not Found | Anandam Fashion";
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-6xl md:text-9xl font-serif italic text-slate-200 mb-6">404</h1>
            <h2 className="text-2xl md:text-4xl font-serif italic text-slate-800 mb-4">Page Not Found</h2>
            <p className="text-slate-500 max-w-md mb-10 font-serif italic">
                The piece you are looking for seems to have been moved from our archive or does not exist.
            </p>
            <Link
                to="/"
                className="bg-black text-white px-8 py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gold transition-colors shadow-xl"
            >
                Return to Atelier
            </Link>
        </div>
    );
};

export default NotFound;
