import React, { useState, useEffect } from 'react';
import { Calculator, CheckCircle2, Info } from 'lucide-react';
import './DCETCalculator.css';

const DCETCalculator = () => {
    const [cgpa, setCgpa] = useState('');
    const [dcetMarks, setDcetMarks] = useState('');
    const [diplomaPercent, setDiplomaPercent] = useState('0.00');
    const [combinedMarks, setCombinedMarks] = useState('0.00');
    const [predictedRank, setPredictedRank] = useState(null);
    const [showResult, setShowResult] = useState(false);

    // States for intermediate steps
    const [dipScore50, setDipScore50] = useState('0.00');
    const [dcetScore50, setDcetScore50] = useState('0.00');

    // Calculate Diploma % and Combined Marks whenever inputs change
    useEffect(() => {
        const cgpaVal = parseFloat(cgpa) || 0;
        const dcetVal = parseFloat(dcetMarks) || 0;

        // Step 1: Converted CGPA = (CGPA - 0.75) * 10
        const percent = Math.max(0, (cgpaVal - 0.75) * 10).toFixed(2);
        setDiplomaPercent(percent);

        // Step 2: Weightage split (50/50)
        const dip50 = (parseFloat(percent) / 2).toFixed(2);
        const dcet50 = (dcetVal / 2).toFixed(2);
        
        setDipScore50(dip50);
        setDcetScore50(dcet50);

        // Final Score = Sum of both
        const combined = (parseFloat(dip50) + parseFloat(dcet50)).toFixed(2);
        setCombinedMarks(combined);
    }, [cgpa, dcetMarks]);

    const calculateRank = () => {
        const score = parseFloat(combinedMarks);
        let rankRange = "";

        // Standard Rank Thresholds (Based on 100 Max Score)
        if (score >= 96) rankRange = "1 - 10";
        else if (score >= 94) rankRange = "11 - 50";
        else if (score >= 92) rankRange = "51 - 100";
        else if (score >= 90) rankRange = "101 - 250";
        else if (score >= 85) rankRange = "251 - 1000";
        else if (score >= 80) rankRange = "1001 - 2500";
        else if (score >= 75) rankRange = "2501 - 6000";
        else if (score >= 70) rankRange = "6001 - 12000";
        else if (score >= 60) rankRange = "12001 - 22000";
        else if (score >= 50) rankRange = "22001 - 45000";
        else if (score > 0) rankRange = "45000+";
        else rankRange = "N/A";

        if (score > 0) {
            setPredictedRank(rankRange);
            setShowResult(true);
        }
    };

    return (
        <div className="dcet-calculator-card">
            <header className="calculator-header">
                <div className="calculator-icon">
                    <Calculator size={24} strokeWidth={2.5} />
                </div>
                <h2 className="calculator-title">D-CET Rank Predictor</h2>
            </header>

            <div className="input-grid-calculator">
                <div className="calc-input-group">
                    <label htmlFor="cgpa-input">Diploma CGPA (0-10)</label>
                    <input
                        id="cgpa-input"
                        type="number"
                        className="calc-input-field"
                        placeholder="Eg: 9.83"
                        value={cgpa}
                        onChange={(e) => setCgpa(e.target.value)}
                        max="10"
                        min="0"
                        step="0.01"
                    />
                </div>

                <div className="calc-input-group">
                    <label htmlFor="dcet-input">DCET Marks (0-100)</label>
                    <input
                        id="dcet-input"
                        type="number"
                        className="calc-input-field"
                        placeholder="Eg: 94"
                        value={dcetMarks}
                        onChange={(e) => setDcetMarks(e.target.value)}
                        max="100"
                        min="0"
                    />
                </div>

                <div className="calc-input-group">
                    <label>Diploma Score (50%)</label>
                    <input
                        type="text"
                        className="calc-input-field"
                        value={dipScore50}
                        disabled
                        readOnly
                    />
                </div>

                <div className="calc-input-group">
                    <label>DCET Score (50%)</label>
                    <input
                        type="text"
                        className="calc-input-field"
                        value={dcetScore50}
                        disabled
                        readOnly
                    />
                </div>
            </div>

            <div className="final-score-overview" style={{ 
                marginBottom: '1.5rem', 
                padding: '1rem', 
                background: 'rgba(255,255,255,0.03)', 
                borderRadius: '12px',
                border: '1px dashed rgba(255,255,255,0.1)',
                textAlign: 'center'
            }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Combined Score</span>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-color)', marginTop: '0.25rem' }}>{combinedMarks} / 100</div>
            </div>

            <button 
                className="btn-calculate-rank"
                onClick={calculateRank}
                disabled={!cgpa || !dcetMarks}
            >
                <CheckCircle2 size={20} />
                Check Predicted Rank
            </button>

            {showResult && (
                <div className="rank-result-container">
                    <p className="result-label">"Your Predicted DCET Rank Range"</p>
                    <div className="rank-range-display">
                        ( {predictedRank} )
                    </div>
                    <div className="academy-wish">
                        DTEHub Wishes All the best for your Results!
                    </div>
                    <p className="calculator-disclaimer">
                        <Info size={14} style={{ marginRight: '0.4rem', marginBottom: '-2px' }} />
                        Note: This is estimated DCET rank generated based on previous year results. Actual rank may vary slightly.
                    </p>
                </div>
            )}
        </div>
    );
};

export default DCETCalculator;
