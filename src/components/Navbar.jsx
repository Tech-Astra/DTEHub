import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, LogOut, Home, FileText, ScrollText, Zap, Heart, Github, Star } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import '../App.css';

export default function Navbar() {
    const location = useLocation();
    const { user, loading, loginWithGoogle, logout } = useAuthContext();
    const [repoStars, setRepoStars] = useState(null);

    useEffect(() => {
        fetch('https://api.github.com/repos/Tech-Astra/DTEHub')
            .then(res => res.json())
            .then(data => {
                if (data.stargazers_count !== undefined) {
                    setRepoStars(data.stargazers_count);
                }
            })
            .catch(err => console.error("Error fetching stars:", err));
    }, []);

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <>
            {/* Top Navbar */}
            <nav className="navbar">
                <div className="container nav-container">
                    <Link to="/" className="logo-link">
                        <span>DTE<span style={{ color: 'var(--accent-color)' }}>Hub</span></span>
                    </Link>

                    {/* Desktop nav links */}
                    <div className="nav-links nav-desktop-only">
                        <Link to="/" className={`nav-item ${isActive('/')}`}>Home</Link>
                        <Link to="/notes" className={`nav-item ${isActive('/notes')}`}>Resources</Link>
                        <Link to="/dcet" className={`nav-item ${isActive('/dcet')}`}>DCET</Link>
                        <Link to="/contribute" className={`nav-item ${isActive('/contribute')}`}>Contribution</Link>
                    </div>

                    {/* Controls & Auth section */}
                    <div className="nav-auth-area" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <a 
                            href="https://github.com/Tech-Astra/DTEHub" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="repo-stars-pill"
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5rem', 
                                padding: '0.4rem 0.8rem', 
                                borderRadius: '100px', 
                                background: '#ffffff',
                                color: '#000000',
                                textDecoration: 'none',
                                fontWeight: '700',
                                fontSize: '0.9rem',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                            title="View on GitHub"
                        >
                            <Github size={18} />
                            {repoStars !== null && <span>{repoStars}</span>}
                        </a>



                        {loading ? (
                            <span className="nav-auth-skeleton" />
                        ) : user ? (
                            <div className="nav-user-section">
                                <Link to="/profile" className="nav-profile-link">
                                    <img
                                        src={user.photoURL}
                                        alt={user.displayName}
                                        className="nav-avatar"
                                        referrerPolicy="no-referrer"
                                    />
                                    <span className="nav-username">{user.displayName?.split(' ')[0]}</span>
                                </Link>
                                <button className="btn-outline nav-logout-btn" onClick={logout} title="Sign out">
                                    <LogOut size={16} />
                                </button>
                            </div>
                        ) : (
                            <button className="btn-primary" onClick={loginWithGoogle}>Sign In</button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Navigation */}
            <nav className="mobile-bottom-nav">
                <Link to="/" className={`mobile-nav-item ${isActive('/')}`}>
                    <Home size={20} />
                    <span>Home</span>
                </Link>
                <Link to="/notes" className={`mobile-nav-item ${isActive('/notes')}`}>
                    <FileText size={20} />
                    <span>Notes & Papers</span>
                </Link>
                <Link to="/dcet" className={`mobile-nav-item ${isActive('/dcet')}`}>
                    <Zap size={20} />
                    <span>DCET</span>
                </Link>
                <Link to="/contribute" className={`mobile-nav-item ${isActive('/contribute')}`}>
                    <Heart size={20} />
                    <span>Contribution</span>
                </Link>
            </nav>
        </>
    );
}
