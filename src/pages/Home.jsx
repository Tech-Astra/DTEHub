import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useFirebaseStats } from '../hooks/useFirebaseStats';
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
    const { stats, loading } = useFirebaseStats();

    return (
        <div className="home-container premium-home">
            {/* Central Hero Branding */}
            <main className="home-hero-center">
                <div className="branding-container">
                    <div className="main-logo-flex">
                        <div className="hero-logo-wrapper">
                            <img src="/favicon.png" alt="DTE Hub" className="hero-main-logo" />
                        </div>
                        <div className="rv-divider" />
                        <h1 className="hub-title">DTE<span style={{ color: 'var(--accent-color)' }}>Hub</span></h1>
                    </div>
                    <p className="hero-tagline">
                        The ultimate study hub for DTE students. Access premium notes, past question papers, and trusted academic resources—all centralized for your success.
                    </p>

                    <button className="btn-explore" onClick={() => navigate('/notes')}>
                        Explore All Resources <ArrowRight size={20} />
                    </button>
                    <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
                        Continuously updated for the current semester
                    </p>

                    {/* Live Stats Bar */}
                    <div className="home-stats-bar">
                        <AnimatedCounter value={stats.totalResources} label="TOTAL RESOURCES" />
                        <div className="stat-divider" />
                        <AnimatedCounter value={stats.totalViews} label="TOTAL VISITS" />
                        <div className="stat-divider" />
                        <AnimatedCounter value={stats.totalVerifiedUsers} label="VERIFIED USERS" />
                    </div>
                </div>
            </main>
        </div>
    );
}
