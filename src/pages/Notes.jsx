import { useState, useEffect } from 'react';
import { Search, Download, Folder, Eye, Plus, Heart, FilterX } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import IframeModal from '../components/IframeModal';
import './Notes.css';

export default function Notes() {
    const { user, addRecentlyViewed, addDownload, toggleFavorite, isFavorited, addSearchQuery } = useAuthContext();
    const [userYear, setUserYear] = useState('');
    const [notesData, setNotesData] = useState([]);
    const [loadingNotes, setLoadingNotes] = useState(true);
    const [viewUrl, setViewUrl] = useState(null);

    // Fetch User Profile
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
        if (user) {
            addDownload({
                itemId: note.id,
                type: 'note',
                title: note.title,
                chapter: note.chapter,
            });
        }
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
    const filteredNotes = userYear && userYear !== 'Alumni'
        ? notesData.filter(note => note.academicYear === userYear)
        : notesData;

    return (
        <div className="container notes-page">
            <div className="page-header flex-between">
                <div>
                    <h1 className="page-title">Resource Folders</h1>
                    <p className="page-subtitle">
                        {userYear && userYear !== 'Alumni' 
                            ? `Showing filtered notes for your academic year (${userYear})` 
                            : 'Your one-stop destination for all college resource'}
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

            {loadingNotes ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                    <div className="loader"></div>
                </div>
            ) : filteredNotes.length > 0 ? (
                <div className="notes-grid">
                    {filteredNotes.map(note => (
                        <div key={note.id} className="folder-card card" onClick={() => handleView(note)}>
                            <div className="folder-icon-wrapper">
                                <Folder size={20} fill="white" color="white" />
                            </div>
                            <div className="folder-info">
                                <h3 className="folder-title">{note.title}</h3>
                                {(!userYear || userYear === 'Alumni') ? (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{note.academicYear} • {note.branch}</span>
                                ) : (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{note.chapter} • {note.branch}</span>
                                )}
                            </div>

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
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                    <FilterX size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <h3>No notes found for {userYear}</h3>
                    <p>We're continually adding new resources. Check back later!</p>
                </div>
            )}

            {/* In-page Document Viewer */}
            {viewUrl && <IframeModal url={viewUrl} onClose={() => setViewUrl(null)} />}
        </div>
    );
}
