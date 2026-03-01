import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, GraduationCap, Quote, Star, Users, X, MessageSquarePlus } from 'lucide-react';
import { useFirebaseStats } from '../hooks/useFirebaseStats';
import { useAuthContext } from '../context/AuthContext';
import { database } from '../firebase';
import { ref, onValue, push, set } from 'firebase/database';
import Footer from '../components/Footer';
import './Home.css';

// Simple Counter Component for the Stats
const AnimatedCounter = ({ value, label }) => {
    const [count, setCount] = useState(0);
    const countRef = useRef(0);

    useEffect(() => {
        let start = countRef.current;
        const end = parseInt(value) || 0;

        if (start === end) {
            setCount(end);
            return;
        }

        let duration = 2000;
        let increment = (end - start) / (duration / 16);

        const timer = setInterval(() => {
            start += increment;

            // Check if we reached or surpassed the target
            if ((increment > 0 && start >= end) || (increment < 0 && start <= end)) {
                setCount(end);
                countRef.current = end;
                clearInterval(timer);
            } else {
                const newCount = Math.floor(start);
                setCount(newCount);
                countRef.current = newCount;
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <div className="stat-item">
            <h2 className="stat-number">{count}+</h2>
            <p className="stat-label">{label}</p>
        </div>
    );
};

export default function Home() {
    const navigate = useNavigate();
    const { user, loginWithGoogle } = useAuthContext();
    const { stats, loading } = useFirebaseStats();
    const [testimonials, setTestimonials] = useState([]);
    const [selectedTestimonial, setSelectedTestimonial] = useState(null);
    const [isAddingFeedback, setIsAddingFeedback] = useState(false);
    const [feedbackMsg, setFeedbackMsg] = useState('');
    const [college, setCollege] = useState('');
    const [rating, setRating] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const testRef = ref(database, 'testimonials');
        const unsub = onValue(testRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const arr = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                setTestimonials(arr.reverse().slice(0, 10)); // Show latest 10
            }
        });
        return () => unsub();
    }, []);

    const handleAddFeedback = async () => {
        if (!user) {
            loginWithGoogle();
            return;
        }

        if (!feedbackMsg.trim()) return;
        setIsSubmitting(true);

        try {
            const testRef = ref(database, 'testimonials');
            const newEntryRef = push(testRef);
            await set(newEntryRef, {
                name: user.displayName || 'Anonymous student',
                role: 'DTEHub Student',
                college: college.trim() || 'DTEHub Community',
                message: feedbackMsg,
                photoUrl: user.photoURL || '',
                rating: rating,
                timestamp: Date.now()
            });
            setFeedbackMsg('');
            setCollege('');
            setRating(5);
            setIsAddingFeedback(false);
        } catch (err) {
            console.error("Error adding feedback:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="home-container premium-home">
            {/* Central Hero Branding */}
            <main className="home-hero-center">
                <div className="branding-container">
                    <div className="main-text-branding">
                        <h1 className="hub-title-welcome">
                            <span className="welcome-text">Welcome to </span>
                            <span className="dte-text">DTE</span><span className="hub-text">Hub</span>
                        </h1>
                    </div>
                    <p className="hero-tagline">
                        The ultimate study hub for Diploma students. Access premium notes, past question papers, and DCET Question papers from trusted academic resources—all centralized for your success.
                    </p>

                    <button 
                        className="btn-explore" 
                        onClick={() => navigate('/notes')}
                    >
                        Explore All Resources <ArrowRight size={20} />
                    </button>

                    <div className="home-stats-bar">
                        <AnimatedCounter value={stats.visits} label="Total Visits" />
                        <div className="stat-divider"></div>
                        <AnimatedCounter value={stats.users} label="Verified Users" />
                        <div className="stat-divider"></div>
                        <AnimatedCounter value={stats.resources} label="Available Resources" />
                    </div>                </div>
            </main>

            {/* What People Say - Scrolling Marquee Section */}
            {testimonials.length > 0 && (
                <section className="testimonials-marquee-section">
                    <div className="marquee-container">
                        <div className="testimonials-header">
                            <div className="header-left-marquee">
                                <span className="prompt-arrow">&gt;</span>
                                <h2 className="marquee-title">What People Say</h2>
                            </div>
                            <button 
                                className="btn-add-testimonial"
                                onClick={() => setIsAddingFeedback(true)}
                            >
                                <MessageSquarePlus size={18} />
                                <span>Give Feedback</span>
                            </button>
                        </div>

                        {/* Row 1: Left Moving */}
                        <div className="marquee-wrapper">
                            <div className="marquee-track track-left">
                                {[...testimonials, ...testimonials].map((test, i) => (
                                    <div 
                                        key={`row1-${i}`} 
                                        className="marquee-card"
                                        onClick={() => setSelectedTestimonial(test)}
                                    >
                                        <div className="card-inner">
                                            <div className="user-avatar-circle">
                                                {test.photoUrl ? <img src={test.photoUrl} alt={test.name} /> : <Users size={14} />}
                                            </div>
                                            <div className="card-content-mini">
                                                <p className="test-msg-mini">"{test.message}"</p>
                                                <span className="test-name-mini">{test.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Row 2: Right Moving */}
                        <div className="marquee-wrapper">
                            <div className="marquee-track track-right">
                                {[...testimonials, ...testimonials].reverse().map((test, i) => (
                                    <div 
                                        key={`row2-${i}`} 
                                        className="marquee-card"
                                        onClick={() => setSelectedTestimonial(test)}
                                    >
                                        <div className="card-inner">
                                            <div className="user-avatar-circle">
                                                {test.photoUrl ? <img src={test.photoUrl} alt={test.name} /> : <Users size={14} />}
                                            </div>
                                            <div className="card-content-mini">
                                                <p className="test-msg-mini">"{test.message}"</p>
                                                <span className="test-name-mini">{test.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Testimonial Pop-up Modal */}
            {selectedTestimonial && (
                <div className="test-modal-overlay" onClick={() => setSelectedTestimonial(null)}>
                    <div className="test-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="test-modal-close" onClick={() => setSelectedTestimonial(null)}><X size={20} /></button>
                        <div className="test-modal-header">
                            <div className="test-modal-avatar">
                                {selectedTestimonial.photoUrl ? (
                                    <img src={selectedTestimonial.photoUrl} alt={selectedTestimonial.name} />
                                ) : (
                                    <Users size={32} />
                                )}
                            </div>
                            <div className="test-modal-info">
                                <h3>{selectedTestimonial.name}</h3>
                                <p className="test-modal-role">{selectedTestimonial.role}</p>
                                {selectedTestimonial.college && (
                                    <p className="test-modal-college">
                                        <GraduationCap size={14} />
                                        {selectedTestimonial.college}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="test-modal-body">
                            <Quote className="quote-icon-modal" size={32} />
                            <p className="full-test-message">{selectedTestimonial.message}</p>
                            <div className="test-modal-footer">
                                <div className="test-modal-stars">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} fill="var(--accent-color)" color="var(--accent-color)" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Feedback Modal */}
            {isAddingFeedback && (
                <div className="test-modal-overlay" onClick={() => setIsAddingFeedback(false)}>
                    <div className="test-modal-content feedback-modal" onClick={e => e.stopPropagation()}>
                        <button className="test-modal-close" onClick={() => setIsAddingFeedback(false)}><X size={20} /></button>
                        <div className="section-header-left">
                            <span className="premium-badge">COMMUNITY HUB</span>
                            <h2 className="modal-title-premium">Share your journey</h2>
                        </div>

                        {!user ? (
                            <div className="login-prompt-feedback">
                                <p>Please login to leave a testimonial about DTEHub.</p>
                                <button className="btn-primary" onClick={loginWithGoogle}>Login with Google</button>
                            </div>
                        ) : (
                            <div className="feedback-form-compact">
                                <div className="user-indicator-feedback">
                                    <div className="test-modal-avatar">
                                        <img src={user.photoURL} alt={user.displayName} />
                                    </div>
                                    <div>
                                        <strong>{user.displayName}</strong>
                                        <p>Contribution from DTEHub Alumnus</p>
                                    </div>
                                </div>

                                <div className="feedback-input-group">
                                    <label className="rating-label-feedback">Your College Name</label>
                                    <input 
                                        type="text" 
                                        className="feedback-input-text"
                                        placeholder="e.g. Government Polytechnic, Bangalore"
                                        value={college}
                                        onChange={(e) => setCollege(e.target.value)}
                                    />
                                </div>
                                
                                <div>
                                    <p className="rating-label-feedback">Rate your experience</p>
                                    <div className="star-rating-selector">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className={`star-select-btn ${star <= rating ? 'active' : ''}`}
                                            >
                                                <Star 
                                                    size={24} 
                                                    fill={star <= rating ? "var(--accent-color)" : "transparent"} 
                                                    color={star <= rating ? "var(--accent-color)" : "rgba(255,255,255,0.2)"}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <textarea 
                                    className="feedback-textarea"
                                    placeholder="Tell others how DTEHub helped you in your academics..."
                                    value={feedbackMsg}
                                    onChange={(e) => setFeedbackMsg(e.target.value)}
                                    maxLength={200}
                                />
                                <div className="char-count">{feedbackMsg.length}/200</div>

                                <button 
                                    className="btn-submit-feedback"
                                    disabled={!feedbackMsg.trim() || !college.trim() || isSubmitting}
                                    onClick={handleAddFeedback}
                                >
                                    {isSubmitting ? 'Posting student voice...' : 'Publish Feedback'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
