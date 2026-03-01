import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Linkedin, Github, X } from 'lucide-react';
import '../App.css';
import './Footer.css';

export default function Footer() {
    const [isContactOpen, setIsContactOpen] = useState(false);

    return (
        <>
            <footer className="footer">
                <div className="container footer-content">
                    <div className="footer-links">
                        <button onClick={() => setIsContactOpen(true)} className="footer-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
                            Contact
                        </button>
                        <Link to="/privacy" className="footer-link">Privacy Policy</Link>
                    </div>
                    <center>
                        <div className="footer-copyright">
                            DTEHub.
                        </div>
                    </center>
                </div>
            </footer>

            {/* Contact Modal */}
            {isContactOpen && (
                <div className="footer-modal-overlay" onClick={() => setIsContactOpen(false)}>
                    <div className="footer-modal" onClick={e => e.stopPropagation()}>
                        <button className="footer-modal-close" onClick={() => setIsContactOpen(false)}>
                            <X size={20} />
                        </button>

                        <h2>Get in Touch</h2>
                        <p>We'd love to hear from you. Reach out through any of these platforms:</p>

                        <div className="contact-links-grid">
                            <a href="https://www.linkedin.com/company/tech-astra/" target="_blank" rel="noopener noreferrer" className="contact-link-item">
                                <div className="contact-icon-wrapper">
                                    <Linkedin size={20} />
                                </div>
                                <span>LinkedIn</span>
                            </a>
                            <a href="https://github.com/Tech-Astra/DTEHub" target="_blank" rel="noopener noreferrer" className="contact-link-item">
                                <div className="contact-icon-wrapper">
                                    <Github size={20} />
                                </div>
                                <span>GitHub</span>
                            </a>
                            <a href="mailto:contactus.techastra@gmail.com" className="contact-link-item">
                                <div className="contact-icon-wrapper">
                                    <Mail size={20} />
                                </div>
                                <span>Email Us</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
