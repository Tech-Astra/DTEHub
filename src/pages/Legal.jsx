import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import './Legal.css';

export default function PrivacyPolicy() {
    const navigate = useNavigate();

    return (
        <div className="privacy-container premium-home">
            <div className="privacy-content card">
                <button
                    className="privacy-close-btn"
                    onClick={() => navigate(-1)}
                    aria-label="Close Privacy Policy"
                >
                    <X size={20} />
                </button>

                <div className="privacy-header">
                    <h1>Privacy Policy & Disclaimer</h1>
                    <p className="privacy-subtitle">
                        Please read our resource disclosure & legal notice.
                    </p>
                </div>

                <div className="policy-grid">
                    <div className="policy-section main-disclaimer">
                        <h2>Disclaimer Regarding Resources</h2>
                        <p>
                            All study materials (Notes, Lab Manuals, Papers) are primarily <strong>community-sourced</strong> for educational & reference purposes only.
                        </p>
                        <p>
                            We do not claim ownership or authorship unless explicitly stated. These are <strong>not our official resources</strong>.
                        </p>
                        
                        <div className="notice-box">
                            <p>
                                <strong>Notice to Rightful Owners:</strong> If you own any resource here and want it removed, contact us. <strong>Requests are handled immediately.</strong>
                            </p>
                        </div>
                    </div>

                    <div className="policy-section contact-card">
                        <h2>Legal & Contact</h2>
                        <p>
                            For removals, copyright, or privacy concerns:
                        </p>
                        <a href="mailto:contactus.techastra@gmail.com" className="contact-email-btn">
                            contactus.techastra@gmail.com
                        </a>
                        <p className="swift-action-text">Swift action guaranteed.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
