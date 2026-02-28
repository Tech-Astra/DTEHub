import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, LogOut, User } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import '../App.css';

export default function Navbar() {
    const location = useLocation();
    const { user, loading, loginWithGoogle, logout } = useAuthContext();

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar">
            <div className="container nav-container">
                <Link to="/" className="logo-link">
                    <GraduationCap size={28} color="var(--accent-hover)" />
                    <span>DTE_Utility</span>
                </Link>
                <div className="nav-links">
                    <Link to="/" className={`nav-item ${isActive('/')}`}>Home</Link>
                    <Link to="/notes" className={`nav-item ${isActive('/notes')}`}>Notes</Link>
                    <Link to="/papers" className={`nav-item ${isActive('/papers')}`}>Past Papers</Link>
                    <Link to="#" className="nav-item">Syllabus</Link>

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
    );
}
