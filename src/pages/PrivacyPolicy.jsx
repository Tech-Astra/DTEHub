import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import './PrivacyPolicy.css';

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
                    <X size={24} />
                </button>

                <h1>Privacy Policy & Disclaimer</h1>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '3rem' }}>
                    Welcome to DTEHub. Please read our resource disclaimer.
                </p>

                <div className="policy-section">
                    <h2>Disclaimer Regarding Resources</h2>
                    <p>
                        The study materials, notes, lab manuals, question papers, and other educational resources provided on DTEHub are primarily sourced from the community and strictly intended for educational and reference purposes.
                    </p>
                    <p>
                        <strong>These are not our official resources.</strong> We do not claim ownership, copyright, or authorship over the documents provided here unless explicitly stated otherwise.
                    </p>
                    <p style={{
                        padding: '1rem',
                        borderLeft: '4px solid var(--accent-color)',
                        background: 'rgba(253, 224, 71, 0.05)',
                        borderRadius: '0 8px 8px 0',
                        marginTop: '1.5rem'
                    }}>
                        <strong>Notice to Authors and Administrators:</strong><br />
                        If you are the author, administrator, institution, or rightful copyright owner of any resource hosted on our platform and you do not wish for it to be publicly available here, please contact us immediately.
                        <strong> If the admin or rightful owner of a resource requests its removal, we will remove it on the spot.</strong>
                    </p>
                </div>

                <div className="policy-section" style={{ marginTop: '3rem' }}>
                    <h2>Contact Information</h2>
                    <p>
                        For any removal requests, copyright disputes, or privacy concerns, please contact us immediately at{' '}
                        <a href="mailto:contactus.techastra@gmail.com" style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>
                            contactus.techastra@gmail.com
                        </a>
                        , and swift action will be taken.
                    </p>
                </div>
            </div>
        </div>
    );
}
