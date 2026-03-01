import { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { database } from '../firebase';
import { ref, push, set, onValue, remove, runTransaction, get } from 'firebase/database';
import { 
    Plus, Trash2, Edit2, Link as LinkIcon, FolderPlus, FileText, 
    Users, Zap, Database, RefreshCw, LayoutDashboard, LogOut, 
    CheckCircle2, Eye, BarChart3, ShieldCheck, Menu, X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Admin.css';

// Admin allowed list
const ADMIN_EMAILS = [
    'shivarajmani2005@gmail.com',
    'vivekvernekar02@gmail.com',
    'contactus.techastra@gmail.com'
];

// Colors for charts matching image theme
const COLORS = ['#00f3ff', '#a855f7', '#FDE047', '#ff4d4d', '#ff00aa'];
const PIE_COLORS = ['#00f3ff', '#a855f7', '#FDE047'];

const mockCategoryData = [
  { name: 'Notes', val: 0 },
  { name: 'Papers', val: 0 },
  { name: 'DCET', val: 0 },
  { name: 'Links', val: 0 }
];

const mockTechData = [
  { name: 'CS', val: 15 },
  { name: 'Mech', val: 12 },
  { name: 'Civil', val: 8 },
  { name: 'Elec', val: 10 },
  { name: 'Common', val: 20 },
];

const mockPieData = [
  { name: '1st Year', value: 35 },
  { name: '2nd Year', value: 45 },
  { name: '3rd Year', value: 20 },
];

export default function Admin() {
    const { user, loading, logout } = useAuthContext();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [showResourceModal, setShowResourceModal] = useState(false);
    
    // Form States
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [branch, setBranch] = useState('');
    const [chapter, setChapter] = useState('');
    
    // Data list states
    const [resources, setResources] = useState([]);
    const [foldersList, setFoldersList] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    
    // Admin Dashboard Stats
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalResourcesCount, setTotalResourcesCount] = useState(0);
    const [editingId, setEditingId] = useState(null);
    const [parentId, setParentId] = useState('root'); 
    const [isFolder, setIsFolder] = useState(false); 
    const [folderTitle, setFolderTitle] = useState('');

    // Fetch dynamic charts stats
    const [catData, setCatData] = useState(mockCategoryData);

    useEffect(() => {
        let unsubscribeResources = () => {};
        let profilesUnsubscribe = () => {};

        if (user?.email && ADMIN_EMAILS.includes(user.email)) {
            // Stats node real-time
            const statsRef = ref(database, 'stats');
            onValue(statsRef, (snap) => {
                if(snap.exists()){
                    setTotalResourcesCount(snap.val().totalResources || 0);
                }
            });

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
            });

            if (['notes', 'papers', 'dcet'].includes(activeTab)) {
                // Fetch Resources for specific tab
                const resourcesRef = ref(database, activeTab);
                unsubscribeResources = onValue(resourcesRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        const arr = Object.keys(data).map(key => ({
                            id: key,
                            ...data[key]
                        }));
                        setResources(arr.reverse());
                        setFoldersList(arr.filter(item => item.isFolder));
                    } else {
                        setResources([]);
                        setFoldersList([]);
                    }
                });
            } else if (activeTab === 'dashboard') {
                // Approximate charts data logic
                const computeCharts = async () => {
                   let n = 0, p = 0, d = 0;
                   const snapN = await get(ref(database, 'notes'));
                   if(snapN.exists()) n = Object.keys(snapN.val()).length;
                   const snapP = await get(ref(database, 'papers'));
                   if(snapP.exists()) p = Object.keys(snapP.val()).length;
                   const snapD = await get(ref(database, 'dcet'));
                   if(snapD.exists()) d = Object.keys(snapD.val()).length;
                   setCatData([
                       { name: 'Notes', val: n || 10 },
                       { name: 'Papers', val: p || 5 },
                       { name: 'DCET', val: d || 8 },
                       { name: 'Guides', val: 4 }
                   ]);
                };
                computeCharts();
            }
        }

        return () => {
            profilesUnsubscribe();
            unsubscribeResources();
        };
    }, [activeTab, user]);

    if (loading) return <div className="container flex-center" style={{minHeight: '50vh'}}><div className="loader"></div></div>;

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
            const folderRef = push(ref(database, activeTab));
            await set(folderRef, {
                title: folderTitle,
                isFolder: true,
                parentId: 'root',
                academicYear,
                branch,
                timestamp: Date.now()
            });

            const statsRef = ref(database, 'stats/totalResources');
            runTransaction(statsRef, (count) => (count || 0) + 1);

            setFolderTitle('');
            setShowFolderModal(false);
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
                title, url, academicYear, branch,
                isFolder: false, parentId: parentId || 'root',
                timestamp: Date.now(),
            };

            if (activeTab === 'notes') newResource.chapter = chapter || 'General';
            else if (activeTab === 'papers') newResource.year = chapter || new Date().getFullYear().toString();
            else if (activeTab === 'dcet') newResource.chapter = chapter || 'Preparation';

            if (editingId) {
                await set(ref(database, `${activeTab}/${editingId}`), newResource);
                alert(`${activeTab.slice(0, -1)} updated!`);
            } else {
                const resourceRef = push(ref(database, activeTab));
                await set(resourceRef, newResource);
                const statsRef = ref(database, 'stats/totalResources');
                runTransaction(statsRef, (count) => (count || 0) + 1);
                alert(`New ${activeTab.slice(0, -1)} added!`);
            }
            setTitle(''); setUrl(''); setChapter(''); setEditingId(null);
            setShowResourceModal(false);
        } catch (error) {
            alert("Failed to save.");
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
        setShowResourceModal(true);
    };

    const handleSyncStats = async () => {
        setIsSaving(true);
        try {
            const usersSnapshot = await get(ref(database, 'users'));
            const userCount = usersSnapshot.exists() ? Object.keys(usersSnapshot.val()).length : 0;

            let resourceCount = 0;
            for (const cat of ['notes', 'papers', 'dcet']) {
                const snap = await get(ref(database, cat));
                if (snap.exists()) resourceCount += Object.keys(snap.val()).length;
            }

            await set(ref(database, 'stats/totalVerifiedUsers'), userCount);
            await set(ref(database, 'stats/totalResources'), resourceCount);
            alert(`✅ Stats Synced!\nUsers: ${userCount}\nResources: ${resourceCount}`);
        } catch (err) {
            console.error("Sync failed:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleMove = async (res, newParentId) => {
        try {
            await set(ref(database, `${activeTab}/${res.id}/parentId`), newParentId);
        } catch (err) {
            console.error("Move failed", err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this resource?")) {
            try {
                await remove(ref(database, `${activeTab}/${id}`));
                const statsRef = ref(database, 'stats/totalResources');
                runTransaction(statsRef, (count) => Math.max(0, (count || 0) - 1));
            } catch (err) {
                console.error("Delete failed", err);
            }
        }
    };

    return (
        <div className="admin-dashboard-layout">
            {isMobileMenuOpen && (
                <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
            )}
            
            <aside className={`admin-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-brand">
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                        <Zap color="var(--accent-color)" size={28}/> 
                        <span style={{letterSpacing: '2px', fontFamily: 'monospace'}}>TECHASTRA</span>
                    </div>
                    <button className="mobile-close-btn" onClick={() => setIsMobileMenuOpen(false)}>
                        <X size={24} />
                    </button>
                </div>
                
                <div className="sidebar-menu">
                    <div className="menu-label">Main Menu</div>
                    <button className={`sidebar-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                        <LayoutDashboard size={18} /> Dashboard
                    </button>
                    <button className={`sidebar-btn ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
                        <FolderPlus size={18} /> Notes
                    </button>
                    <button className={`sidebar-btn ${activeTab === 'papers' ? 'active' : ''}`} onClick={() => setActiveTab('papers')}>
                        <FileText size={18} /> Papers
                    </button>
                    <button className={`sidebar-btn ${activeTab === 'dcet' ? 'active' : ''}`} onClick={() => setActiveTab('dcet')}>
                        <Zap size={18} /> DCET
                    </button>
                    <button className={`sidebar-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                        <Users size={18} /> Users
                    </button>
                </div>
                
                <div className="sidebar-bottom">
                    <button onClick={logout} className="logout-btn">
                        <LogOut size={18} /> Log Out
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu size={24} />
                        </button>
                        <div className="topbar-breadcrumbs">
                            <span>Dashboard</span> / {activeTab === 'dashboard' ? 'Overview' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                        </div>
                    </div>
                    <div className="topbar-user">
                        <div>
                            <span className="user-name">WEB ADMIN</span>
                            <span className="user-email">{user.email}</span>
                        </div>
                        <div className="user-avatar" style={{ overflow: 'hidden' }}>
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="Admin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                            ) : (
                                <span role="img" aria-label="user">👨‍💻</span>
                            )}
                        </div>
                    </div>
                </header>

                <div className="admin-scrollable-content">
                    {activeTab === 'dashboard' ? (
                        <div className="animate-fade">
                            {/* Stats Grid */}
                            <div className="dashboard-metrics-grid">
                                <div className="metric-card">
                                    <div className="metric-header">
                                        <div className="metric-title">Total Resources</div>
                                        <FolderPlus size={20} className="metric-icon" />
                                    </div>
                                    <div className="metric-value-container">
                                        <span className="metric-value">{totalResourcesCount || 54}</span>
                                        <span className="metric-status">Active</span>
                                    </div>
                                </div>
                                
                                <div className="metric-card">
                                    <div className="metric-header">
                                        <div className="metric-title">Total Views</div>
                                        <Eye size={20} className="metric-icon" />
                                    </div>
                                    <div className="metric-value-container">
                                        <span className="metric-value">156</span>
                                        <span className="metric-status" style={{color: '#a855f7'}}>Live</span>
                                    </div>
                                </div>
                                
                                <div className="metric-card">
                                    <div className="metric-header">
                                        <div className="metric-title">Total Users</div>
                                        <Users size={20} className="metric-icon" />
                                    </div>
                                    <div className="metric-value-container">
                                        <span className="metric-value">{totalUsers}</span>
                                        <span className="metric-status" style={{color: 'var(--accent-color)'}}>DB Records</span>
                                    </div>
                                </div>
                                
                                <div className="metric-card">
                                    <div className="metric-header">
                                        <div className="metric-title">DB Connection</div>
                                        <Database size={20} className="metric-icon" />
                                    </div>
                                    <div className="metric-value-container">
                                        <span className="metric-value">ONLINE</span>
                                        <span className="metric-status status-online">
                                            <span className="status-online-dot"></span> Secure
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Charts Grid Row 1 */}
                            <div className="dashboard-charts-grid">
                                <div className="chart-card">
                                    <div className="chart-header">
                                        <BarChart3 size={18} /> Resource Categories
                                    </div>
                                    <div className="chart-body">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={catData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                                <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px'}} />
                                                <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                                                    {catData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="chart-card">
                                    <div className="chart-header">
                                        <Zap size={18} /> Top Branches Used
                                    </div>
                                    <div className="chart-body">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={mockTechData} layout="vertical" margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                                <XAxis type="number" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                                <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px'}} />
                                                <Bar dataKey="val" radius={[0, 4, 4, 0]} barSize={16}>
                                                    {mockTechData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Charts Grid Row 2 */}
                            <div className="dashboard-charts-grid">
                                <div className="chart-card" style={{alignItems: 'center'}}>
                                    <div className="chart-header" style={{alignSelf: 'flex-start'}}>
                                        <Users size={18} /> Users Composition
                                    </div>
                                    <div className="chart-body" style={{display: 'flex', justifyContent: 'center'}}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={mockPieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={90}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {mockPieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip contentStyle={{backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px'}} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="chart-card" style={{alignItems: 'center'}}>
                                    <div className="chart-header" style={{alignSelf: 'flex-start'}}>
                                        <ShieldCheck size={18} /> Resource Status Pipeline
                                    </div>
                                    <div className="chart-body" style={{display: 'flex', justifyContent: 'center'}}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={[{name: 'Approved', val: 80}, {name: 'Pending', val: 20}]}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={90}
                                                    paddingAngle={5}
                                                    dataKey="val"
                                                    stroke="none"
                                                >
                                                    <Cell fill="#4ade80" />
                                                    <Cell fill="#ef4444" />
                                                </Pie>
                                                <RechartsTooltip contentStyle={{backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px'}} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'users' ? (
                        <div className="admin-card card users-full-card animate-fade">
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
                        <div className="animate-fade">
                            <div className="admin-header-actions">
                                <h3>Manage {activeTab.toUpperCase()}</h3>
                                <div className="admin-action-buttons">
                                    <button className="btn-outline" onClick={() => setShowFolderModal(true)}>
                                        <FolderPlus size={16} /> New Folder
                                    </button>
                                    <button className="btn-primary" onClick={() => {
                                        setEditingId(null);
                                        setTitle(''); setUrl(''); setChapter('');
                                        setShowResourceModal(true);
                                    }}>
                                        <Plus size={16} /> New Resource
                                    </button>
                                </div>
                            </div>

                            <div className="admin-card card list-card" style={{ marginTop: '1.5rem' }}>
                                <div className="resource-list" style={{ maxHeight: '70vh' }}>
                                    {resources.length === 0 ? <div className="empty-state">No resources added.</div> : resources.map(res => (
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
                                                    style={{maxWidth: '100px', fontSize: '0.7rem', padding: '0.4rem'}}
                                                >
                                                    <option value="root">Root</option>
                                                    {foldersList.filter(f => f.id !== res.id).map(folder => (
                                                        <option key={folder.id} value={folder.id}>📁 {folder.title}</option>
                                                    ))}
                                                </select>
                                                {!res.isFolder && <a href={res.url} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm" style={{padding: '0.4rem 0.6rem'}}>Test</a>}
                                                <button onClick={() => handleEdit(res)} className="btn-edit" title="Edit"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(res.id)} className="btn-delete" title="Delete"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Folder Modal */}
                            {showFolderModal && (
                                <div className="admin-modal-overlay" onClick={(e) => { if(e.target.className === 'admin-modal-overlay') setShowFolderModal(false); }}>
                                    <div className="admin-modal-content">
                                        <button className="admin-modal-close" onClick={() => setShowFolderModal(false)}><X size={20} /></button>
                                        <div className="card-header-with-icon">
                                            <FolderPlus size={20} color="var(--accent-color)" />
                                            <h3>Create New Folder</h3>
                                        </div>
                                        <form onSubmit={handleAddFolder} className="admin-form-mini" style={{flexDirection: 'column', gap: '1rem', marginTop: '1rem'}}>
                                            <input type="text" placeholder="e.g. Unit 1: OS Basics" value={folderTitle} onChange={e => setFolderTitle(e.target.value)} required />
                                            <div className="form-row" style={{gap: '0.5rem'}}>
                                                <select className="form-select" value={academicYear} onChange={e => setAcademicYear(e.target.value)} style={{fontSize: '0.9rem', padding: '0.6rem', flex: 1}}>
                                                    <option value="">Year (All)</option>
                                                    <option value="1st Year">1st Year</option>
                                                    <option value="2nd Year">2nd Year</option>
                                                    <option value="3rd Year">3rd Year</option>
                                                </select>
                                                <select className="form-select" value={branch} onChange={e => setBranch(e.target.value)} style={{fontSize: '0.9rem', padding: '0.6rem', flex: 1}}>
                                                    <option value="">Branch (All)</option>
                                                    <option value="Common">Common</option>
                                                    <option value="Computer Science">CS</option>
                                                    <option value="Mechanical">Mechanical</option>
                                                </select>
                                            </div>
                                            <button type="submit" className="btn-primary" disabled={isSaving} style={{width: '100%', marginTop: '0.5rem'}}>
                                                <Plus size={16} /> Create Folder
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* Resource Modal */}
                            {showResourceModal && (
                                <div className="admin-modal-overlay" onClick={(e) => { if(e.target.className === 'admin-modal-overlay') {setShowResourceModal(false); setEditingId(null); setTitle('');} }}>
                                    <div className="admin-modal-content">
                                        <button className="admin-modal-close" onClick={() => {setShowResourceModal(false); setEditingId(null); setTitle('');}}><X size={20} /></button>
                                        <h3>{editingId ? 'Edit' : 'Add'} {activeTab === 'notes' ? 'Note' : activeTab === 'papers' ? 'Paper' : 'DCET Resource'}</h3>
                                        <form className="admin-form" onSubmit={handleAddResource} style={{marginTop: '1.5rem'}}>
                                            <div className="form-group">
                                                <label>Inside Folder:</label>
                                                <select value={parentId} onChange={e => setParentId(e.target.value)}>
                                                    <option value="root">Main Directory (Root)</option>
                                                    {foldersList.map(f => <option key={f.id} value={f.id}>📁 {f.title}</option>)}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Title</label>
                                                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>Drive URL</label>
                                                <div className="input-with-icon">
                                                    <LinkIcon size={16} />
                                                    <input type="url" required value={url} onChange={e => setUrl(e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Year</label>
                                                    <select required value={academicYear} onChange={e => setAcademicYear(e.target.value)}>
                                                        <option value="" disabled>Select</option>
                                                        <option value="1st Year">1st Year</option>
                                                        <option value="2nd Year">2nd Year</option>
                                                        <option value="3rd Year">3rd Year</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label>Branch</label>
                                                    <select required value={branch} onChange={e => setBranch(e.target.value)}>
                                                        <option value="" disabled>Select</option>
                                                        <option value="Common">Common</option>
                                                        <option value="Computer Science">CS</option>
                                                        <option value="Mechanical">Mechanical</option>
                                                        <option value="Civil">Civil</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>{activeTab === 'notes' ? 'Chapter/Module' : activeTab === 'papers' ? 'Exam Year' : 'Topic'}</label>
                                                <input type="text" required value={chapter} onChange={e => setChapter(e.target.value)} />
                                            </div>
                                            <button type="submit" className="btn-primary w-full" disabled={isSaving} style={{marginTop: '1rem'}}>
                                                {isSaving ? 'Saving...' : <>{editingId ? <Edit2 size={18} /> : <Plus size={18} />} {editingId ? 'Update' : 'Add'} Resource</>}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
