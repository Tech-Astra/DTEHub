import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, LogOut, Home, FileText, ScrollText, Zap, Heart } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import '../App.css';

export default function Navbar() {
    const location = useLocation();
    const { user, loading, loginWithGoogle, logout } = useAuthContext();

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <>
            {/* Top Navbar */}
            <nav className="navbar">
                <div className="container nav-container">
                    <Link to="/" className="logo-link">
                        <GraduationCap size={28} color="var(--accent-hover)" />
                        <span>DTEHub</span>
                    </Link>

                    {/* Desktop nav links */}
                    <div className="nav-links nav-desktop-only">
                        <Link to="/" className={`nav-item ${isActive('/')}`}>Home</Link>
                        <Link to="/notes" className={`nav-item ${isActive('/notes')}`}>Notes</Link>
                        <Link to="/papers" className={`nav-item ${isActive('/papers')}`}>Past Papers</Link>
                        <Link to="/dcet" className={`nav-item ${isActive('/dcet')}`}>DCET</Link>
                        <Link to="/contribute" className={`nav-item ${isActive('/contribute')}`}>Contribution</Link>
                    </div>

                    {/* Auth section — always visible */}
                    <div className="nav-auth-area">
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
                    <span>Notes</span>
                </Link>
                <Link to="/papers" className={`mobile-nav-item ${isActive('/papers')}`}>
                    <ScrollText size={20} />
                    <span>Papers</span>
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
