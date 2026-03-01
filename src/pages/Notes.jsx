import { useState, useEffect } from 'react';
import Search from 'lucide-react/dist/esm/icons/search';
import Download from 'lucide-react/dist/esm/icons/download';
import Folder from 'lucide-react/dist/esm/icons/folder';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import FileSpreadsheet from 'lucide-react/dist/esm/icons/file-spreadsheet';
import Eye from 'lucide-react/dist/esm/icons/eye';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Heart from 'lucide-react/dist/esm/icons/heart';
import FilterX from 'lucide-react/dist/esm/icons/filter-x';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Filter from 'lucide-react/dist/esm/icons/filter';
import { useAuthContext } from '../context/AuthContext';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import CustomSelect from '../components/CustomSelect';
import './Notes.css';

export default function Notes() {
    const { user, addRecentlyViewed, addDownload, toggleFavorite, isFavorited, addSearchQuery, preferences, updatePreferences } = useAuthContext();
    const [notesData, setNotesData] = useState([]);
    const [loadingNotes, setLoadingNotes] = useState(true);
    const [viewUrl, setViewUrl] = useState(null);
    const [currentFolder, setCurrentFolder] = useState(null);

    // Dynamic Filter Lists
    const [branches, setBranches] = useState([]);
    const [syllabuses, setSyllabuses] = useState([]);

    // Selection States (initialized from preferences if available)
    const [selBranch, setSelBranch] = useState(preferences?.branch || '');
    const [selSyllabus, setSelSyllabus] = useState(preferences?.syllabus || '');
    const [selSemester, setSelSemester] = useState(preferences?.semester || '');

    // Sync local state when preferences load
    useEffect(() => {
        if (preferences) {
            if (preferences.branch) setSelBranch(preferences.branch);
            if (preferences.syllabus) setSelSyllabus(preferences.syllabus);
            if (preferences.semester) setSelSemester(preferences.semester);
        }
    }, [preferences]);

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
                const arr = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                // Sort by timestamp if needed
                setNotesData(arr.reverse());
            } else {
                setNotesData([]);
            }
            setLoadingNotes(false);
        });

        return () => unsubscribe();
    }, []);

    const handleView = (note) => {
        if (note.isFolder) {
            setCurrentFolder(note);
            return;
        }
        if (user) {
            addRecentlyViewed({
                itemId: note.id,
                type: 'note',
                title: note.title,
                chapter: note.chapter,
            });
        }
    };

    const handleDownload = (note) => {
        if (!note.url) return;
        
        // Convert to download link if it's a direct file
        let downloadLink = note.url;
        if (note.url.includes('drive.google.com/file/d/')) {
            const fileId = note.url.split('/d/')[1]?.split('/')[0];
            if (fileId) {
                downloadLink = `https://drive.google.com/uc?id=${fileId}&export=download`;
            }
        }

        if (user) {
            addDownload({
                itemId: note.id,
                type: 'note',
                title: note.title,
                chapter: note.chapter,
            });
        }
        
        window.open(downloadLink, '_blank');
    };

    const handlePreferenceChange = (type, value) => {
        if (type === 'branch') setSelBranch(value);
        if (type === 'syllabus') setSelSyllabus(value);
        if (type === 'semester') setSelSemester(value);

        if (user) {
            updatePreferences({ [type]: value });
        }
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter' && user) {
            addSearchQuery(e.target.value);
        }
    };

    const filteredNotes = notesData.filter(note => {
        // Folder hierarchy check
        const matchesFolder = (currentFolder?.id || 'root') === (note.parentId || 'root');
        
        // If it's a folder, we show it if it matches the current directory
        if (note.isFolder) return matchesFolder;

        // Unified filters from workspace header
        const matchesBranch = !selBranch || note.branch === selBranch || note.branch === 'Common';
        const matchesSyllabus = !selSyllabus || note.syllabus === selSyllabus;
        const matchesSemester = !selSemester || note.semester === selSemester;
        
        return matchesFolder && matchesBranch && matchesSyllabus && matchesSemester;
    });

    return (
        <div className="container notes-page">
            <div className="workspace-selectors">
                <div className="selector-group">
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
                </div>

                <div className="search-bar-modern">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Quick search..."
                        onKeyDown={handleSearch}
                    />
                </div>
            </div>

            {/* Breadcrumbs */}
            <div className="breadcrumbs" style={{margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem'}}>
                <span 
                    onClick={() => setCurrentFolder(null)} 
                    style={{cursor: 'pointer', color: !currentFolder ? 'var(--accent-color)' : 'inherit', fontWeight: !currentFolder ? '600' : '400'}}
                >
                    All Resources
                </span>
                {currentFolder && (
                    <>
                        <span>/</span>
                        <span style={{color: 'var(--accent-color)', fontWeight: '600'}}>{currentFolder.title}</span>
                    </>
                )}
            </div>

            {loadingNotes ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                    <div className="loader"></div>
                </div>
            ) : filteredNotes.length > 0 ? (
                <div className="notes-grid">
                    {filteredNotes.map(note => (
                        <div key={note.id} className="folder-card card" onClick={() => handleView(note)}>
                            <div className="folder-icon-wrapper">
                                {note.isFolder ? (
                                    <Folder size={20} color="#ffffff" strokeWidth={2.5} />
                                ) : note.type === 'Paper' ? (
                                    <FileSpreadsheet size={20} color="#ffffff" strokeWidth={2} />
                                ) : (
                                    <FileText size={20} color="#ffffff" strokeWidth={2} />
                                )}
                            </div>
                            <div className="folder-info">
                                <h3 className="folder-title" title={note.title}>{note.title}</h3>
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
                                            title="Add to Workspace"
                                        >
                                            {isFavorited(note.id, 'note') ? <Heart size={20} fill="white" /> : <Plus size={20} />}
                                        </button>
                                        <button 
                                            className="circle-action-btn btn-view"
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                handleView(note); 
                                                setViewUrl(note.url);
                                            }}
                                            title="Quick View"
                                        >
                                            <Eye size={20} />
                                        </button>
                                        <button 
                                            className="circle-action-btn btn-download"
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                handleDownload(note);
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
                    <h3>No resources found</h3>
                    <p>Try adjusting your branch or syllabus filters above.</p>
                </div>
            )}

            {/* In-page Document Viewer */}
            {viewUrl && <IframeModal url={viewUrl} onClose={() => setViewUrl(null)} />}
        </div>
    );
}
