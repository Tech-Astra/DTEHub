import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import './InstallPWA.css';

const InstallPWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            
            // For mobile, show almost immediately (after 1s) to fulfill "always show" request
            // For desktop, keep it at 5s
            const delay = window.innerWidth <= 768 ? 1000 : 5000;
            
            setTimeout(() => {
                const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches;
                // If it's mobile, we bypass the sessionStorage check to make it "always show" above the nav
                if (!isAppInstalled) {
                    if (window.innerWidth <= 768 || !sessionStorage.getItem('pwaPromptHandled')) {
                        setIsVisible(true);
                    }
                }
            }, delay);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsVisible(false);
        sessionStorage.setItem('pwaPromptHandled', 'true');
    };

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('pwaPromptHandled', 'true');
    };

    return (
        <div className={`install-prompt-overlay ${isVisible ? 'visible' : ''}`}>
            <div className="install-prompt-header">
                <div className="install-app-icon">
                    <Download size={24} strokeWidth={3} />
                </div>
                <div className="install-app-info">
                    <h3>DTEHub Experience</h3>
                    <p>Install for a faster, offline-ready academic journey.</p>
                </div>
            </div>
            <div className="install-actions">
                <button className="btn-install-now" onClick={handleInstallClick}>Install App</button>
                <button className="btn-not-now" onClick={handleClose}>Not Now</button>
            </div>
        </div>
    );
};

export default InstallPWA;
