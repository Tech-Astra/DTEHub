import { Facebook, Twitter, Instagram } from 'lucide-react';
import '../App.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container footer-content">
                <div className="footer-links">
                    <a href="#" className="footer-link">Contact</a>
                    <a href="#" className="footer-link">Privacy Policy</a>
                </div>
                <center>
                    <div className="footer-copyright">
                        DTEHub.
                    </div>
                </center>
            </div>
        </footer>
    );
}
