import { useState } from 'react';
import { Heart, Send, Share2, Coffee, Code } from 'lucide-react';
import { useFirebaseStats } from '../hooks/useFirebaseStats';
import './Contribute.css';

export default function Contribute() {
    const [formStatus, setFormStatus] = useState(null);
    const [isDevModalOpen, setIsDevModalOpen] = useState(false);
    const [devFormStatus, setDevFormStatus] = useState(null);
    const { stats, loading } = useFirebaseStats();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormStatus('sending');

        try {
            const formData = new FormData(e.target);
            formData.append("_subject", "New Contribution on DTEHub!");
            formData.append("_captcha", "false");
            formData.append("_template", "box");

            const response = await fetch("https://formsubmit.co/ajax/contactus.techastra@gmail.com", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                setFormStatus('success');
                e.target.reset();
                setTimeout(() => setFormStatus(null), 5000);
            } else {
                setFormStatus('error');
                setTimeout(() => setFormStatus(null), 5000);
            }
        } catch (error) {
            console.error("Form submission error:", error);
            setFormStatus('error');
            setTimeout(() => setFormStatus(null), 5000);
        }
    };

    const handleDevSubmit = async (e) => {
        e.preventDefault();
        setDevFormStatus('sending');

        try {
            const formData = new FormData(e.target);
            formData.append("_subject", "Open for Dev");
            formData.append("_captcha", "false");
            formData.append("_template", "box");

            const response = await fetch("https://formsubmit.co/ajax/contactus.techastra@gmail.com", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                setDevFormStatus('success');
                e.target.reset();
                setTimeout(() => {
                    setDevFormStatus(null);
                    setIsDevModalOpen(false);
                }, 3000);
            } else {
                setDevFormStatus('error');
                setTimeout(() => setDevFormStatus(null), 5000);
            }
        } catch (error) {
            console.error("Dev form submission error:", error);
            setDevFormStatus('error');
            setTimeout(() => setDevFormStatus(null), 5000);
        }
    };


    return (
        <div className="container contribute-page">
            <header className="contribute-header text-center">
                <div className="icon-badge">
                    <Heart size={32} fill="var(--accent-color)" color="var(--accent-color)" />
                </div>
                <h1 className="page-title">Contribute to DTEHub</h1>
                <p className="page-subtitle">Help us grow and help thousands of fellow diploma students. Your contribution matters!</p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--accent-color)', opacity: 0.8 }}>
                    Developed by <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>TechAstra</span>
                </p>
            </header>

            <div className="contribute-grid">
                {/* Left Side: Submission Form */}
                <section className="contribute-form-container card">
                    <h3>Submit Content</h3>
                    <p className="text-muted mb-4">Share notes, papers, or resources with the community.</p>

                    <form className="contribute-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Your Name</label>
                            <input type="text" name="name" placeholder="e.g. Rahul Kumar" required />
                        </div>

                        <div className="form-group">
                            <label>Content Title</label>
                            <input type="text" name="title" placeholder="e.g. OS Module 1" required />
                        </div>

                        <div className="form-group">
                            <label>Resource Link</label>
                            <input type="url" name="link" placeholder="https://drive.google.com/..." required />
                        </div>

                        <button type="submit" className="btn-primary w-full" disabled={formStatus === 'sending'}>
                            {formStatus === 'sending' ? 'Sending...' : (
                                <><Send size={18} /> Send Contribution</>
                            )}
                        </button>

                        {formStatus === 'success' && (
                            <div className="success-message">
                                <p>Received! Thank you for contributing.</p>
                            </div>
                        )}
                        {formStatus === 'error' && (
                            <div className="error-message" style={{ color: '#ef4444', marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
                                <p>Failed to send. Please try again later.</p>
                            </div>
                        )}
                    </form>
                </section>

                {/* Right Side: Development Info */}
                <section className="contribute-info">
                    <div className="info-card card highlight-card">
                        <div className="dev-badge">TECHASTR A</div>
                        <h3>Development & Tech</h3>
                        <p>DTEHub is an open-initiative project focused on digitizing diploma education. Built with modern web technologies, we're constantly evolving.</p>

                        <div className="tech-stack-mini">
                            <span className="tech-tag">React</span>
                            <span className="tech-tag">Firebase</span>
                            <span className="tech-tag">Vite</span>
                            <span className="tech-tag">Lucide</span>
                        </div>
                    </div>

                    <div className="info-card card">
                        <Code className="card-icon" size={24} color="var(--accent-color)" />
                        <h3>Open for Developers</h3>
                        <p>Are you a coder? Help us improve the codebase, fix UI bugs, or add new features. We value clean code and great UX.</p>
                        <button className="btn-outline btn-sm" style={{ marginTop: '0.5rem' }} onClick={() => setIsDevModalOpen(true)}>Join as Dev</button>
                    </div>

                    <div className="info-card card">
                        <Share2 className="card-icon" size={24} color="#3b82f6" />
                        <h3>Impact Statistics</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                            <div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white' }}>
                                    {loading ? '...' : stats.totalResources}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Resources</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white' }}>
                                    {loading ? '...' : stats.totalVerifiedUsers}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Users</div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Support Section */}
            <section className="support-section card text-center">
                <Coffee size={40} color="#f59e0b" />
                <h2>Support DTEHub</h2>
                <p>Maintenance and hosting require resources. If you find this platform helpful, consider supporting the core development team at TechAstra.</p>
            </section>

            {/* Join as Dev Modal */}
            {isDevModalOpen && (
                <div className="dev-modal-overlay" onClick={() => setIsDevModalOpen(false)}>
                    <div className="dev-modal-content card" onClick={(e) => e.stopPropagation()}>
                        <div className="dev-modal-header">
                            <h3>Join as Developer</h3>
                            <button className="close-btn" onClick={() => setIsDevModalOpen(false)}>&times;</button>
                        </div>
                        <form className="contribute-form dev-modal-form" onSubmit={handleDevSubmit} encType="multipart/form-data">
                            <div className="form-group">
                                <label>Your Name</label>
                                <input type="text" name="name" placeholder="E.g. John Doe" required />
                            </div>
                            <div className="form-group">
                                <label>College Name</label>
                                <input type="text" name="college" placeholder="Your College" required />
                            </div>
                            <div className="form-group">
                                <label>USN</label>
                                <input type="text" name="usn" placeholder="e.g. 1AB23CS001" required />
                            </div>
                            <div className="form-group">
                                <label>Email ID</label>
                                <input type="email" name="email" placeholder="john@example.com" required />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="tel" name="phone" placeholder="+91 9876543210" required />
                            </div>
                            <div className="form-group">
                                <label>Resume Upload</label>
                                <input type="file" name="resume" accept=".pdf,.doc,.docx" required className="file-input" />
                            </div>

                            <button type="submit" className="btn-primary w-full" disabled={devFormStatus === 'sending'} style={{ marginTop: '1rem' }}>
                                {devFormStatus === 'sending' ? 'Sending Application...' : (
                                    <><Send size={18} /> Submit Application</>
                                )}
                            </button>

                            {devFormStatus === 'success' && (
                                <div className="success-message" style={{ marginTop: '1rem' }}>
                                    <p>Application sent successfully! We'll be in touch.</p>
                                </div>
                            )}
                            {devFormStatus === 'error' && (
                                <div className="error-message" style={{ color: '#ef4444', marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
                                    <p>Failed to send application. Please try again later.</p>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
