import { Search, MonitorPlay, Settings, Cpu, GraduationCap, Eye, FolderOpen, UserCheck } from 'lucide-react';
import './Home.css';
import { useNavigate } from 'react-router-dom';
import { useFirebaseStats } from '../hooks/useFirebaseStats';
import { useState, useEffect, useRef } from 'react';

function AnimatedCounter({ target, duration = 2000 }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current && target > 0) {
                    hasAnimated.current = true;
                    let start = 0;
                    const increment = target / (duration / 16);
                    const timer = setInterval(() => {
                        start += increment;
                        if (start >= target) {
                            setCount(target);
                            clearInterval(timer);
                        } else {
                            setCount(Math.floor(start));
                        }
                    }, 16);
                }
            },
            { threshold: 0.3 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target, duration]);

    return <span ref={ref}>{count.toLocaleString()}</span>;
}

export default function Home() {
    const navigate = useNavigate();
    const { stats, loading } = useFirebaseStats();

    return (
        <div className="home-container container">
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Empowering Your<br />Diploma Journey.</h1>
                    <p className="hero-subtitle">Your ultimate resource for notes, past papers, and academic success.</p>

                    <div className="search-bar-container">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            className="main-search-input"
                            placeholder="Find Notes or Past Papers..."
                        />
                        <button className="btn-primary search-btn" onClick={() => navigate('/notes')}>Search</button>
                    </div>
                </div>
            </section>

            {/* Live Stats Section */}
            <section className="stats-section" id="platform-stats">
                <div className="stats-grid">
                    <div className="stat-card stat-card--views">
                        <div className="stat-icon-wrapper stat-icon--views">
                            <Eye size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">
                                {loading ? <span className="stat-skeleton" /> : <AnimatedCounter target={stats.totalViews} />}
                            </span>
                            <span className="stat-label">Total Views</span>
                        </div>
                        <div className="stat-glow stat-glow--views" />
                    </div>

                    <div className="stat-card stat-card--resources">
                        <div className="stat-icon-wrapper stat-icon--resources">
                            <FolderOpen size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">
                                {loading ? <span className="stat-skeleton" /> : <AnimatedCounter target={stats.totalResources} />}
                            </span>
                            <span className="stat-label">Total Resources</span>
                        </div>
                        <div className="stat-glow stat-glow--resources" />
                    </div>

                    <div className="stat-card stat-card--users">
                        <div className="stat-icon-wrapper stat-icon--users">
                            <UserCheck size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">
                                {loading ? <span className="stat-skeleton" /> : <AnimatedCounter target={stats.totalVerifiedUsers} />}
                            </span>
                            <span className="stat-label">Verified Users</span>
                        </div>
                        <div className="stat-glow stat-glow--users" />
                    </div>
                </div>
            </section>

            <section className="branches-section">
                <h2 className="section-title">Explore by Engineering Branch</h2>
                <div className="branches-grid">
                    <div className="branch-card card">
                        <div className="branch-icon-container">
                            <Settings size={28} />
                        </div>
                        <h3 className="branch-name">Mechanical Engg.</h3>
                        <p className="branch-desc">Explore mechanical components and physics.</p>
                    </div>
                    <div className="branch-card card">
                        <div className="branch-icon-container">
                            <MonitorPlay size={28} />
                        </div>
                        <h3 className="branch-name">Computer Science</h3>
                        <p className="branch-desc">Learn coding, algorithms, and software.</p>
                    </div>
                    <div className="branch-card card">
                        <div className="branch-icon-container">
                            <Cpu size={28} />
                        </div>
                        <h3 className="branch-name">Electrical Engg.</h3>
                        <p className="branch-desc">Study circuits, power, and electronics.</p>
                    </div>
                    <div className="branch-card card">
                        <div className="branch-icon-container">
                            <GraduationCap size={28} />
                        </div>
                        <h3 className="branch-name">Civil Engg.</h3>
                        <p className="branch-desc">Building structures and environment.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
