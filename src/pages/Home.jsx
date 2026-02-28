import { Search, MonitorPlay, Settings, Cpu } from 'lucide-react';
import './Home.css';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();

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

// Just importing graduation cap ad-hoc as well
import { GraduationCap } from 'lucide-react';
