import { useState, useEffect } from 'react';
import { Search, Download, FileText, Heart, FilterX } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import IframeModal from '../components/IframeModal';
import './Papers.css';

export default function Papers() {
    const { user, addRecentlyViewed, addDownload, toggleFavorite, isFavorited, addSearchQuery } = useAuthContext();
    const [userYear, setUserYear] = useState('');
    const [papersData, setPapersData] = useState([]);
    const [loadingPapers, setLoadingPapers] = useState(true);
    const [viewUrl, setViewUrl] = useState(null);

    useEffect(() => {
        if (user?.uid) {
            const profileRef = ref(database, `users/${user.uid}/profile`);
            const unsubscribe = onValue(profileRef, (snapshot) => {
                const data = snapshot.val();
                if (data && data.year) {
                    setUserYear(data.year);
                }
            });
            return () => unsubscribe();
        } else {
            setUserYear('');
        }
    }, [user]);

    // Fetch Papers from Database
    useEffect(() => {
        const papersRef = ref(database, 'resources/papers');
        const unsubscribe = onValue(papersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const arr = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                setPapersData(arr.reverse());
            } else {
                setPapersData([]);
            }
            setLoadingPapers(false);
        });

        return () => unsubscribe();
    }, []);

    const handleView = (paper) => {
        if (user) {
            addRecentlyViewed({
                itemId: paper.id,
                type: 'paper',
                title: paper.subject,
                year: paper.year,
                paperType: paper.type,
            });
        }
    };

    const handleDownload = (paper) => {
        if (user) {
            addDownload({
                itemId: paper.id,
                type: 'paper',
                title: paper.subject,
                year: paper.year,
                paperType: paper.type,
            });
        }
    };

    const handleFavorite = (paper) => {
        if (user) {
            toggleFavorite({
                itemId: paper.id,
                type: 'paper',
                title: paper.subject,
                year: paper.year,
            });
        }
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter' && user) {
            addSearchQuery(e.target.value);
        }
    };

    const filteredPapers = userYear && userYear !== 'Alumni'
        ? papersData.filter(paper => paper.academicYear === userYear)
        : papersData;

    return (
        <div className="container papers-page">
            <div className="papers-header">
                <div>
                    <h1 className="page-title">Previous Year Question Papers</h1>
                    <p className="page-subtitle">
                        {userYear && userYear !== 'Alumni' 
                            ? `Showing filtered papers for your academic year (${userYear})` 
                            : 'Access and manage academic papers for all courses and years.'}
                    </p>
                </div>

                <div className="papers-filters">
                    <div className="filter-select">
                        <label>Exam Year</label>
                        <select>
                            <option>All Years</option>
                            <option>2023</option>
                            <option>2022</option>
                            <option>2021</option>
                        </select>
                    </div>
                    <div className="filter-select">
                        <label>Select Subject</label>
                        <select>
                            <option>Computer Science</option>
                            <option>Mechanical</option>
                            <option>Electrical</option>
                        </select>
                    </div>

                    <div className="search-bar-modern papers-search">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search papers by code..."
                            onKeyDown={handleSearch}
                        />
                    </div>
                </div>
            </div>

            <div className="card table-container">
                {loadingPapers ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                        <div className="loader"></div>
                    </div>
                ) : filteredPapers.length > 0 ? (
                    <table className="papers-table">
                        <thead>
                            <tr>
                                <th>EXAM YEAR</th>
                                <th>SUBJECT</th>
                                {(!userYear || userYear === 'Alumni') && <th>ACADEMIC YEAR</th>}
                                <th>BRANCH</th>
                                <th className="text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPapers.map(paper => (
                                <tr key={paper.id}>
                                    <td>{paper.year}</td>
                                    <td>
                                        <div className="subject-cell">
                                            <FileText size={16} className="text-muted" />
                                            {paper.title}
                                        </div>
                                    </td>
                                    {(!userYear || userYear === 'Alumni') && (
                                        <td className="text-muted" style={{fontSize: '0.8rem'}}>{paper.academicYear}</td>
                                    )}
                                    <td className="text-muted">{paper.branch}</td>
                                    <td>
                                        <div className="action-buttons">
                                            {user && (
                                                <button
                                                    className={`btn-outline btn-sm btn-icon fav-btn ${isFavorited(paper.id, 'paper') ? 'fav-active' : ''}`}
                                                    onClick={() => handleFavorite(paper)}
                                                    title="Favorite"
                                                >
                                                    <Heart size={14} fill={isFavorited(paper.id, 'paper') ? 'currentColor' : 'none'} />
                                                </button>
                                            )}
                                            <button 
                                                className="btn-outline btn-sm" 
                                                onClick={() => {
                                                    handleView(paper);
                                                    setViewUrl(paper.url);
                                                }}
                                            >
                                                View Source
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                        <FilterX size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <h3>No past papers found for {userYear}</h3>
                        <p>We're continually adding new resources. Check back later!</p>
                    </div>
                )}
            </div>

            {/* In-page Document Viewer */}
            {viewUrl && <IframeModal url={viewUrl} onClose={() => setViewUrl(null)} />}
        </div>
    );
}
