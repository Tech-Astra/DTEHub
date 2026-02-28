import { Facebook, Twitter, Instagram } from 'lucide-react';
import '../App.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container footer-content">
                <div className="footer-links">
                    <a href="#" className="footer-link">About</a>
                    <a href="#" className="footer-link">Contact</a>
                    <a href="#" className="footer-link">Privacy Policy</a>
                </div>
                <div className="footer-copyright">
                    &copy; {new Date().getFullYear()} DTEHub. All rights reserved.
                </div>
                <div className="footer-socials" style={{ display: 'flex', gap: '1rem' }}>
                    <a href="#" className="footer-link"><Facebook size={20} /></a>
                    <a href="#" className="footer-link"><Twitter size={20} /></a>
                    <a href="#" className="footer-link"><Instagram size={20} /></a>
                </div>
            </div>
        </footer>
    );
}
