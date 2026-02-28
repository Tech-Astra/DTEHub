import { Search, Download, Folder, Eye, Plus, Heart } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import './Notes.css';

const notesData = [
    { id: 1, title: 'OS (CS235AI)', chapter: 'Ch 4: Trees & Graphs', author: 'Prof. Sharma', size: '2.1 MB', rating: 4.8 },
    { id: 2, title: 'Maths (MAT231CT)', chapter: 'Ch 3: Process Scheduling', author: 'Dr. R. K. Singh', size: '3.4 MB', rating: 4.5 },
    { id: 3, title: 'DTL (CS237DL)', chapter: 'Ch 6: Transport Layer', author: 'Prof. Sharma', size: '1.8 MB', rating: 4.7 },
    { id: 4, title: 'DSA (IS233AI)', chapter: 'Ch 2: SDLC Models', author: 'Mrs. Anjali', size: '4.2 MB', rating: 4.6 },
    { id: 5, title: 'ADLD (CS234AI)', chapter: 'Ch 5: Normalization', author: 'Dr. R. K. Singh', size: '2.5 MB', rating: 4.9 },
    { id: 6, title: 'Environment and Sustainability (CV232AT)', chapter: 'General', author: 'Mr. Verma', size: '1.5 MB', rating: 4.4 },
];

export default function Notes() {
    const { user, addRecentlyViewed, addDownload, toggleFavorite, isFavorited, addSearchQuery } = useAuthContext();

    const handleView = (note) => {
        if (user) {
            addRecentlyViewed({
                itemId: note.id,
                type: 'note',
                title: note.title,
                chapter: note.chapter,
            });
        }
        // Redirect to PDF viewer or something equivalent...
        alert(`Opening ${note.title}`);
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
        alert(`Downloading ${note.title}`);
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

    return (
        <div className="container notes-page">
            <div className="page-header flex-between">
                <div>
                    <h1 className="page-title">Resource Folders</h1>
                    <p className="page-subtitle">Your one-stop destination for all college resource</p>
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

            <div className="notes-grid">
                {notesData.map(note => (
                    <div key={note.id} className="folder-card card" onClick={() => handleView(note)}>
                        <div className="folder-icon-wrapper">
                            <Folder size={20} fill="white" color="white" />
                        </div>
                        <div className="folder-info">
                            <h3 className="folder-title">{note.title}</h3>
                        </div>

                        {/* Hover Actions shown as circles (based on your screenshot) */}
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
                                    onClick={(e) => { e.stopPropagation(); handleView(note); }}
                                    title="Quick View"
                                >
                                    <Eye size={20} />
                                </button>
                                <button 
                                    className="circle-action-btn btn-download"
                                    onClick={(e) => { e.stopPropagation(); handleDownload(note); }}
                                    title="Download"
                                >
                                    <Download size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
