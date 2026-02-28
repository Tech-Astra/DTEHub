import { useState } from 'react';
import { Heart, Send, Sparkles, Share2, MessageSquare, Coffee, Code } from 'lucide-react';
import './Contribute.css';

export default function Contribute() {
    const [formStatus, setFormStatus] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormStatus('sending');
        // Mock submission
        setTimeout(() => {
            setFormStatus('success');
            e.target.reset();
        }, 1500);
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
                            <input type="text" placeholder="e.g. Rahul Kumar" required />
                        </div>
                        
                        <div className="form-group">
                            <label>Content Title</label>
                            <input type="text" placeholder="e.g. OS Module 1" required />
                        </div>

                        <div className="form-group">
                            <label>Resource Link</label>
                            <input type="url" placeholder="https://drive.google.com/..." required />
                        </div>

                        <button type="submit" className="btn-primary w-full" disabled={formStatus === 'sending'}>
                            {formStatus === 'sending' ? 'Sending...' : (
                                <><Send size={18} /> Send Contribution</>
                            )}
                        </button>
                        
                        {formStatus === 'success' && (
                            <div className="success-message">
                                <p>🎉 Received! Thank you for contributing.</p>
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
                        <button className="btn-outline btn-sm" style={{marginTop: '0.5rem'}}>Join as Dev</button>
                    </div>

                    <div className="info-card card">
                        <Share2 className="card-icon" size={24} color="#3b82f6" />
                        <h3>Impact Statistics</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                            <div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white' }}>5K+</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Resources</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white' }}>10K+</div>
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
        </div>
    );
}
