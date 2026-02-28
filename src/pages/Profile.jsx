import { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../firebase';
import { 
    History, 
    Heart, 
    Download, 
    FileText, 
    Calendar,
    ExternalLink,
    Edit2,
    Save,
    X,
    Building,
    Hash,
    GraduationCap
} from 'lucide-react';
import './Profile.css';

export default function Profile() {
    const { user, workspace, loading } = useAuthContext();
    const navigate = useNavigate();

    // Profile state
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        college: '',
        usn: '',
        year: ''
    });

    // Fetch user profile data from firebase
    useEffect(() => {
        if (user?.uid) {
            const profileRef = ref(database, `users/${user.uid}/profile`);
            const unsubscribe = onValue(profileRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setProfileData({
                        name: data.name || user.displayName || '',
                        college: data.college || '',
                        usn: data.usn || '',
                        year: data.year || ''
                    });
                } else {
                    setProfileData(prev => ({...prev, name: user.displayName || ''}));
                }
            });
            return () => unsubscribe();
        }
    }, [user]);

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

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await set(ref(database, `users/${user.uid}/profile`), {
                ...profileData,
                updatedAt: Date.now()
            });
            setIsEditing(false);
        } catch (err) {
            console.error("Error saving profile", err);
        } finally {
            setSaving(false);
        }
    };

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
                    
                    <div className="profile-details-section">
                        {isEditing ? (
                            <div className="profile-edit-form">
                                <input 
                                    type="text" 
                                    placeholder="Full Name" 
                                    value={profileData.name}
                                    onChange={e => setProfileData({...profileData, name: e.target.value})}
                                    className="profile-input"
                                />
                                <input 
                                    type="text" 
                                    placeholder="College Name" 
                                    value={profileData.college}
                                    onChange={e => setProfileData({...profileData, college: e.target.value})}
                                    className="profile-input"
                                />
                                <div className="profile-input-row">
                                    <input 
                                        type="text" 
                                        placeholder="USN (e.g. 1RV20CS001)" 
                                        value={profileData.usn}
                                        onChange={e => setProfileData({...profileData, usn: e.target.value})}
                                        className="profile-input"
                                    />
                                    <select 
                                        value={profileData.year}
                                        onChange={e => setProfileData({...profileData, year: e.target.value})}
                                        className="profile-input"
                                    >
                                        <option value="">Select Year</option>
                                        <option value="1st Year">1st Year</option>
                                        <option value="2nd Year">2nd Year</option>
                                        <option value="3rd Year">3rd Year</option>
                                        <option value="Alumni">Alumni</option>
                                    </select>
                                </div>
                                <div className="profile-edit-actions">
                                    <button className="btn-save" onClick={handleSaveProfile} disabled={saving}>
                                        {saving ? 'Saving...' : <><Save size={16}/> Save</>}
                                    </button>
                                    <button className="btn-cancel" onClick={() => setIsEditing(false)}>
                                        <X size={16}/> Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="profile-view-mode">
                                <div className="profile-name-row">
                                    <h1 className="profile-name">{profileData.name || user.displayName}</h1>
                                    <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>
                                        <Edit2 size={14} /> Edit
                                    </button>
                                </div>
                                <p className="profile-email">{user.email}</p>
                                
                                <div className="profile-meta-tags">
                                    {profileData.college && (
                                        <span className="profile-tag"><Building size={14}/> {profileData.college}</span>
                                    )}
                                    {profileData.usn && (
                                        <span className="profile-tag"><Hash size={14}/> {profileData.usn.toUpperCase()}</span>
                                    )}
                                    {profileData.year && (
                                        <span className="profile-tag"><GraduationCap size={14}/> {profileData.year}</span>
                                    )}
                                    <span className="profile-badge">Student Workspace</span>
                                </div>
                            </div>
                        )}
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
