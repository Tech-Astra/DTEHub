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

    // Calculate Diploma % and Combined Marks whenever inputs change
    useEffect(() => {
        const cgpaVal = parseFloat(cgpa) || 0;
        const dcetVal = parseFloat(dcetMarks) || 0;

        // Formula: (CGPA - 0.75) * 10 = Diploma %
        const percent = Math.max(0, (cgpaVal - 0.75) * 10).toFixed(2);
        setDiplomaPercent(percent);

        // Combined Marks = (Diploma % / 2) + (DCET Score / 2)
        // This assumes Max DCET Score is 100.
        const combined = ((parseFloat(percent) / 2) + (dcetVal / 2)).toFixed(2);
        setCombinedMarks(combined);
    }, [cgpa, dcetMarks]);

    const calculateRank = () => {
        const score = parseFloat(combinedMarks);
        let rankRange = "";

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
                        placeholder="Eg: 9.83 (Cumulative)"
                        value={cgpa}
                        onChange={(e) => setCgpa(e.target.value)}
                        max="10"
                        min="0"
                        step="0.01"
                    />
                </div>

                <div className="calc-input-group">
                    <label htmlFor="dcet-input">DCET Marks</label>
                    <input
                        id="dcet-input"
                        type="number"
                        className="calc-input-field"
                        placeholder="Eg: 94 (Out of 100)"
                        value={dcetMarks}
                        onChange={(e) => setDcetMarks(e.target.value)}
                        max="100"
                        min="0"
                    />
                </div>

                <div className="calc-input-group">
                    <label>Diploma %</label>
                    <input
                        type="text"
                        className="calc-input-field"
                        value={diplomaPercent}
                        disabled
                        readOnly
                    />
                </div>

                <div className="calc-input-group">
                    <label>Calculated Marks for DCET Rank</label>
                    <input
                        type="text"
                        className="calc-input-field"
                        value={combinedMarks}
                        disabled
                        readOnly
                    />
                </div>
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
