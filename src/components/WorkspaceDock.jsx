import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, X, History, Heart, Download, FileText, ChevronRight } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';

export default function WorkspaceDock() {
    const navigate = useNavigate();
    const { user, workspace } = useAuthContext();
    const [panelOpen, setPanelOpen] = useState(false);

    const wsData = workspace || { recentlyViewed: [], downloads: [], favorites: [] };

    return (
        <>
            {/* Floating Workspace Dock — Left Side */}
            <div className="floating-dock-left">
                <button className="dock-btn dock-workspace" title="Workspace" onClick={() => setPanelOpen(!panelOpen)}>
                    <LayoutGrid size={24} />
                </button>
                <span className="dock-label">Workspace</span>
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
                                <Heart size={16} className="ws-icon-red" fill="currentColor" />
                                <span>Favorites</span>
                                <span className="ws-count">{wsData.favorites.length}</span>
                            </div>
                            <div className="ws-items-list">
                                {wsData.favorites.length > 0 ? (
                                    wsData.favorites.slice(0, 5).map(item => (
                                        <div key={item.id} className="ws-item" onClick={() => { navigate(item.type === 'note' ? '/notes' : '/papers'); setPanelOpen(false); }}>
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
                                <History size={16} className="ws-icon-yellow" />
                                <span>Recently Viewed</span>
                                <span className="ws-count">{wsData.recentlyViewed.length}</span>
                            </div>
                            <div className="ws-items-list">
                                {wsData.recentlyViewed.length > 0 ? (
                                    wsData.recentlyViewed.slice(0, 5).map(item => (
                                        <div key={item.id} className="ws-item" onClick={() => { navigate(item.type === 'note' ? '/notes' : '/papers'); setPanelOpen(false); }}>
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
                                <Download size={16} className="ws-icon-green" />
                                <span>Downloads</span>
                                <span className="ws-count">{wsData.downloads.length}</span>
                            </div>
                            <div className="ws-items-list">
                                {wsData.downloads.length > 0 ? (
                                    wsData.downloads.slice(0, 5).map(item => (
                                        <div key={item.id} className="ws-item" onClick={() => { navigate(item.type === 'note' ? '/notes' : '/papers'); setPanelOpen(false); }}>
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

                        {/* View Full Profile */}
                        <button className="ws-view-all" onClick={() => { navigate('/profile'); setPanelOpen(false); }}>
                            View Full Profile <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Overlay */}
            {panelOpen && <div className="ws-overlay" onClick={() => setPanelOpen(false)} />}
        </>
    );
}
