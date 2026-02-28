import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
    History, 
    Heart, 
    Download, 
    User, 
    ChevronRight, 
    FileText, 
    Calendar,
    ExternalLink
} from 'lucide-react';
import './Profile.css';

export default function Profile() {
    const { user, workspace, loading } = useAuthContext();
    const navigate = useNavigate();

    if (!user && !loading) {
        navigate('/');
        return null;
    }

    if (loading) {
        return (
            <div className="container profile-page flex-center">
                <div className="loader"></div>
            </div>
        );
    }

    const { recentlyViewed, downloads, favorites } = workspace;

    const WorkspaceItem = ({ item }) => (
        <div className="workspace-card card">
            <div className="workspace-item-icon">
                <FileText size={20} />
            </div>
            <div className="workspace-item-info">
                <h4 className="workspace-item-title">{item.title}</h4>
                <div className="workspace-item-meta">
                    {item.type === 'note' ? (
                        <span>{item.chapter}</span>
                    ) : (
                        <span>{item.year} • {item.paperType}</span>
                    )}
                </div>
            </div>
            <div className="workspace-item-date">
                <Calendar size={14} />
                <span>{item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Recently'}</span>
            </div>
            <button className="workspace-action-btn" onClick={() => navigate(item.type === 'note' ? '/notes' : '/papers')}>
                <ExternalLink size={16} />
            </button>
        </div>
    );

    return (
        <div className="container profile-page">
            <header className="profile-header">
                <div className="profile-user-info">
                    <img src={user.photoURL} alt={user.displayName} className="profile-large-avatar" referrerPolicy="no-referrer" />
                    <div>
                        <h1 className="profile-name">{user.displayName}</h1>
                        <p className="profile-email">{user.email}</p>
                        <div className="profile-badge">Student Workspace</div>
                    </div>
                </div>
            </header>

            <div className="profile-grid">
                {/* Favorites Section */}
                <section className="profile-section">
                    <div className="section-header">
                        <div className="section-title-wrapper">
                            <Heart size={20} className="text-red" fill="currentColor" />
                            <h2 className="section-title">Your Favorites</h2>
                        </div>
                        <span className="count-pill">{favorites.length}</span>
                    </div>
                    <div className="workspace-list">
                        {favorites.length > 0 ? (
                            favorites.map(item => <WorkspaceItem key={item.id} item={item} />)
                        ) : (
                            <div className="empty-state">No favorites yet.</div>
                        )}
                    </div>
                </section>

                {/* Recently Viewed Section */}
                <section className="profile-section">
                    <div className="section-header">
                        <div className="section-title-wrapper">
                            <History size={20} className="text-yellow" />
                            <h2 className="section-title">Recently Viewed</h2>
                        </div>
                        <span className="count-pill">{recentlyViewed.length}</span>
                    </div>
                    <div className="workspace-list">
                        {recentlyViewed.length > 0 ? (
                            recentlyViewed.map(item => <WorkspaceItem key={item.id} item={item} />)
                        ) : (
                            <div className="empty-state">No history found.</div>
                        )}
                    </div>
                </section>

                {/* Downloads Section */}
                <section className="profile-section">
                    <div className="section-header">
                        <div className="section-title-wrapper">
                            <Download size={20} className="text-green" />
                            <h2 className="section-title">Downloads</h2>
                        </div>
                        <span className="count-pill">{downloads.length}</span>
                    </div>
                    <div className="workspace-list">
                        {downloads.length > 0 ? (
                            downloads.map(item => <WorkspaceItem key={item.id} item={item} />)
                        ) : (
                            <div className="empty-state">No downloads yet.</div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
