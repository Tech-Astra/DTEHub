import { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { ref, onValue, set, runTransaction } from 'firebase/database';
import { database } from '../firebase';
import { Save, User, Building, Hash, GraduationCap } from 'lucide-react';
import CustomSelect from './CustomSelect';
import './ProfileOnboardingModal.css';

export default function ProfileOnboardingModal() {
    const { user, loading } = useAuthContext();
    const [needsProfile, setNeedsProfile] = useState(false);
    const [checking, setChecking] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        college: '',
        usn: '',
        year: ''
    });

    useEffect(() => {
        if (!user || loading) {
            setNeedsProfile(false);
            setChecking(false);
            return;
        }

        const profileRef = ref(database, `users/${user.uid}/profile`);
        const unsubscribe = onValue(profileRef, (snapshot) => {
            const data = snapshot.val();
            // Show modal ONLY if the user has no profile data at all (first time registering)
            if (!data) {
                setProfileData({
                    name: user.displayName || '',
                    college: '',
                    usn: '',
                    year: ''
                });
                setNeedsProfile(true);
            } else {
                setNeedsProfile(false);
            }
            setChecking(false);
        });

        return () => unsubscribe();
    }, [user, loading]);

    if (checking || !needsProfile) {
        return null;
    }

    const handleSave = async (e) => {
        e.preventDefault();

        if (!profileData.name || !profileData.college || !profileData.year) {
            alert("Please fill in all required details to continue.");
            return;
        }

        setSaving(true);
        try {
            await set(ref(database, `users/${user.uid}/profile`), {
                ...profileData,
                updatedAt: Date.now()
            });
            // Atomically increment the verified users count for the public stats bar
            runTransaction(ref(database, 'stats/totalVerifiedUsers'), (current) => (current || 0) + 1);
            setNeedsProfile(false);
        } catch (error) {
            console.error("Error saving profile details:", error);
            alert("Failed to save details. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="onboarding-modal-overlay">
            <div className="onboarding-modal">
                <div className="onboarding-header">
                    <h2>Complete Your Profile</h2>
                    <p>Tell us a bit about yourself so we can personalize your study hub experience.</p>
                </div>

                <form className="onboarding-form" onSubmit={handleSave}>
                    <div className="input-group">
                        <User size={18} className="input-icon" />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={profileData.name}
                            onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <Building size={18} className="input-icon" />
                        <input
                            type="text"
                            placeholder="College Name"
                            value={profileData.college}
                            onChange={e => setProfileData({ ...profileData, college: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group-row">
                        <div className="input-group">
                            <Hash size={18} className="input-icon" />
                            <input
                                type="text"
                                placeholder="USN (Optional, e.g. 1RV20CS001)"
                                value={profileData.usn}
                                onChange={e => setProfileData({ ...profileData, usn: e.target.value })}
                            />
                        </div>

                        <div className="input-group select-group">
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
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-onboarding-save" disabled={saving}>
                        {saving ? 'Saving...' : <><Save size={18} /> Complete Setup</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
