import { useState, useEffect } from 'react';
import { Search, Download, FileText, Heart, FilterX, Folder, Plus, Eye } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import CustomSelect from '../components/CustomSelect';
import IframeModal from '../components/IframeModal';
import { Filter, ChevronDown } from 'lucide-react';
import './Papers.css';

export default function Papers() {
    const { user, addRecentlyViewed, addDownload, toggleFavorite, isFavorited, addSearchQuery } = useAuthContext();
    const [userYear, setUserYear] = useState('');
    const [userBranch, setUserBranch] = useState('');
    const [papersData, setPapersData] = useState([]);
    const [loadingPapers, setLoadingPapers] = useState(true);
    const [viewUrl, setViewUrl] = useState(null);
    const [currentFolder, setCurrentFolder] = useState(null);

    const [selYear, setSelYear] = useState('');
    const [selSubject, setSelSubject] = useState('');

    useEffect(() => {
        if (user?.uid) {
            const profileRef = ref(database, `users/${user.uid}/profile`);
            const unsubscribe = onValue(profileRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    if (data.year) setUserYear(data.year);
                    if (data.branch) setUserBranch(data.branch);
                }
            });
            return () => unsubscribe();
        } else {
            setUserYear('');
            setUserBranch('');
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
        if (paper.isFolder) {
            setCurrentFolder(paper);
            return;
        }
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
        if (!paper.url) return;

        // Convert to download link if it's a direct file
        let downloadLink = paper.url;
        if (paper.url.includes('drive.google.com/file/d/')) {
            const fileId = paper.url.split('/d/')[1]?.split('/')[0];
            if (fileId) {
                downloadLink = `https://drive.google.com/uc?id=${fileId}&export=download`;
            }
        }

        if (user) {
            addDownload({
                itemId: paper.id,
                type: 'paper',
                title: paper.subject,
                year: paper.year,
                paperType: paper.type,
            });
        }

        window.open(downloadLink, '_blank');
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

    const filteredPapers = papersData.filter(paper => {
        // Hierarchy check
        const matchesFolder = (currentFolder?.id || 'root') === (paper.parentId || 'root');
        
        // Contextual filters
        const matchesYear = !userYear || userYear === 'Alumni' || paper.academicYear === userYear || paper.academicYear === 'Common' || !paper.academicYear;
        const matchesBranch = !userBranch || paper.branch === userBranch || paper.branch === 'Common' || !paper.branch;
        
        const matchesFilterYear = !selYear || paper.academicYear === selYear;
        const matchesFilterSubject = !selSubject || (paper.subject && paper.subject.toLowerCase().includes(selSubject.toLowerCase()));

        return matchesFolder && matchesYear && matchesBranch && matchesFilterYear && matchesFilterSubject;
    });

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

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

                <div className="workspace-selectors search-only-global">
                    <div className="selectors-body">
                        <div className="selector-group desktop-only-flex">
                            <div className="selector-item">
                                <label>Exam Year</label>
                                <CustomSelect 
                                    options={[
                                        { value: '', label: 'All Years' },
                                        { value: '2023', label: '2023' },
                                        { value: '2022', label: '2022' },
                                        { value: '2021', label: '2021' },
                                        { value: '2020', label: '2020' }
                                    ]}
                                    value={selYear}
                                    onChange={setSelYear}
                                    placeholder="All Years"
                                    icon={Filter}
                                />
                            </div>
                            <div className="selector-item">
                                <label>Select Subject</label>
                                <CustomSelect 
                                    options={[
                                        { value: '', label: 'All Subjects' },
                                        { value: 'Computer Science', label: 'Computer Science' },
                                        { value: 'Mechanical', label: 'Mechanical' },
                                        { value: 'Electrical', label: 'Electrical' }
                                    ]}
                                    value={selSubject}
                                    onChange={setSelSubject}
                                    placeholder="All Subjects"
                                    icon={Filter}
                                />
                            </div>
                        </div>

                        <div className="search-bar-modern">
                            <Search className="search-icon" size={18} />
                            <input
                                type="text"
                                placeholder="Search papers..."
                                onKeyDown={handleSearch}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Unified Filter FAB — sits above Workspace Dock */}
            <div className="global-filter-dock">
                <button 
                    className="dock-btn filter-fab" 
                    onClick={() => setIsFilterModalOpen(true)}
                    title="Filters & Sorting"
                >
                    <Filter size={24} />
                </button>
            </div>

            {/* Mobile Filter Popup Modal */}
            {isFilterModalOpen && (
                <div className="filter-modal-overlay" onClick={() => setIsFilterModalOpen(false)}>
                    <div className="filter-modal-content card" onClick={e => e.stopPropagation()}>
                        <div className="filter-modal-header">
                            <h3><Filter size={18} /> Filters & Sorting</h3>
                            <button className="close-btn" onClick={() => setIsFilterModalOpen(false)}>&times;</button>
                        </div>
                        <div className="filter-modal-body">
                            <div className="selector-item">
                                <label>Exam Year</label>
                                <CustomSelect 
                                    options={[
                                        { value: '', label: 'All Years' },
                                        { value: '2023', label: '2023' },
                                        { value: '2022', label: '2022' },
                                        { value: '2021', label: '2021' },
                                        { value: '2020', label: '2020' }
                                    ]}
                                    value={selYear}
                                    onChange={setSelYear}
                                    placeholder="All Years"
                                />
                            </div>
                            <div className="selector-item">
                                <label>Select Subject</label>
                                <CustomSelect 
                                    options={[
                                        { value: '', label: 'All Subjects' },
                                        { value: 'Computer Science', label: 'Computer Science' },
                                        { value: 'Mechanical', label: 'Mechanical' },
                                        { value: 'Electrical', label: 'Electrical' }
                                    ]}
                                    value={selSubject}
                                    onChange={setSelSubject}
                                    placeholder="All Subjects"
                                />
                            </div>

                            <button className="btn-primary w-full" style={{ marginTop: '1.5rem' }} onClick={() => setIsFilterModalOpen(false)}>
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Breadcrumbs */}
            <div className="breadcrumbs" style={{margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem'}}>
                <span 
                    onClick={() => setCurrentFolder(null)} 
                    style={{cursor: 'pointer', color: !currentFolder ? 'var(--accent-color)' : 'inherit', fontWeight: !currentFolder ? '600' : '400'}}
                >
                    All Papers
                </span>
                {currentFolder && (
                    <>
                        <span>/</span>
                        <span style={{color: 'var(--accent-color)', fontWeight: '600'}}>{currentFolder.title}</span>
                    </>
                )}
            </div>

            <div className="papers-content-area" style={{marginTop: '2rem'}}>
                {loadingPapers ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                        <div className="loader"></div>
                    </div>
                ) : filteredPapers.length > 0 ? (
                        <div className="notes-grid">
                        {filteredPapers.map(paper => (
                            <div key={paper.id} className="folder-card card" onClick={() => handleView(paper)}>
                                <div className="folder-icon-wrapper">
                                    {paper.isFolder ? (
                                        <Folder size={20} color="#ffffff" strokeWidth={2.5} />
                                    ) : (
                                        <FileText size={20} color="#ffffff" strokeWidth={2} />
                                    )}
                                </div>
                                <div className="folder-info">
                                    <h3 className="folder-title" title={paper.title || paper.subject}>{paper.title || paper.subject}</h3>
                                    {!paper.isFolder && (
                                        <div className="res-card-meta" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                                            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>
                                                {paper.academicYear} • {paper.branch}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {!paper.isFolder && (
                                    <div className="folder-actions-overlay">
                                        <div className="action-button-group">
                                            <button 
                                                className={`circle-action-btn btn-add ${isFavorited(paper.id, 'paper') ? 'active' : ''}`}
                                                onClick={(e) => { e.stopPropagation(); handleFavorite(paper); }}
                                                title={isFavorited(paper.id, 'paper') ? "Remove from Favorites" : "Add to Favorites"}
                                            >
                                                {isFavorited(paper.id, 'paper') ? <Heart size={16} fill="white" /> : <Plus size={16} />}
                                            </button>
                                            <button 
                                                className="circle-action-btn btn-view"
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    handleView(paper); 
                                                    setViewUrl(paper.url);
                                                }}
                                                title="Quick View"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button 
                                                className="circle-action-btn btn-download"
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    handleDownload(paper);
                                                }}
                                                title="Download"
                                            >
                                                <Download size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                        <FilterX size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <h3>No past papers found</h3>
                        <p>We're continually adding new resources. Check back later!</p>
                    </div>
                )}
            </div>

            {/* In-page Document Viewer */}
            {viewUrl && <IframeModal url={viewUrl} onClose={() => setViewUrl(null)} />}
        </div>
    );
}
