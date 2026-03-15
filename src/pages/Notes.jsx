import { useState, useEffect } from 'react';
import { Search, Download, Folder, FileText, FileSpreadsheet, Eye, Plus, Heart, FilterX, ChevronDown, Filter, ChevronLeft } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import CustomSelect from '../components/CustomSelect';
import ResourceWindowManager, { loadWorkspace, saveWorkspace } from '../components/ResourceWindowManager';
import './Notes.css';

export default function Notes() {
    const { user, addRecentlyViewed, addDownload, toggleFavorite, isFavorited, addSearchQuery, preferences, updatePreferences } = useAuthContext();
    const [notesData, setNotesData] = useState([]);
    const [loadingNotes, setLoadingNotes] = useState(true);
    const [openWindows, setOpenWindows] = useState(() => loadWorkspace());
    const [nextZ, setNextZ] = useState(10);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [folderHistory, setFolderHistory] = useState([]);
    const [activeCardId, setActiveCardId] = useState(null);
    const [driveFiles, setDriveFiles] = useState([]);
    const [loadingDrive, setLoadingDrive] = useState(false);

    // Dynamic Filter Lists
    const [branches, setBranches] = useState([]);
    const [syllabuses, setSyllabuses] = useState([]);

    // Selection States (initialized from preferences if available)
    const [selBranch, setSelBranch] = useState(preferences?.branch || '');
    const [selSyllabus, setSelSyllabus] = useState(preferences?.syllabus || '');
    const [selSemester, setSelSemester] = useState(preferences?.semester || '');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    // Sync local state when preferences load
    useEffect(() => {
        if (preferences) {
            if (preferences.branch) setSelBranch(preferences.branch);
            if (preferences.syllabus) setSelSyllabus(preferences.syllabus);
            if (preferences.semester) setSelSemester(preferences.semester);
        }
    }, [preferences]);

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

    // Fetch Notes from Database
    useEffect(() => {
        const notesRef = ref(database, 'resources/notes');
        const unsubscribe = onValue(notesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const arr = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                setNotesData(arr.reverse());
            } else {
                setNotesData([]);
            }
            setLoadingNotes(false);
        });
        return () => unsubscribe();
    }, []);

    // Fetch Drive Folder Contents if currentFolder is a Google Drive Folder
    useEffect(() => {
        if (!currentFolder?.isDriveFolder) {
            setDriveFiles([]);
            return;
        }

        const fetchDriveDocs = async () => {
            setLoadingDrive(true);
            try {
                const folderId = currentFolder.driveFolderId;
                const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
                if (!apiKey) {
                    console.error("Missing VITE_GOOGLE_DRIVE_API_KEY in .env");
                    setLoadingDrive(false);
                    return;
                }

                // Fetch files in this folder
                const fetchUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&key=${apiKey}&fields=files(id, name, mimeType, webViewLink, iconLink)&pageSize=1000`;
                const res = await fetch(fetchUrl);

                console.log("Drive API Response Status:", res.status);
                const data = await res.json();
                console.log("Drive API Response Data:", data);

                if (data.files) {
                    const mappedFiles = data.files.map(f => {
                        const isFolder = f.mimeType === 'application/vnd.google-apps.folder';
                        return {
                            id: `drive-${f.id}`,
                            title: f.name,
                            isFolder: isFolder,
                            isDriveFolder: isFolder,
                            driveFolderId: f.id, // For subfolders
                            url: f.webViewLink || `https://drive.google.com/file/d/${f.id}/preview`,
                            originalDriveId: f.id,
                            type: isFolder ? 'Folder' : 'Note',
                            // Inherit traits from parent link
                            branch: currentFolder.branch,
                            syllabus: currentFolder.syllabus,
                            semester: currentFolder.semester,
                            chapter: 'Drive Resource'
                        };
                    });

                    // Sort folders first, then alphabetically
                    mappedFiles.sort((a, b) => {
                        if (a.isFolder === b.isFolder) return a.title.localeCompare(b.title);
                        return a.isFolder ? -1 : 1;
                    });
                    setDriveFiles(mappedFiles);
                } else {
                    setDriveFiles([]);
                }
            } catch (err) {
                console.error("Failed to fetch Google Drive folder:", err);
            } finally {
                setLoadingDrive(false);
            }
        };

        fetchDriveDocs();
    }, [currentFolder]);

    // ── Window management ────────────────────────────
    const openWindow = (note) => {
        setOpenWindows(prev => {
            const existing = prev.find(w => w.id === note.id);
            if (existing) {
                return prev.map(w => w.id === note.id ? { ...w, state: 'normal', zOrder: nextZ } : w);
            }
            const idx = prev.length % 5;
            const vw = window.innerWidth;
            const ww = Math.min(640, vw * 0.48);
            const x = idx === 0 ? 16 : idx === 1 ? Math.floor(vw / 2) + 4 : 16 + idx * 40;
            const y = 40 + idx * 28;
            return [...prev, { id: note.id, url: note.url, title: note.title, state: 'normal', x, y, width: ww, height: 520, zOrder: nextZ }];
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
    const handleView = (note) => {
        if (note.isFolder) {
            setFolderHistory(prev => [...prev, currentFolder]);
            setCurrentFolder(note);
            return;
        }
        if (user && !note.originalDriveId) {
            // Only tracking views for native DB notes right now, to avoid tracking huge drive directories individually
            addRecentlyViewed({ itemId: note.id, type: 'note', title: note.title, chapter: note.chapter });
        }
        openWindow(note);
    };

    const handleDownload = (note) => {
        if (!note.url) return;
        let downloadLink = note.url;
        if (note.url.includes('drive.google.com/file/d/')) {
            const fileId = note.url.split('/d/')[1]?.split('/')[0];
            if (fileId) downloadLink = `https://drive.google.com/uc?id=${fileId}&export=download`;
        }
        if (user) {
            addDownload({ itemId: note.id, type: 'note', title: note.title, chapter: note.chapter });
        }
        window.open(downloadLink, '_blank');
    };

    const handleFavorite = (note) => {
        if (user) {
            toggleFavorite({ itemId: note.id, type: 'note', title: note.title, chapter: note.chapter });
        }
    };

    const handlePreferenceChange = (type, value) => {
        if (type === 'branch') setSelBranch(value);
        if (type === 'syllabus') setSelSyllabus(value);
        if (type === 'semester') setSelSemester(value);
        if (user) updatePreferences({ [type]: value });
    };

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (e.key === 'Enter' && user && query.trim()) addSearchQuery(query);
    };

    const filteredNotes = notesData
        .filter(note => {
            const matchesFolder = (currentFolder?.id || 'root') === (note.parentId || 'root');
            const matchesSearch = !searchQuery ||
                note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (note.chapter && note.chapter.toLowerCase().includes(searchQuery.toLowerCase()));
            if (note.isFolder) return matchesFolder && matchesSearch;
            const matchesBranch = !selBranch || note.branch === selBranch || note.branch === 'Common';
            const matchesSyllabus = !selSyllabus || note.syllabus === selSyllabus;
            const matchesSemester = !selSemester || note.semester === selSemester;
            return matchesFolder && matchesBranch && matchesSyllabus && matchesSemester && matchesSearch;
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
            {/* Centered Search Bar */}
            <div className="notes-search-center">
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
                                    onChange={val => handlePreferenceChange('branch', val)}
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
                                    onChange={val => handlePreferenceChange('syllabus', val)}
                                    placeholder="Select Scheme"
                                    icon={Filter}
                                />
                            </div>
                            <div className="selector-item">
                                <label>Target Semester</label>
                                <CustomSelect
                                    options={[
                                        { value: '', label: 'Select Sem' },
                                        { value: '1st Sem', label: '1st Semester' },
                                        { value: '2nd Sem', label: '2nd Semester' },
                                        { value: '3rd Sem', label: '3rd Semester' },
                                        { value: '4th Sem', label: '4th Semester' },
                                        { value: '5th Sem', label: '5th Semester' },
                                        { value: '6th Sem', label: '6th Semester' }
                                    ]}
                                    value={selSemester}
                                    onChange={val => handlePreferenceChange('semester', val)}
                                    placeholder="Select Sem"
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
                                placeholder="Search resources by title or chapter..."
                                value={searchQuery}
                                onChange={handleSearch}
                                onKeyDown={handleSearch}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Left-aligned content container */}
            <div className="container notes-page">

                {/* Unified Filter FAB */}
                <div className="global-filter-dock">
                    <button className="dock-btn filter-fab" onClick={() => setIsFilterModalOpen(true)} title="Filters & Sorting">
                        <Filter size={24} />
                    </button>
                </div>

                {/* Mobile Filter Modal */}
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
                                        options={[{ value: '', label: 'Select Branch' }, { value: 'Common', label: 'Common to All' }, ...branches.map(b => ({ value: b.title, label: b.title }))]}
                                        value={selBranch} onChange={val => handlePreferenceChange('branch', val)} placeholder="Select Branch"
                                    />
                                </div>
                                <div className="selector-item">
                                    <label>Syllabus Scheme</label>
                                    <CustomSelect
                                        options={[{ value: '', label: 'Select Scheme' }, ...syllabuses.map(s => ({ value: s.title, label: `${s.title} Scheme` }))]}
                                        value={selSyllabus} onChange={val => handlePreferenceChange('syllabus', val)} placeholder="Select Scheme"
                                    />
                                </div>
                                <div className="selector-item">
                                    <label>Target Semester</label>
                                    <CustomSelect
                                        options={[{ value: '', label: 'Select Sem' }, { value: '1st Sem', label: '1st Semester' }, { value: '2nd Sem', label: '2nd Semester' }, { value: '3rd Sem', label: '3rd Semester' }, { value: '4th Sem', label: '4th Semester' }, { value: '5th Sem', label: '5th Semester' }, { value: '6th Sem', label: '6th Semester' }]}
                                        value={selSemester} onChange={val => handlePreferenceChange('semester', val)} placeholder="Select Sem"
                                    />
                                </div>
                                <div className="selector-item">
                                    <label>Sort By</label>
                                    <CustomSelect
                                        options={[{ value: 'newest', label: 'Newest First' }, { value: 'oldest', label: 'Oldest First' }, { value: 'az', label: 'Alphabetical (A-Z)' }, { value: 'za', label: 'Alphabetical (Z-A)' }]}
                                        value={sortBy} onChange={setSortBy} placeholder="Sort By"
                                    />
                                </div>
                                <button className="btn-primary w-full" style={{ marginTop: '1.5rem' }} onClick={() => setIsFilterModalOpen(false)}>Apply Filters</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Breadcrumbs */}
                <div className="breadcrumbs" style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {currentFolder && (
                        <button
                            onClick={() => {
                                if (folderHistory.length > 0) {
                                    const prev = folderHistory[folderHistory.length - 1];
                                    setFolderHistory(h => h.slice(0, -1));
                                    setCurrentFolder(prev);
                                } else {
                                    const parent = notesData.find(n => n.id === currentFolder.parentId);
                                    if (parent) {
                                        setCurrentFolder(parent);
                                    } else {
                                        setCurrentFolder(null);
                                    }
                                }
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
                    <span onClick={() => { setCurrentFolder(null); setFolderHistory([]); }} style={{ cursor: 'pointer', color: !currentFolder ? 'var(--accent-color)' : 'inherit', fontWeight: !currentFolder ? '600' : '400' }}>
                        All Resources
                    </span>
                    {currentFolder && (
                        <>
                            <span>/</span>
                            <span style={{ color: 'var(--accent-color)', fontWeight: '600' }}>{currentFolder.title}</span>
                        </>
                    )}
                </div>

                {loadingNotes ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                        <div className="loader"></div>
                    </div>
                ) : currentFolder?.isDriveFolder ? (
                    <div className="notes-grid">
                        {loadingDrive ? (
                            <div style={{ textAlign: 'center', padding: '4rem 0', gridColumn: '1 / -1' }}>
                                <div className="loader"></div>
                                <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Fetching from Google Drive...</p>
                            </div>
                        ) : driveFiles.length > 0 ? (
                            driveFiles.map((note) => {
                                const isActive = activeCardId === note.id;
                                return (
                                    <div
                                        key={note.id}
                                        className={`folder-card card ${isActive ? 'active-mobile' : ''}`}
                                        onClick={(e) => {
                                            if (window.innerWidth <= 768 && !note.isFolder) {
                                                if (!isActive) {
                                                    e.stopPropagation();
                                                    setActiveCardId(note.id);
                                                    return;
                                                }
                                            }
                                            handleView(note);
                                        }}
                                    >
                                        <div className="folder-icon-wrapper">
                                            {note.isDriveFolder ? (
                                                <Folder size={20} color="#ffffff" strokeWidth={2.5} />
                                            ) : note.isFolder ? (
                                                <Folder size={20} color="#ffffff" strokeWidth={2.5} />
                                            ) : note.type === 'Paper' ? (
                                                <FileSpreadsheet size={20} color="#ffffff" strokeWidth={2} />
                                            ) : (
                                                <FileText size={20} color="#ffffff" strokeWidth={2} />
                                            )}
                                        </div>
                                        <div className="folder-info">
                                            <h3 className="folder-title" title={note.title}>
                                                {note.title}
                                            </h3>
                                            {!note.isFolder && (
                                                <div className="res-card-meta" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                                                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>
                                                        {note.syllabus || note.academicYear} • {note.semester} • {note.branch}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        {!note.isFolder && (
                                            <div className="folder-actions-overlay">
                                                <div className="action-button-group">
                                                    <button className="circle-action-btn btn-view"
                                                        onClick={(e) => { e.stopPropagation(); handleView(note); }}
                                                        title="Quick View"
                                                    >
                                                        <Eye size={20} />
                                                    </button>
                                                    <button className="circle-action-btn btn-download"
                                                        onClick={(e) => { e.stopPropagation(); handleDownload(note); }}
                                                        title="Download"
                                                    >
                                                        <Download size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
                                <FilterX size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <h3>Empty Drive Folder</h3>
                                <p>No files found in this Google Drive folder.</p>
                            </div>
                        )}
                    </div>
                ) : filteredNotes.length > 0 ? (
                    <div className="notes-grid">
                        {filteredNotes.map(note => {
                            const isActive = activeCardId === note.id;

                            return (
                                <div
                                    key={note.id}
                                    className={`folder-card card ${isActive ? 'active-mobile' : ''}`}
                                    onClick={(e) => {
                                        if (window.innerWidth <= 768 && !note.isFolder) {
                                            if (!isActive) {
                                                e.stopPropagation();
                                                setActiveCardId(note.id);
                                                return;
                                            }
                                        }
                                        handleView(note);
                                    }}
                                >
                                    <div className="folder-icon-wrapper">
                                        {note.isDriveFolder ? (
                                            <Folder size={20} color="#ffffff" strokeWidth={2.5} /> // Using default folder or a link icon
                                        ) : note.isFolder ? (
                                            <Folder size={20} color="#ffffff" strokeWidth={2.5} />
                                        ) : note.type === 'Paper' ? (
                                            <FileSpreadsheet size={20} color="#ffffff" strokeWidth={2} />
                                        ) : (
                                            <FileText size={20} color="#ffffff" strokeWidth={2} />
                                        )}
                                    </div>
                                    <div className="folder-info">
                                        <h3 className="folder-title" title={note.title}>
                                            {note.title}
                                        </h3>
                                        {!note.isFolder && (
                                            <div className="res-card-meta" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                                                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>
                                                    {note.syllabus || note.academicYear} • {note.semester} • {note.branch}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {!note.isFolder && (
                                        <div className="folder-actions-overlay">
                                            <div className="action-button-group">
                                                <button
                                                    className={`circle-action-btn btn-add ${isFavorited(note.id, 'note') ? 'active' : ''}`}
                                                    onClick={(e) => { e.stopPropagation(); handleFavorite(note); }}
                                                    title={isFavorited(note.id, 'note') ? "Remove from Favorites" : "Add to Favorites"}
                                                >
                                                    {isFavorited(note.id, 'note') ? <Heart size={20} fill="white" /> : <Plus size={20} />}
                                                </button>
                                                <button className="circle-action-btn btn-view"
                                                    onClick={(e) => { e.stopPropagation(); handleView(note); }}
                                                    title="Quick View"
                                                >
                                                    <Eye size={20} />
                                                </button>
                                                <button className="circle-action-btn btn-download"
                                                    onClick={(e) => { e.stopPropagation(); handleDownload(note); }}
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
                        <h3>No resources found</h3>
                        <p>Try adjusting your branch or syllabus filters above.</p>
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
