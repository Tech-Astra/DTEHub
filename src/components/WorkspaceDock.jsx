import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, X, History, Heart, Download, FileText, ChevronRight } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import InstallPWA from './InstallPWA';

export default function WorkspaceDock() {
    const navigate = useNavigate();
    const { user, workspace } = useAuthContext();
    const [panelOpen, setPanelOpen] = useState(false);
    const [activeSection, setActiveSection] = useState(null); // 'favorites', 'recent', 'downloads'

    // Toggle body class to hide other floating elements when workspace is open
    useEffect(() => {
        if (panelOpen) {
            document.body.classList.add('workspace-active');
        } else {
            document.body.classList.remove('workspace-active');
        }
        return () => document.body.classList.remove('workspace-active');
    }, [panelOpen]);

    const wsData = workspace || { recentlyViewed: [], downloads: [], favorites: [] };

    const handleItemClick = (item) => {
        if (!item) return;
        const page = item.type === 'dcet' ? '/dcet' : item.type === 'paper' ? '/papers' : '/notes';
        navigate(page);
        setPanelOpen(false);
        setActiveSection(null);
    };

    return (
        <>
            {/* Floating Workspace Dock — Left Side */}
            <div className="floating-dock-left">
                <button className="dock-btn dock-workspace" title="Workspace" onClick={() => setPanelOpen(!panelOpen)}>
                    <LayoutGrid size={24} />
                </button>
            </div>

            {/* Workspace Slide Panel */}
            <div className={`workspace-panel ${panelOpen ? 'panel-open' : ''}`}>
                <div className="ws-panel-header">
                    <h3 className="ws-panel-title">
                        <LayoutGrid size={20} /> My Workspace
                    </h3>
                    <button className="ws-close-btn" onClick={() => setPanelOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                {!user ? (
                    <div className="ws-empty-auth">
                        <p>Sign in to access your workspace</p>
                    </div>
                ) : (
                    <div className="ws-panel-body">
                        {/* Favorites */}
                        <div className="ws-section">
                            <div className="ws-section-header">
                                <div className="ws-header-left">
                                    <Heart size={16} className="ws-icon-red" fill="currentColor" />
                                    <span>Favorites</span>
                                    <span className="ws-count">{wsData.favorites.length}</span>
                                </div>
                                <button className="ws-view-full-link" onClick={() => setActiveSection('favorites')}>View All</button>
                            </div>
                            <div className="ws-items-list">
                                {wsData.favorites.length > 0 ? (
                                    wsData.favorites.slice(0, 5).map(item => (
                                        <div key={item.id} className="ws-item" onClick={() => handleItemClick(item)}>
                                            <FileText size={14} />
                                            <span className="ws-item-title">{item.title}</span>
                                            <ChevronRight size={14} className="ws-item-arrow" />
                                        </div>
                                    ))
                                ) : (
                                    <p className="ws-empty">No favorites yet</p>
                                )}
                            </div>
                        </div>

                        {/* Recently Viewed */}
                        <div className="ws-section">
                            <div className="ws-section-header">
                                <div className="ws-header-left">
                                    <History size={16} className="ws-icon-yellow" />
                                    <span>Recently Viewed</span>
                                    <span className="ws-count">{wsData.recentlyViewed.length}</span>
                                </div>
                                <button className="ws-view-full-link" onClick={() => setActiveSection('recent')}>View All</button>
                            </div>
                            <div className="ws-items-list">
                                {wsData.recentlyViewed.length > 0 ? (
                                    wsData.recentlyViewed.slice(0, 5).map(item => (
                                        <div key={item.id} className="ws-item" onClick={() => handleItemClick(item)}>
                                            <FileText size={14} />
                                            <span className="ws-item-title">{item.title}</span>
                                            <ChevronRight size={14} className="ws-item-arrow" />
                                        </div>
                                    ))
                                ) : (
                                    <p className="ws-empty">No history yet</p>
                                )}
                            </div>
                        </div>

                        {/* Downloads */}
                        <div className="ws-section">
                            <div className="ws-section-header">
                                <div className="ws-header-left">
                                    <Download size={16} className="ws-icon-green" />
                                    <span>Downloads</span>
                                    <span className="ws-count">{wsData.downloads.length}</span>
                                </div>
                                <button className="ws-view-full-link" onClick={() => setActiveSection('downloads')}>View All</button>
                            </div>
                            <div className="ws-items-list">
                                {wsData.downloads.length > 0 ? (
                                    wsData.downloads.slice(0, 5).map(item => (
                                        <div key={item.id} className="ws-item" onClick={() => handleItemClick(item)}>
                                            <FileText size={14} />
                                            <span className="ws-item-title">{item.title}</span>
                                            <ChevronRight size={14} className="ws-item-arrow" />
                                        </div>
                                    ))
                                ) : (
                                    <p className="ws-empty">No downloads yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="ws-panel-footer">
                    <InstallPWA />
                </div>
            </div>

            {/* Detailed Modal Popup */}
            {activeSection && (
                <div className="filter-modal-overlay" onClick={() => setActiveSection(null)}>
                    <div className="filter-modal-content card" onClick={e => e.stopPropagation()} style={{maxWidth: '600px', borderRadius: '24px'}}>
                        <div className="filter-modal-header">
                            <h3 style={{textTransform: 'capitalize'}}>
                                {activeSection === 'recent' ? <History size={24} /> : 
                                 activeSection === 'favorites' ? <Heart size={24} fill="currentColor" /> :
                                 <Download size={24} />}
                                {activeSection === 'recent' ? 'Recently Viewed' : activeSection}
                            </h3>
                            <button className="close-btn" onClick={() => setActiveSection(null)}>&times;</button>
                        </div>
                        <div className="ws-modal-body" style={{maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem'}}>
                            <div className="ws-items-list">
                                {wsData[activeSection === 'recent' ? 'recentlyViewed' : activeSection].map(item => (
                                    <div key={item.id} className="ws-item" onClick={() => handleItemClick(item)}>
                                        <FileText size={16} />
                                        <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                                            <span className="ws-item-title">{item.title}</span>
                                            <span style={{fontSize: '0.7rem', opacity: 0.5}}>
                                                {item.type.toUpperCase()} • {new Date(item.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <ChevronRight size={16} />
                                    </div>
                                ))}
                            </div>
                            {wsData[activeSection === 'recent' ? 'recentlyViewed' : activeSection].length === 0 && (
                                <p className="ws-empty" style={{textAlign: 'center', padding: '2rem'}}>No data available in this section.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Overlay */}
            {panelOpen && <div className="ws-overlay" onClick={() => setPanelOpen(false)} />}
        </>
    );
}
