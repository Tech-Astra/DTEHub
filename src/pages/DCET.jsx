import { useState, useEffect } from 'react';
import { Search, Download, Folder, FileText, Eye, Plus, Heart, FilterX } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import CustomSelect from '../components/CustomSelect';
import IframeModal from '../components/IframeModal';
import { Filter, ChevronDown } from 'lucide-react';
import './Notes.css';

export default function DCET() {
    const { user, addRecentlyViewed, addDownload, toggleFavorite, isFavorited, addSearchQuery } = useAuthContext();
    const [dcetData, setDcetData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewUrl, setViewUrl] = useState(null);
    const [currentFolder, setCurrentFolder] = useState(null);

    // Dynamic Filter Lists
    const [branches, setBranches] = useState([]);
    const [syllabuses, setSyllabuses] = useState([]);

    // Selection States
    const [selBranch, setSelBranch] = useState('');
    const [selSyllabus, setSelSyllabus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    // Fetch master data for filters
    useEffect(() => {
        const bRef = ref(database, 'branches');
        const sRef = ref(database, 'syllabuses');
        
        onValue(bRef, (snap) => {
            const data = snap.val();
            if (data) {
                const arr = Object.keys(data).map(key => ({
                    id: key,
                    title: typeof data[key] === 'string' ? data[key] : data[key].title
                }));
                setBranches(arr);
            }
        });

        onValue(sRef, (snap) => {
            const data = snap.val();
            if (data) {
                const arr = Object.keys(data).map(key => ({
                    id: key,
                    title: typeof data[key] === 'string' ? data[key] : data[key].title
                }));
                setSyllabuses(arr);
            }
        });
    }, []);

    // Fetch DCET Resources from Database
    useEffect(() => {
        const dcetRef = ref(database, 'resources/dcet');
        const unsubscribe = onValue(dcetRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const arr = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                // Sort by timestamp if needed
                setDcetData(arr.reverse());
            } else {
                setDcetData([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleView = (item) => {
        if (item.isFolder) {
            setCurrentFolder(item);
            return;
        }
        if (user) {
            addRecentlyViewed({
                itemId: item.id,
                type: 'dcet',
                title: item.title,
            });
        }
    };

    const handleDownload = (item) => {
        if (!item.url) return;
        
        let downloadLink = item.url;
        if (item.url.includes('drive.google.com/file/d/')) {
            const fileId = item.url.split('/d/')[1]?.split('/')[0];
            if (fileId) {
                downloadLink = `https://drive.google.com/uc?id=${fileId}&export=download`;
            }
        }

        if (user) {
            addDownload({
                itemId: item.id,
                type: 'dcet',
                title: item.title,
            });
        }
        
        window.open(downloadLink, '_blank');
    };

    const handleFavorite = (item) => {
        if (user) {
            toggleFavorite({
                itemId: item.id,
                type: 'dcet',
                title: item.title,
            });
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (e.key === 'Enter' && user && query.trim()) {
            addSearchQuery(query);
        }
    };

    const filteredDcet = dcetData
        .filter(item => {
            const matchesFolder = (currentFolder?.id || 'root') === (item.parentId || 'root');
            
            const matchesSearch = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase());

            if (item.isFolder) return matchesFolder && matchesSearch;

            const matchesBranch = !selBranch || item.branch === selBranch || item.branch === 'Common';
            const matchesSyllabus = !selSyllabus || item.syllabus === selSyllabus;
            
            return matchesFolder && matchesBranch && matchesSyllabus && matchesSearch;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return b.id.localeCompare(a.id);
            if (sortBy === 'oldest') return a.id.localeCompare(b.id);
            if (sortBy === 'az') return a.title.localeCompare(b.title);
            if (sortBy === 'za') return b.title.localeCompare(a.title);
            return 0;
        });

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    return (
        <div className="container notes-page">
            {/* Desktop View & Mobile Search Only */}
            <div className="workspace-selectors search-only-global">
                <div className="selectors-body">
                    <div className="selector-group desktop-only-flex">
                        <div className="selector-item">
                            <label>Academic Branch</label>
                            <CustomSelect 
                                options={[
                                    { value: '', label: 'Select Branch' },
                                    { value: 'Common', label: 'Common to All' },
                                    ...branches.map(b => ({ value: b.title, label: b.title }))
                                ]}
                                value={selBranch}
                                onChange={setSelBranch}
                                placeholder="Select Branch"
                                icon={Filter}
                            />
                        </div>

                        <div className="selector-item">
                            <label>Syllabus Scheme</label>
                            <CustomSelect 
                                options={[
                                    { value: '', label: 'Select Scheme' },
                                    ...syllabuses.map(s => ({ value: s.title, label: `${s.title} Scheme` }))
                                ]}
                                value={selSyllabus}
                                onChange={setSelSyllabus}
                                placeholder="Select Scheme"
                                icon={Filter}
                            />
                        </div>

                        <div className="selector-item">
                            <label>Sort By</label>
                            <CustomSelect 
                                options={[
                                    { value: 'newest', label: 'Newest First' },
                                    { value: 'oldest', label: 'Oldest First' },
                                    { value: 'az', label: 'Alphabetical (A-Z)' },
                                    { value: 'za', label: 'Alphabetical (Z-A)' }
                                ]}
                                value={sortBy}
                                onChange={setSortBy}
                                placeholder="Sort By"
                                icon={ChevronDown}
                            />
                        </div>
                    </div>

                    <div className="search-bar-modern">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search DCET materials..."
                            value={searchQuery}
                            onChange={handleSearch}
                            onKeyDown={handleSearch}
                        />
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
                                <label>Academic Branch</label>
                                <CustomSelect 
                                    options={[
                                        { value: '', label: 'Select Branch' },
                                        { value: 'Common', label: 'Common to All' },
                                        ...branches.map(b => ({ value: b.title, label: b.title }))
                                    ]}
                                    value={selBranch}
                                    onChange={setSelBranch}
                                    placeholder="Select Branch"
                                />
                            </div>

                            <div className="selector-item">
                                <label>Syllabus Scheme</label>
                                <CustomSelect 
                                    options={[
                                        { value: '', label: 'Select Scheme' },
                                        ...syllabuses.map(s => ({ value: s.title, label: `${s.title} Scheme` }))
                                    ]}
                                    value={selSyllabus}
                                    onChange={setSelSyllabus}
                                    placeholder="Select Scheme"
                                />
                            </div>

                            <div className="selector-item">
                                <label>Sort By</label>
                                <CustomSelect 
                                    options={[
                                        { value: 'newest', label: 'Newest First' },
                                        { value: 'oldest', label: 'Oldest First' },
                                        { value: 'az', label: 'Alphabetical (A-Z)' },
                                        { value: 'za', label: 'Alphabetical (Z-A)' }
                                    ]}
                                    value={sortBy}
                                    onChange={setSortBy}
                                    placeholder="Sort By"
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
            <div className="breadcrumbs" style={{margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem'}}>
                <span 
                    onClick={() => setCurrentFolder(null)} 
                    style={{cursor: 'pointer', color: !currentFolder ? 'var(--accent-color)' : 'inherit', fontWeight: !currentFolder ? '600' : '400'}}
                >
                    DCET Home
                </span>
                {currentFolder && (
                    <>
                        <span>/</span>
                        <span style={{color: 'var(--accent-color)', fontWeight: '600'}}>{currentFolder.title}</span>
                    </>
                )}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                    <div className="loader"></div>
                </div>
            ) : filteredDcet.length > 0 ? (
                <div className="notes-grid">
                    {filteredDcet.map(item => (
                        <div key={item.id} className="folder-card card" onClick={() => handleView(item)}>
                            <div className="folder-icon-wrapper">
                                {item.isFolder ? (
                                    <Folder size={20} color="#ffffff" strokeWidth={2.5} />
                                ) : (
                                    <FileText size={20} color="#ffffff" strokeWidth={2} />
                                )}
                            </div>
                            <div className="folder-info">
                                <h3 className="folder-title" title={item.title}>{item.title}</h3>
                                {!item.isFolder && (
                                    <div className="res-card-meta" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>
                                            Resources • Materials
                                        </span>
                                    </div>
                                )}
                            </div>

                            {!item.isFolder && (
                                <div className="folder-actions-overlay">
                                    <div className="action-button-group">
                                        <button 
                                            className={`circle-action-btn btn-add ${isFavorited(item.id, 'dcet') ? 'active' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); handleFavorite(item); }}
                                            title="Add to Workspace"
                                        >
                                            {isFavorited(item.id, 'dcet') ? <Heart size={20} fill="white" /> : <Plus size={20} />}
                                        </button>
                                        <button 
                                            className="circle-action-btn btn-view"
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                handleView(item); 
                                                setViewUrl(item.url);
                                            }}
                                            title="Quick View"
                                        >
                                            <Eye size={20} />
                                        </button>
                                        <button 
                                            className="circle-action-btn btn-download"
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                handleDownload(item);
                                            }}
                                            title="Download"
                                        >
                                            <Download size={20} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                    <FilterX size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <h3>No materials found</h3>
                    <p>Preparation materials for DCET will appear here soon.</p>
                </div>
            )}

            {/* In-page Document Viewer */}
            {viewUrl && <IframeModal url={viewUrl} onClose={() => setViewUrl(null)} />}
        </div>
    );
}
