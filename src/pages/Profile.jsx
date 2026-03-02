import { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../firebase';
import {
    Building,
    Hash,
    GraduationCap,
    Edit2,
    Save,
    X,
} from 'lucide-react';
import CustomSelect from '../components/CustomSelect';
import './Profile.css';

export default function Profile() {
    const { user, loading } = useAuthContext();
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
                    setProfileData(prev => ({ ...prev, name: user.displayName || '' }));
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
                                    onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                    className="profile-input"
                                />
                                <input
                                    type="text"
                                    placeholder="College Name"
                                    value={profileData.college}
                                    onChange={e => setProfileData({ ...profileData, college: e.target.value })}
                                    className="profile-input"
                                />
                                <div className="profile-input-row">
                                    <input
                                        type="text"
                                        placeholder="USN (Optional, e.g. 1RV20CS001)"
                                        value={profileData.usn}
                                        onChange={e => setProfileData({ ...profileData, usn: e.target.value })}
                                        className="profile-input"
                                    />
                                    <CustomSelect
                                        options={[
                                            { value: '1st Year', label: '1st Year' },
                                            { value: '2nd Year', label: '2nd Year' },
                                            { value: '3rd Year', label: '3rd Year' },
                                            { value: 'Alumni', label: 'Alumni' }
                                        ]}
                                        value={profileData.year}
                                        onChange={val => setProfileData({ ...profileData, year: val })}
                                        placeholder="Select Year"
                                        icon={GraduationCap}
                                    />
                                </div>
                                <div className="profile-edit-actions">
                                    <button className="btn-save" onClick={handleSaveProfile} disabled={saving}>
                                        {saving ? 'Saving...' : <><Save size={16} /> Save</>}
                                    </button>
                                    <button className="btn-cancel" onClick={() => setIsEditing(false)}>
                                        <X size={16} /> Cancel
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
                                        <span className="profile-tag"><Building size={14} /> {profileData.college}</span>
                                    )}
                                    {profileData.usn && (
                                        <span className="profile-tag"><Hash size={14} /> {profileData.usn.toUpperCase()}</span>
                                    )}
                                    {profileData.year && (
                                        <span className="profile-tag"><GraduationCap size={14} /> {profileData.year}</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </div>
    );
}
