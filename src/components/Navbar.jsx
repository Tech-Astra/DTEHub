import { Link, useLocation } from 'react-router-dom';
import { BookOpen, GraduationCap } from 'lucide-react';
import '../App.css';

export default function Navbar() {
    const location = useLocation();

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
                    <button className="btn-primary">Sign In</button>
                </div>
            </div>
        </nav>
    );
}
