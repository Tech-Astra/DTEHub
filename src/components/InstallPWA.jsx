import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import './InstallPWA.css';

const InstallPWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [installing, setInstalling] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            console.log('DTEHub PWA: App installation prompt caught.');
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if already in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsVisible(false);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) {
            // Check if already installed
            if (window.matchMedia('(display-mode: standalone)').matches) {
                alert("DTEHub is already installed on your device!");
            } else {
                alert("To install the app:\n\n1. Check if your browser supports PWAs (Chrome/Edge recommended)\n2. If on mobile, use 'Add to Home Screen' from your browser menu.");
            }
            return;
        }

        try {
            setInstalling(true);
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`DTEHub PWA: Installation outcome: ${outcome}`);
            
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                setIsVisible(false);
            }
        } catch (err) {
            console.error("DTEHub PWA: Installation error:", err);
        } finally {
            setInstalling(false);
        }
    };

    return (
        <button 
            className={`ws-download-app-btn ${installing ? 'installing' : ''}`} 
            onClick={handleInstall}
            disabled={installing}
        >
            <Download size={18} />
            <span>{installing ? 'Installing...' : 'Download the App'}</span>
        </button>
    );
};

export default InstallPWA;
