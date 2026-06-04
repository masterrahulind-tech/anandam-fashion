
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ADSENSE_CLIENT_ID = 'ca-pub-7082934973695027';

// List of pages where ads should be DISABLED
const EMPTY_PAGES = [
    '/login',
    '/signup',
    '/cart',
    '/checkout',
    '/order-confirmation',
    '/admin',
    '/thank-you',
    '/profile',
    '/privacy-policy',
    '/terms-of-service',
    '/shipping-returns',
    '/contact',
    '/not-found'
];

const AdSenseManager: React.FC = () => {
    const location = useLocation();

    useEffect(() => {
        const isPageEmpty = EMPTY_PAGES.some(path => location.pathname.startsWith(path));

        if (isPageEmpty) {
            // Remove any existing ads if they were dynamically loaded
            const ads = document.querySelectorAll('.adsbygoogle');
            ads.forEach(ad => ad.remove());
            return;
        }

        // Load the script dynamically if not already present
        const existingScript = document.querySelector(`script[src*="adsbygoogle.js"]`);
        if (!existingScript) {
            const script = document.createElement('script');
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
            script.async = true;
            script.crossOrigin = 'anonymous';
            document.head.appendChild(script);
        }
    }, [location]);

    return null; // This component doesn't render anything
};

export default AdSenseManager;
