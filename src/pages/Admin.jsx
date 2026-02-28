import { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { database } from '../firebase';
import { ref, push, set, onValue, remove } from 'firebase/database';
import { Plus, Trash2, Edit2, Link as LinkIcon, FolderPlus, FileText, Users, X, Zap } from 'lucide-react';
import './Admin.css';

// Admin allowed list
const ADMIN_EMAILS = [
    'shivarajmani2005@gmail.com',
    'vivekvernekar02@gmail.com',
    'contactus.techastra@gmail.com'
];

export default function Admin() {
    const { user, loading } = useAuthContext();
    const [activeTab, setActiveTab] = useState('notes');
    
    // Form States
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [branch, setBranch] = useState(''); // E.g., Computer Science, Mechanical
    const [chapter, setChapter] = useState(''); // For Notes
    
    // Data list states
    const [resources, setResources] = useState([]);
    const [foldersList, setFoldersList] = useState([]); // List of items where isFolder: true
    const [usersList, setUsersList] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    
    // Admin Dashboard Stats
    const [totalUsers, setTotalUsers] = useState(0);
    const [editingId, setEditingId] = useState(null);
    const [parentId, setParentId] = useState('root'); 
    const [isFolder, setIsFolder] = useState(false); 
    const [folderTitle, setFolderTitle] = useState(''); // Separate state for new folder title

    useEffect(() => {
        let unsubscribeResources = () => {};
        let profilesUnsubscribe = () => {};

        if (user?.email && ADMIN_EMAILS.includes(user.email)) {
            // Fetch All Users - Only if Admin
            const profileRef = ref(database, 'users');
            profilesUnsubscribe = onValue(profileRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const arr = Object.keys(data).map(uid => ({
                        uid,
                        ...(data[uid].profile || {})
                    }));
                    setUsersList(arr);
                    setTotalUsers(arr.length);
                } else {
                    setUsersList([]);
                    setTotalUsers(0);
                }
            }, (error) => {
                console.warn("Permission denied for listing users. Update your Firebase Rules.", error);
            });

            // Fetch Resources
            const resourcesRef = ref(database, `resources/${activeTab}`);
            unsubscribeResources = onValue(resourcesRef, (snapshot) => {
                const data = snapshot.val();
                if (data && activeTab !== 'users') {
                    const arr = Object.keys(data).map(key => ({
                        id: key,
                        ...data[key]
                    }));
                    setResources(arr.reverse());
                    // Extract Folders for selection
                    setFoldersList(arr.filter(item => item.isFolder));
                } else {
                    setResources([]);
                    setFoldersList([]);
                }
            });
        }

        return () => {
            profilesUnsubscribe();
            unsubscribeResources();
        };
    }, [activeTab, user]);

    if (loading) return <div className="container flex-center" style={{minHeight: '50vh'}}><div className="loader"></div></div>;

    // Strict Admin Protection
    if (!user || !ADMIN_EMAILS.includes(user.email)) {
        return (
            <div className="container" style={{paddingTop: '5rem', textAlign: 'center'}}>
                <h2>Access Denied</h2>
                <p style={{color: 'var(--text-muted)'}}>You do not have permission to view the Admin Dashboard.</p>
            </div>
        );
    }


    const handleAddFolder = async (e) => {
        e.preventDefault();
        if (!folderTitle.trim()) return;
        setIsSaving(true);
        try {
            const folderRef = push(ref(database, `resources/${activeTab}`));
            await set(folderRef, {
                title: folderTitle,
                isFolder: true,
                parentId: 'root',
                academicYear,
                branch,
                timestamp: Date.now()
            });
            setFolderTitle('');
            alert("New folder created!");
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddResource = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        try {
            const newResource = {
                title,
                url, 
                academicYear,
                branch,
                isFolder: false,
                parentId: parentId || 'root',
                timestamp: Date.now(),
            };

            // Add tab-specific fields
            if (activeTab === 'notes') {
                newResource.chapter = chapter || 'General';
            } else if (activeTab === 'papers') {
                newResource.year = chapter || new Date().getFullYear().toString(); // Repurposing chapter input for paper year
            } else if (activeTab === 'dcet') {
                newResource.chapter = chapter || 'Preparation';
            }

            if (editingId) {
                // Update existing
                await set(ref(database, `resources/${activeTab}/${editingId}`), newResource);
                alert(`${activeTab.slice(0, -1)} updated successfully!`);
            } else {
                // Add new
                const resourceRef = push(ref(database, `resources/${activeTab}`));
                await set(resourceRef, newResource);
                alert(`New ${activeTab.slice(0, -1)} added successfully!`);
            }
            
            // Reset form
            setTitle('');
            setUrl('');
            setChapter('');
            setEditingId(null);
            // Kept year/branch same to allow rapid multi-adding
        } catch (error) {
            console.error("Error saving resource:", error);
            alert("Failed to save. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (res) => {
        setEditingId(res.id);
        setTitle(res.title);
        setUrl(res.url || '');
        setAcademicYear(res.academicYear);
        setBranch(res.branch);
        setChapter(activeTab === 'notes' ? res.chapter : res.year);
        setIsFolder(res.isFolder || false);
        setParentId(res.parentId || 'root');
        // Scroll to form for convenience
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleMove = async (res, newParentId) => {
        try {
            await set(ref(database, `resources/${activeTab}/${res.id}/parentId`), newParentId);
            alert("Moved successfully!");
        } catch (err) {
            console.error("Move failed", err);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setTitle('');
        setUrl('');
        setChapter('');
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this resource?")) {
            try {
                await remove(ref(database, `resources/${activeTab}/${id}`));
            } catch (err) {
                console.error("Delete failed", err);
            }
        }
    };

    return (
        <div className="container admin-page">
            <header className="admin-header flex-between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1>Resource Management</h1>
                    <p>Add and manage Google Drive links for Notes and Past Papers.</p>
                </div>
                
                <div className="admin-stat-card">
                    <div className="stat-icon-wrapper">
                        <Users size={24} color="var(--accent-color)" />
                    </div>
                    <div>
                        <span className="stat-label">Total Users</span>
                        <h2 className="stat-value">{totalUsers}</h2>
                    </div>
                </div>
            </header>

            <div className="admin-tabs">
                <button 
                    className={`admin-tab ${activeTab === 'notes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notes')}
                >
                    <FolderPlus size={18} /> Manage Notes
                </button>
                <button 
                    className={`admin-tab ${activeTab === 'papers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('papers')}
                >
                    <FileText size={18} /> Manage Papers
                </button>
                <button 
                    className={`admin-tab ${activeTab === 'dcet' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dcet')}
                >
                    <Zap size={18} /> Manage DCET
                </button>
                <button 
                    className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    <Users size={18} /> Registered Users
                </button>
            </div>

                {activeTab === 'users' ? (
                    <div className="admin-card card users-full-card">
                        <h3>Registered Students List</h3>
                        <div className="users-table-container">
                        <table className="admin-users-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>College (USN)</th>
                                    <th>Branch/Year</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersList.map((userProfile) => (
                                    <tr key={userProfile.uid}>
                                        <td>{userProfile.name || 'Anonymous Student'}</td>
                                        <td>{userProfile.email}</td>
                                        <td>{userProfile.college || 'Not set'} ({userProfile.usn || '-'})</td>
                                        <td>{userProfile.branch || '-'} • {userProfile.year || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                ) : (
                    <div className="admin-content-grid">
                        <div className="admin-sidebar-forms">
                            {/* NEW SECTION: Folder Creation */}
                            <div className="admin-card card folder-create-card">
                                <div className="card-header-with-icon">
                                    <FolderPlus size={20} color="var(--accent-color)" />
                                    <h3>Create New Folder</h3>
                                </div>
                                <form onSubmit={handleAddFolder} className="admin-form-mini" style={{flexDirection: 'column', gap: '0.75rem'}}>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Unit 1: OS Basics" 
                                        value={folderTitle} 
                                        onChange={e => setFolderTitle(e.target.value)}
                                        required
                                        style={{width: '100%'}}
                                    />
                                    <div className="form-row" style={{gap: '0.5rem'}}>
                                        <select value={academicYear} onChange={e => setAcademicYear(e.target.value)} style={{fontSize: '0.8rem', padding: '0.4rem'}}>
                                            <option value="">Year (All)</option>
                                            <option value="1st Year">1st Year</option>
                                            <option value="2nd Year">2nd Year</option>
                                            <option value="3rd Year">3rd Year</option>
                                        </select>
                                        <select value={branch} onChange={e => setBranch(e.target.value)} style={{fontSize: '0.8rem', padding: '0.4rem'}}>
                                            <option value="">Branch (All)</option>
                                            <option value="Common">Common</option>
                                            <option value="Computer Science">CS</option>
                                            <option value="Mechanical">Mechanical</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="btn-primary w-full" disabled={isSaving} style={{marginTop: 0}}>
                                        <Plus size={16} /> Create Folder
                                    </button>
                                </form>
                            </div>

                            {/* Add Resource Form (Simplified) */}
                            <div className="admin-card card form-card">
                                <h3>{editingId ? 'Edit' : 'Add New'} {activeTab === 'notes' ? 'Note' : activeTab === 'papers' ? 'Paper' : 'DCET Resource'}</h3>
                                <form className="admin-form" onSubmit={handleAddResource}>
                                    {editingId && (
                                        <div className="editing-banner">
                                            <span>Currently editing: <strong>{title}</strong></span>
                                            <button type="button" onClick={handleCancelEdit} className="btn-text">Cancel</button>
                                        </div>
                                    )}
                                    
                                    <div className="form-group">
                                        <label>Inside Folder:</label>
                                        <select 
                                            value={parentId} 
                                            onChange={e => setParentId(e.target.value)}
                                            style={{width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border-color)'}}
                                        >
                                            <option value="root">Main Directory (Root)</option>
                                            {foldersList.map(f => (
                                                <option key={f.id} value={f.id}>📁 {f.title}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Title / Subject Name</label>
                                        <input 
                                            type="text" 
                                            required 
                                            value={title} 
                                            onChange={e => setTitle(e.target.value)} 
                                            placeholder="e.g. Operating Systems (CS235AI)" 
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Google Drive URL</label>
                                        <div className="input-with-icon">
                                            <LinkIcon size={16} />
                                            <input 
                                                type="url" 
                                                required 
                                                value={url} 
                                                onChange={e => setUrl(e.target.value)} 
                                                placeholder="https://drive.google.com/..." 
                                            />
                                        </div>
                                    </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Academic Year</label>
                                        <select required value={academicYear} onChange={e => setAcademicYear(e.target.value)}>
                                            <option value="" disabled>Select Year</option>
                                            <option value="1st Year">1st Year</option>
                                            <option value="2nd Year">2nd Year</option>
                                            <option value="3rd Year">3rd Year</option>
                                            <option value="Alumni">Alumni</option>
                                        </select>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Branch</label>
                                        <select required value={branch} onChange={e => setBranch(e.target.value)}>
                                            <option value="" disabled>Select Branch</option>
                                            <option value="Common">Common (All Branches)</option>
                                            <option value="Computer Science">Computer Science</option>
                                            <option value="Mechanical">Mechanical</option>
                                            <option value="Electrical">Electrical</option>
                                            <option value="Civil">Civil</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>{activeTab === 'notes' ? 'Chapter / Module' : activeTab === 'papers' ? 'Exam Year' : 'Topic'}</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={chapter} 
                                        onChange={e => setChapter(e.target.value)} 
                                        placeholder={activeTab === 'notes' ? "e.g. Ch 4: Trees & Graphs" : activeTab === 'papers' ? "e.g. 2023" : "e.g. Physics Formulae"} 
                                    />
                                </div>

                                <div className="form-actions-admin">
                                    <button type="submit" className="btn-primary w-full" disabled={isSaving}>
                                        {isSaving ? 'Saving...' : <>{editingId ? <Edit2 size={18} /> : <Plus size={18} />} {editingId ? 'Update' : 'Add'} Resource</>}
                                    </button>
                                    {editingId && (
                                        <button type="button" className="btn-outline w-full" onClick={handleCancelEdit} style={{marginTop: '0.5rem'}}>
                                            Cancel Edit
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                        {/* List View */}
                        <div className="admin-card card list-card">
                            <h3>Current {activeTab === 'notes' ? 'Notes' : activeTab === 'papers' ? 'Papers' : 'DCET Resources'}</h3>
                            <div className="resource-list">
                                {resources.length === 0 ? (
                                    <div className="empty-state">No resources added yet.</div>
                                ) : (
                                    resources.map(res => (
                                        <div key={res.id} className="resource-item">
                                            <div className="res-info">
                                                <h4>{res.title}</h4>
                                                <div className="res-meta">
                                                    <span className="res-tag">{res.academicYear}</span>
                                                    <span className="res-tag">{res.branch}</span>
                                                    <span className="res-val">{activeTab === 'notes' ? res.chapter : res.year}</span>
                                                </div>
                                            </div>
                                            <div className="res-actions">
                                                <select 
                                                    className="btn-outline btn-sm"
                                                    value={res.parentId || 'root'}
                                                    onChange={(e) => handleMove(res, e.target.value)}
                                                    title="Move to Folder"
                                                    style={{maxWidth: '100px', fontSize: '0.7rem'}}
                                                >
                                                    <option value="root">Root</option>
                                                    {foldersList.filter(f => f.id !== res.id).map(folder => (
                                                        <option key={folder.id} value={folder.id}>📁 {folder.title}</option>
                                                    ))}
                                                </select>
                                                {!res.isFolder && (
                                                    <a href={res.url} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm">
                                                        Test Link
                                                    </a>
                                                )}
                                                    <button onClick={() => handleEdit(res)} className="btn-icon btn-edit" title="Edit">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(res.id)} className="btn-icon btn-delete" title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}
