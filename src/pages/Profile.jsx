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

            <main className="profile-workspace-content">
                <div className="workspace-grid-premium">
                    {/* Favorites Section */}
                    <section className="ws-card-premium">
                        <div className="ws-card-header">
                            <div className="ws-header-title">
                                <Heart size={20} className="ws-icon-red" fill="currentColor" />
                                <h3>Favorites</h3>
                            </div>
                            <span className="ws-badge-count">{workspace.favorites.length}</span>
                        </div>
                        <div className="ws-card-list">
                            {workspace.favorites.length > 0 ? (
                                workspace.favorites.map(item => (
                                    <div key={item.id} className="ws-item-row" onClick={() => navigate(item.type === 'dcet' ? '/dcet' : '/notes')}>
                                        <div className="ws-item-icon"><FileText size={18} /></div>
                                        <div className="ws-item-info">
                                            <h4>{item.title}</h4>
                                            <span>{item.chapter || 'Saved Resource'}</span>
                                        </div>
                                        <ExternalLink size={14} className="ws-arrow" />
                                    </div>
                                ))
                            ) : (
                                <div className="ws-empty-state">
                                    <Heart size={32} opacity={0.2} />
                                    <p>Your favorite resources will appear here.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Recently Viewed */}
                    <section className="ws-card-premium">
                        <div className="ws-card-header">
                            <div className="ws-header-title">
                                <History size={20} className="ws-icon-yellow" />
                                <h3>Recently Viewed</h3>
                            </div>
                            <span className="ws-badge-count">{workspace.recentlyViewed.length}</span>
                        </div>
                        <div className="ws-card-list">
                            {workspace.recentlyViewed.length > 0 ? (
                                workspace.recentlyViewed.map(item => (
                                    <div key={item.id} className="ws-item-row" onClick={() => navigate(item.type === 'dcet' ? '/dcet' : '/notes')}>
                                        <div className="ws-item-icon"><FileText size={18} /></div>
                                        <div className="ws-item-info">
                                            <h4>{item.title}</h4>
                                            <span>{item.chapter || 'Viewed recently'}</span>
                                        </div>
                                        <ExternalLink size={14} className="ws-arrow" />
                                    </div>
                                ))
                            ) : (
                                <div className="ws-empty-state">
                                    <History size={32} opacity={0.2} />
                                    <p>Items you view will be tracked here.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Downloads History */}
                    <section className="ws-card-premium">
                        <div className="ws-card-header">
                            <div className="ws-header-title">
                                <Download size={20} className="ws-icon-green" />
                                <h3>Downloads</h3>
                            </div>
                            <span className="ws-badge-count">{workspace.downloads.length}</span>
                        </div>
                        <div className="ws-card-list">
                            {workspace.downloads.length > 0 ? (
                                workspace.downloads.map(item => (
                                    <div key={item.id} className="ws-item-row" onClick={() => navigate(item.type === 'dcet' ? '/dcet' : '/notes')}>
                                        <div className="ws-item-icon"><FileText size={18} /></div>
                                        <div className="ws-item-info">
                                            <h4>{item.title}</h4>
                                            <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                                        </div>
                                        <ExternalLink size={14} className="ws-arrow" />
                                    </div>
                                ))
                            ) : (
                                <div className="ws-empty-state">
                                    <Download size={32} opacity={0.2} />
                                    <p>Resources you download will be listed here.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
