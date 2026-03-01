import { useState, useEffect } from 'react';
import { Search, Download, Folder, FileText, Eye, Plus, Heart, FilterX } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import IframeModal from '../components/IframeModal';
import './Notes.css';

export default function DCET() {
    const { user, addRecentlyViewed, addDownload, toggleFavorite, isFavorited, addSearchQuery } = useAuthContext();
    const [dcetData, setDcetData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewUrl, setViewUrl] = useState(null);
    const [currentFolder, setCurrentFolder] = useState(null); // null means root

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
        if (e.key === 'Enter' && user) {
            addSearchQuery(e.target.value);
        }
    };

    const filteredDcet = dcetData.filter(item => {
        const matchesFolder = (currentFolder?.id || 'root') === (item.parentId || 'root');
        return matchesFolder;
    });

    return (
        <div className="container notes-page">
            <div className="page-header flex-between">
                <div>
                    <h1 className="page-title">DCET Preparation</h1>
                    <p className="page-subtitle">Diploma Common Entrance Test resources and materials.</p>
                </div>
                <div className="search-bar-modern">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search DCET materials..."
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
