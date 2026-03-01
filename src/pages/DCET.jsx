import { useState, useEffect } from 'react';
import { Search, Download, Folder, FileText, Eye, Plus, Heart, FilterX, ChevronDown, Filter, ChevronLeft } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import CustomSelect from '../components/CustomSelect';
import ResourceWindowManager, { loadWorkspace, saveWorkspace } from '../components/ResourceWindowManager';
import './Notes.css';

export default function DCET() {
    const { user, addRecentlyViewed, addDownload, toggleFavorite, isFavorited, addSearchQuery } = useAuthContext();
    const [dcetData, setDcetData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openWindows, setOpenWindows] = useState(() => loadWorkspace());
    const [nextZ, setNextZ] = useState(10);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [activeCardId, setActiveCardId] = useState(null);

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
                const arr = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                setDcetData(arr.reverse());
            } else {
                setDcetData([]);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Persist workspace to localStorage on every change
    useEffect(() => { saveWorkspace(openWindows); }, [openWindows]);

    // Handle click outside to clear active card on mobile
    useEffect(() => {
        const handleClickOutside = () => {
            if (activeCardId) setActiveCardId(null);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [activeCardId]);

    // ── Window management ────────────────────────────
    const openWindow = (item) => {
        setOpenWindows(prev => {
            const existing = prev.find(w => w.id === item.id);
            if (existing) {
                return prev.map(w => w.id === item.id ? { ...w, state: 'normal', zOrder: nextZ } : w);
            }
            const idx = prev.length % 5;
            const vw = window.innerWidth;
            const ww = Math.min(640, vw * 0.48);
            const x = idx === 0 ? 16 : idx === 1 ? Math.floor(vw / 2) + 4 : 16 + idx * 40;
            const y = 40 + idx * 28;
            return [...prev, { id: item.id, url: item.url, title: item.title, state: 'normal', x, y, width: ww, height: 520, zOrder: nextZ }];
        });
        setNextZ(n => n + 1);
    };

    const handleWindowClose = (id) => setOpenWindows(prev => prev.filter(w => w.id !== id));
    const handleWindowMinimize = (id, mode) => {
        if (mode === 'restore') {
            setOpenWindows(prev => prev.map(w => w.id === id ? { ...w, state: 'normal', zOrder: nextZ } : w));
            setNextZ(n => n + 1);
        } else {
            setOpenWindows(prev => prev.map(w => w.id === id ? { ...w, state: 'minimized' } : w));
        }
    };
    const handleWindowMaximize = (id) => setOpenWindows(prev => prev.map(w =>
        w.id === id ? { ...w, state: w.state === 'maximized' ? 'normal' : 'maximized' } : w
    ));
    const handleWindowFocus = (id) => {
        setNextZ(n => n + 1);
        setOpenWindows(prev => prev.map(w => w.id === id ? { ...w, zOrder: nextZ } : w));
    };
    const handleWindowMove = (id, x, y) => setOpenWindows(prev => prev.map(w => w.id === id ? { ...w, x, y } : w));
    const handleWindowResize = (id, width, height) => setOpenWindows(prev => prev.map(w => w.id === id ? { ...w, width, height } : w));

    // ── Resource actions ─────────────────────────────
    const handleView = (item) => {
        if (item.isFolder) { setCurrentFolder(item); return; }
        if (user) {
            addRecentlyViewed({ itemId: item.id, type: 'dcet', title: item.title });
        }
        openWindow(item);
    };

    const handleDownload = (item) => {
        if (!item.url) return;
        let downloadLink = item.url;
        if (item.url.includes('drive.google.com/file/d/')) {
            const fileId = item.url.split('/d/')[1]?.split('/')[0];
            if (fileId) downloadLink = `https://drive.google.com/uc?id=${fileId}&export=download`;
        }
        if (user) {
            addDownload({ itemId: item.id, type: 'dcet', title: item.title });
        }
        window.open(downloadLink, '_blank');
    };

    const handleFavorite = (item) => {
        if (user) {
            toggleFavorite({ itemId: item.id, type: 'dcet', title: item.title });
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (e.key === 'Enter' && user && query.trim()) addSearchQuery(query);
    };

    const filteredData = dcetData
        .filter(item => {
            const matchesFolder = (currentFolder?.id || 'root') === (item.parentId || 'root');
            const matchesSearch = !searchQuery ||
                item.title.toLowerCase().includes(searchQuery.toLowerCase());

            if (item.isFolder) return matchesFolder && matchesSearch;

            const matchesBranch = !selBranch || item.branch === selBranch;
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

    return (
        <div className="notes-page-wrapper">
            {/* Header / Search Area */}
            <div className="notes-search-center">
                <div className="workspace-selectors search-only-global">
                    <div className="selectors-body">
                        <div className="selector-group desktop-only-flex">
                            <div className="selector-item">
                                <label>Academic Branch</label>
                                <CustomSelect
                                    options={[
                                        { value: '', label: 'All Branches' },
                                        ...branches.map(b => ({ value: b.title, label: b.title }))
                                    ]}
                                    value={selBranch}
                                    onChange={setSelBranch}
                                    placeholder="All Branches"
                                    icon={Filter}
                                />
                            </div>
                            <div className="selector-item">
                                <label>Syllabus Scheme</label>
                                <CustomSelect
                                    options={[
                                        { value: '', label: 'All Schemes' },
                                        ...syllabuses.map(s => ({ value: s.title, label: `${s.title} Scheme` }))
                                    ]}
                                    value={selSyllabus}
                                    onChange={setSelSyllabus}
                                    placeholder="All Schemes"
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
                                placeholder="Search DCET resources..."
                                value={searchQuery}
                                onChange={handleSearch}
                                onKeyDown={handleSearch}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container notes-page" style={{ position: 'relative' }}>
                {/* Breadcrumbs */}
                <div className="breadcrumbs" style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {currentFolder && (
                        <button
                            onClick={() => {
                                const parent = dcetData.find(n => n.id === currentFolder.parentId);
                                setCurrentFolder(parent || null);
                            }}
                            className="btn-back-nav"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)', color: 'var(--accent-color)', cursor: 'pointer', marginRight: '0.5rem'
                            }}
                            title="Go Back"
                        >
                            <ChevronLeft size={20} strokeWidth={3} />
                        </button>
                    )}
                    <span onClick={() => setCurrentFolder(null)} style={{ cursor: 'pointer', color: !currentFolder ? 'var(--accent-color)' : 'inherit', fontWeight: !currentFolder ? '600' : '400' }}>
                        DCET Resources
                    </span>
                    {currentFolder && (
                        <>
                            <span>/</span>
                            <span style={{ color: 'var(--accent-color)', fontWeight: '600' }}>{currentFolder.title}</span>
                        </>
                    )}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                        <div className="loader"></div>
                    </div>
                ) : filteredData.length > 0 ? (
                    <div className="notes-grid">
                        {filteredData.map(item => {
                            const isActive = activeCardId === item.id;

                            return (
                                <div
                                    key={item.id}
                                    className={`folder-card card ${isActive ? 'active-mobile' : ''}`}
                                    onClick={(e) => {
                                        if (window.innerWidth <= 768 && !item.isFolder) {
                                            if (!isActive) {
                                                e.stopPropagation();
                                                setActiveCardId(item.id);
                                                return;
                                            }
                                        }
                                        handleView(item);
                                    }}
                                >
                                    <div className="folder-icon-wrapper">
                                        {item.isFolder ? <Folder size={20} color="#ffffff" strokeWidth={2.5} /> : <FileText size={20} color="#ffffff" strokeWidth={2} />}
                                    </div>
                                    <div className="folder-info">
                                        <h3 className="folder-title" title={item.title}>{item.title}</h3>
                                        {!item.isFolder && (
                                            <div className="res-card-meta" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                                                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>
                                                    {item.syllabus} • {item.branch}
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
                                                    title={isFavorited(item.id, 'dcet') ? "Remove from Favorites" : "Add to Favorites"}
                                                >
                                                    {isFavorited(item.id, 'dcet') ? <Heart size={20} fill="white" /> : <Plus size={20} />}
                                                </button>
                                                <button className="circle-action-btn btn-view"
                                                    onClick={(e) => { e.stopPropagation(); handleView(item); }}
                                                    title="Quick View"
                                                >
                                                    <Eye size={20} />
                                                </button>
                                                <button className="circle-action-btn btn-download"
                                                    onClick={(e) => { e.stopPropagation(); handleDownload(item); }}
                                                    title="Download"
                                                >
                                                    <Download size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                        <FilterX size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <h3>No materials found</h3>
                        <p>Try adjusting your search criteria.</p>
                    </div>
                )}

                {/* Multi-Window Resource Viewer */}
                <ResourceWindowManager
                    windows={openWindows}
                    onClose={handleWindowClose}
                    onMinimize={handleWindowMinimize}
                    onMaximize={handleWindowMaximize}
                    onFocus={handleWindowFocus}
                    onMove={handleWindowMove}
                    onResize={handleWindowResize}
                />
            </div>
        </div>
    );
}
