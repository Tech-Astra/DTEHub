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
import { useAuthContext } from '../context/AuthContext';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import IframeModal from '../components/IframeModal';
import './Notes.css';

export default function Notes() {
    const { user, addRecentlyViewed, addDownload, toggleFavorite, isFavorited, addSearchQuery } = useAuthContext();
    const [userYear, setUserYear] = useState('');
    const [userBranch, setUserBranch] = useState('');
    const [notesData, setNotesData] = useState([]);
    const [loadingNotes, setLoadingNotes] = useState(true);
    const [viewUrl, setViewUrl] = useState(null);
    const [currentFolder, setCurrentFolder] = useState(null); // null means root

    // Fetch User Profile
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

    const handleFavorite = (note) => {
        if (user) {
            toggleFavorite({
                itemId: note.id,
                type: 'note',
                title: note.title,
                chapter: note.chapter,
            });
        }
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter' && user) {
            addSearchQuery(e.target.value);
        }
    };

    // Filter notes based on user year. If not logged in or no year selected, show all notes or prompt them.
    // Let's show all notes if no userYear, but prioritize if there is one.
    const filteredNotes = notesData.filter(note => {
        // Folder hierarchy check
        const matchesFolder = (currentFolder?.id || 'root') === (note.parentId || 'root');
        
        // If not deeply nested, apply year/branch filters
        // If it's a folder, we might want to show it more broadly or strictly. 
        // For now, let's show resources that match year OR are common.
        const matchesYear = !userYear || userYear === 'Alumni' || note.academicYear === userYear || note.academicYear === 'Common' || !note.academicYear;
        const matchesBranch = !userBranch || note.branch === userBranch || note.branch === 'Common' || !note.branch;
        
        return matchesFolder && matchesYear && matchesBranch;
    });

    return (
        <div className="container notes-page">
            <div className="page-header flex-between">
                <div>
                    <h1 className="page-title">Notes & Question Papers</h1>
                    <p className="page-subtitle">
                        {userYear && userYear !== 'Alumni' 
                            ? `Showing filtered notes and papers for your academic year (${userYear})` 
                            : 'Your one-stop destination for all college resources'}
                    </p>
                </div>
                <div className="search-bar-modern">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search files..."
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
                                    <Folder size={18} fill="var(--accent-color)" color="var(--accent-color)" />
                                ) : note.type === 'Paper' ? (
                                    <FileSpreadsheet size={18} color="#ef4444" />
                                ) : (
                                    <FileText size={18} color="var(--text-muted)" />
                                )}
                            </div>
                            <div className="folder-info" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                <h3 className="folder-title" title={note.title}>{note.title}</h3>
                                {!note.isFolder && note.type && (
                                    <span style={{
                                        fontSize: '0.65rem',
                                        padding: '0.1rem 0.4rem',
                                        borderRadius: '4px',
                                        width: 'max-content',
                                        backgroundColor: note.type === 'Paper' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                                        color: note.type === 'Paper' ? '#ef4444' : '#eab308'
                                    }}>
                                        {note.type} • {note.chapter}
                                    </span>
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
                    <h3>No resources found for {userYear}</h3>
                    <p>We're continually adding new notes and papers. Check back later!</p>
                </div>
            )}

            {/* In-page Document Viewer */}
            {viewUrl && <IframeModal url={viewUrl} onClose={() => setViewUrl(null)} />}
        </div>
    );
}
