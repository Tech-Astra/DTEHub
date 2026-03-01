import React from 'react';
import DCETCalculator from '../components/DCETCalculator';
import Footer from '../components/Footer';
import './Notes.css';

export default function RankPredictor() {
    return (
        <div className="notes-page-wrapper">
            <div className="notes-search-center">
                <div className="workspace-selectors search-only-global" style={{ textAlign: 'center', border: 'none', background: 'transparent', backdropFilter: 'none', boxShadow: 'none' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--accent-color)', marginBottom: '0.5rem' }}>
                        D-CET Rank Predictor
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                        Calculate your expected DCET rank based on your Diploma CGPA and DCET Marks. 
                        Our algorithm uses previous years' trends to give you an accurate prediction.
                    </p>
                </div>
            </div>

            <div className="container" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
                <DCETCalculator />
            </div>
            
            <Footer />
        </div>
    );
}
