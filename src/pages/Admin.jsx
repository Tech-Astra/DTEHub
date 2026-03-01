import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { database } from '../firebase';
import { ref, push, set, onValue, remove, runTransaction, get, query, orderByChild, limitToLast } from 'firebase/database';
import { 
    Plus, Trash2, Edit2, Link as LinkIcon, FolderPlus, FileText, 
    Users, Zap, Database, RefreshCw, LayoutDashboard, LogOut, 
    CheckCircle2, Eye, BarChart3, ShieldCheck, Menu, X, Home, History,
    Search, Filter, ChevronDown, Folder
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import IframeModal from '../components/IframeModal';
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
    const navigate = useNavigate();
    const { user, loading, logout } = useAuthContext();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [showResourceModal, setShowResourceModal] = useState(false);
    const [showBranchModal, setShowBranchModal] = useState(false);
    const [branchesList, setBranchesList] = useState([]);
    const [newBranchTitle, setNewBranchTitle] = useState('');
    const [showSyllabusModal, setShowSyllabusModal] = useState(false);
    const [syllabusesList, setSyllabusesList] = useState([]);
    const [newSyllabusTitle, setNewSyllabusTitle] = useState('');
    
    // Form States
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [branch, setBranch] = useState('');
    const [chapter, setChapter] = useState('');
    const [resourceType, setResourceType] = useState('Note'); // For Notes/Papers toggle
    const [syllabus, setSyllabus] = useState('C-20');
    const [semester, setSemester] = useState('1st Sem');
    
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

    // Activity logs
    const [activityLogs, setActivityLogs] = useState([]);
    const [selectedLog, setSelectedLog] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [userSortOrder, setUserSortOrder] = useState('name'); // 'name', 'college'
    const [resourceSearchTerm, setResourceSearchTerm] = useState('');
    const [resourceSortOrder, setResourceSortOrder] = useState('title'); // 'title', 'year'
    const [peakedFolder, setPeakedFolder] = useState(null); // For "view inside" pop up
    const [viewUrl, setViewUrl] = useState(null); // For viewer modal

    // Fetch dynamic charts stats
    const [catData, setCatData] = useState(mockCategoryData);

    // Helper: log admin actions to Firebase
    const logAdminAction = async (action, section, details = '') => {
        try {
            const logRef = push(ref(database, 'system_logs'));
            await set(logRef, {
                action,
                section,
                details,
                adminName: user?.displayName || 'Unknown',
                adminEmail: user?.email || '',
                adminPhoto: user?.photoURL || '',
                timestamp: Date.now()
            });
        } catch (err) {
            console.error('Failed to log action:', err);
        }
    };

    useEffect(() => {
        let unsubscribeResources = () => {};
        let profilesUnsubscribe = () => {};
        let branchesUnsubscribe = () => {};
        let syllabusesUnsubscribe = () => {};
        let logsUnsubscribe = () => {};

        // Fetch Branches globally
        const branchesRef = ref(database, 'branches');
        branchesUnsubscribe = onValue(branchesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const arr = Object.keys(data).map(key => ({ 
                    id: key, 
                    title: typeof data[key] === 'string' ? data[key] : data[key].title 
                }));
                setBranchesList(arr);
            } else {
                setBranchesList([]);
            }
        });

        // Fetch Syllabuses globally
        const syllabusRef = ref(database, 'syllabuses');
        syllabusesUnsubscribe = onValue(syllabusRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const arr = Object.keys(data).map(key => ({ 
                    id: key, 
                    title: typeof data[key] === 'string' ? data[key] : data[key].title 
                }));
                setSyllabusesList(arr);
            } else {
                setSyllabusesList([
                    {id: 'c19', title: 'C-19'},
                    {id: 'c20', title: 'C-20'},
                    {id: 'c25', title: 'C-25'}
                ]);
            }
        });

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
                    const arr = Object.keys(data).map(uid => {
                        const userData = data[uid];
                        return {
                            uid,
                            email: userData.email || '',
                            photoURL: userData.photoURL || '',
                            name: userData.profile?.name || userData.displayName || '',
                            ...(userData.profile || {})
                        };
                    });
                    setUsersList(arr);
                    setTotalUsers(arr.length);
                } else {
                    setUsersList([]);
                    setTotalUsers(0);
                }
            });

            if (['notes', 'dcet'].includes(activeTab)) {
                // Fetch Resources for specific tab
                const resourcesRef = ref(database, `resources/${activeTab}`);
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
            } else if (activeTab === 'dashboard' || activeTab === 'logs') {
                // Approximate charts data logic
                if (activeTab === 'dashboard') {
                    const computeCharts = async () => {
                       let n = 0, d = 0;
                       const snapN = await get(ref(database, 'resources/notes'));
                       if(snapN.exists()) n = Object.keys(snapN.val()).length;
                       const snapD = await get(ref(database, 'resources/dcet'));
                       if(snapD.exists()) d = Object.keys(snapD.val()).length;
                       setCatData([
                           { name: 'Resources', val: n || 15 },
                           { name: 'DCET', val: d || 8 },
                           { name: 'Guides', val: 4 }
                       ]);
                    };
                    computeCharts();
                }


                // Fetch activity logs (shared between Dashboard and Logs Tab)
                // For Dashboard tab we fetch 30, for Logs tab we fetch ALL (no limit)
                const finalLogsQuery = activeTab === 'logs' 
                    ? query(ref(database, 'system_logs'), orderByChild('timestamp')) 
                    : query(ref(database, 'system_logs'), orderByChild('timestamp'), limitToLast(30));

                logsUnsubscribe = onValue(finalLogsQuery, (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        const arr = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                        setActivityLogs(arr.sort((a, b) => b.timestamp - a.timestamp));
                    } else {
                        setActivityLogs([]);
                    }
                });
            }
            
            // Log this session login once per mount
            const lastLog = sessionStorage.getItem('admin_session_logged');
            if (!lastLog) {
                logAdminAction('Session Login', 'auth', `Admin ${user.displayName || user.email} logged in`);
                sessionStorage.setItem('admin_session_logged', 'true');
            }
        }

        return () => {
            profilesUnsubscribe();
            unsubscribeResources();
            branchesUnsubscribe();
            syllabusesUnsubscribe();
            logsUnsubscribe();
        };
    }, [activeTab, user]);

    // Computed: Filtered and Sorted Users
    const filteredUsers = usersList
        .filter(u => {
            const query = userSearchTerm.toLowerCase();
            return (
                (u.name?.toLowerCase().includes(query)) ||
                (u.email?.toLowerCase().includes(query)) ||
                (u.usn?.toLowerCase().includes(query)) ||
                (u.college?.toLowerCase().includes(query))
            );
        })
        .sort((a, b) => {
            if (userSortOrder === 'college') {
                return (a.college || '').localeCompare(b.college || '');
            }
            return (a.name || '').localeCompare(b.name || '');
        });

    // Computed: Filtered and Sorted Resources
    const filteredResources = resources
        .filter(r => {
            const query = resourceSearchTerm.toLowerCase();
            return (
                (r.title?.toLowerCase().includes(query)) ||
                (r.branch?.toLowerCase().includes(query)) ||
                (r.syllabus?.toLowerCase().includes(query)) ||
                (r.semester?.toLowerCase().includes(query)) ||
                (r.chapter?.toLowerCase().includes(query))
            );
        })
        .sort((a, b) => {
            if (resourceSortOrder === 'year') {
                return (a.semester || '').localeCompare(b.semester || '');
            }
            return (a.title || '').localeCompare(b.title || '');
        });

    const displayFolders = filteredResources.filter(r => r.isFolder);
    const displayFiles = filteredResources.filter(r => !r.isFolder);

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
            const folderRef = push(ref(database, `resources/${activeTab}`));
            await set(folderRef, {
                title: folderTitle,
                isFolder: true,
                parentId: 'root',
                syllabus,
                semester,
                branch,
                timestamp: Date.now()
            });

            const statsRef = ref(database, 'stats/totalResources');
            runTransaction(statsRef, (count) => (count || 0) + 1);

            setFolderTitle('');
            setShowFolderModal(false);
            logAdminAction('Created Folder', activeTab, folderTitle);
            alert("New folder created!");
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddBranch = async (e) => {
        e.preventDefault();
        if (!newBranchTitle.trim()) return;
        setIsSaving(true);
        try {
            const branchRef = push(ref(database, 'branches'));
            await set(branchRef, { title: newBranchTitle.trim() });
            logAdminAction('Added Branch', 'branches', newBranchTitle.trim());
            setNewBranchTitle('');
            setShowBranchModal(false);
            alert("New branch added!");
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteBranch = async (id, title) => {
        if (window.confirm(`Delete branch "${title}"?`)) {
            try {
                await remove(ref(database, `branches/${id}`));
                logAdminAction('Deleted Branch', 'branches', title);
                alert("Branch removed.");
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleAddSyllabus = async (e) => {
        e.preventDefault();
        if (!newSyllabusTitle.trim()) return;
        setIsSaving(true);
        try {
            const sRef = push(ref(database, 'syllabuses'));
            await set(sRef, { title: newSyllabusTitle.trim() });
            logAdminAction('Added Syllabus', 'syllabuses', newSyllabusTitle.trim());
            setNewSyllabusTitle('');
            setShowSyllabusModal(false);
            alert("New Syllabus Scheme added!");
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteSyllabus = async (id, title) => {
        if (window.confirm(`Delete Syllabus scheme "${title}"?`)) {
            try {
                await remove(ref(database, `syllabuses/${id}`));
                logAdminAction('Deleted Syllabus', 'syllabuses', title);
                alert("Syllabus removed.");
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleAddResource = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const newResource = {
                title, url, syllabus, semester, branch,
                isFolder: false, parentId: parentId || 'root',
                timestamp: Date.now(),
            };

            if (activeTab === 'notes') {
                newResource.chapter = chapter || 'General';
                newResource.type = resourceType; // 'Note' or 'Paper'
            } else if (activeTab === 'dcet') {
                newResource.chapter = chapter || 'Preparation';
            }

            if (editingId) {
                await set(ref(database, `resources/${activeTab}/${editingId}`), newResource);
                logAdminAction('Updated Resource', `resources/${activeTab}`, title);
                alert(`${activeTab.slice(0, -1)} updated!`);
            } else {
                const resourceRef = push(ref(database, `resources/${activeTab}`));
                await set(resourceRef, newResource);
                const statsRef = ref(database, 'stats/totalResources');
                runTransaction(statsRef, (count) => (count || 0) + 1);
                logAdminAction('Added Resource', activeTab, title);
                alert(`New ${activeTab.slice(0, -1)} added!`);
            }
            setTitle(''); setUrl(''); setChapter(''); setEditingId(null); setResourceType('Note');
            setSyllabus('C-20'); setSemester('1st Sem');
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
        setSyllabus(res.syllabus || 'C-20');
        setSemester(res.semester || '1st Sem');
        setBranch(res.branch);
        setChapter(res.chapter || '');
        setResourceType(res.type || 'Note');
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
            for (const cat of ['notes', 'dcet']) {
                const snap = await get(ref(database, `resources/${cat}`));
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
            await set(ref(database, `resources/${activeTab}/${res.id}/parentId`), newParentId);
            logAdminAction('Moved Resource', `resources/${activeTab}`, `${res.title} moved to ${newParentId}`);
        } catch (err) {
            console.error("Move failed", err);
        }
    };

    const handleDelete = async (id) => {
        const res = resources.find(r => r.id === id);
        if (window.confirm("Delete this resource?")) {
            try {
                await remove(ref(database, `resources/${activeTab}/${id}`));
                const statsRef = ref(database, 'stats/totalResources');
                runTransaction(statsRef, (count) => Math.max(0, (count || 0) - 1));
                logAdminAction('Deleted Resource', activeTab, res?.title || id);
            } catch (err) {
                console.error("Delete failed", err);
            }
        }
    };

    return (
        <>
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
                        <Database size={18} /> Resources
                    </button>
                    <button className={`sidebar-btn ${activeTab === 'dcet' ? 'active' : ''}`} onClick={() => setActiveTab('dcet')}>
                        <Zap size={18} /> DCET
                    </button>
                    <button className={`sidebar-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                        <Users size={18} /> Users
                    </button>
                    <button className={`sidebar-btn ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
                        <History size={18} /> System Logs
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
                            <span>Admin</span> / {
                                activeTab === 'dashboard' ? 'Overview' : 
                                activeTab === 'notes' ? 'Resources' :
                                activeTab === 'dcet' ? 'DCET Resources' :
                                activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
                            }
                        </div>
                    </div>
                    <div className="topbar-user">
                        <button
                            onClick={() => navigate('/')}
                            className="topbar-home-btn"
                            title="Go to Home"
                        >
                            <Home size={18} />
                        </button>
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
                                    <div className="chart-body" style={{ height: '250px' }}>
                                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
                                    <div className="chart-body" style={{ height: '250px' }}>
                                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
                                    <div className="chart-body" style={{display: 'flex', justifyContent: 'center', height: '250px'}}>
                                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
                                    <div className="chart-body" style={{display: 'flex', justifyContent: 'center', height: '250px'}}>
                                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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

                            {/* Recent Activity Mini Log */}
                            <div className="admin-card card recent-activity-dashboard">
                                <div className="activity-header">
                                    <div className="activity-header-left">
                                        <History size={20} className="accent-text" />
                                        <h3>System Audit Log</h3>
                                    </div>
                                    <button className="text-btn" onClick={() => setActiveTab('logs')}>View All Logs</button>
                                </div>
                                <div className="activity-mini-list">
                                    {activityLogs.slice(0, 5).map(log => (
                                        <div key={log.id} className="activity-row">
                                            <div className={`activity-dot ${log.action.toLowerCase().includes('delete') ? 'delete' : log.action.toLowerCase().includes('create') ? 'create' : 'update'}`}></div>
                                            <div className="activity-main">
                                                <span className="activity-action">{log.action}</span>
                                                <span className="activity-details">{log.details}</span>
                                            </div>
                                            <div className="activity-time">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                        </div>
                                    ))}
                                    {activityLogs.length === 0 && <p className="empty-text">No recent activity detected.</p>}
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'users' ? (
                        <div className="admin-card card users-full-card animate-fade">
                            <div className="users-card-header">
                                <div className="header-left">
                                    <h3>Registered Students List</h3>
                                    <p>{filteredUsers.length} students found</p>
                                </div>
                                <div className="users-controls">
                                    <div className="search-box-premium">
                                        <Search size={18} />
                                        <input 
                                            type="text" 
                                            placeholder="Search by name, email, college or USN..." 
                                            value={userSearchTerm}
                                            onChange={(e) => setUserSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="sort-box-premium">
                                        <Filter size={18} />
                                        <select 
                                            value={userSortOrder} 
                                            onChange={(e) => setUserSortOrder(e.target.value)}
                                        >
                                            <option value="name">Sort by Name</option>
                                            <option value="college">Sort by College</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

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
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((userProfile) => (
                                            <tr key={userProfile.uid} className="clickable-row" onClick={() => setSelectedUser(userProfile)}>
                                                <td>{userProfile.name || 'Anonymous Student'}</td>
                                                <td>{userProfile.email}</td>
                                                <td>{userProfile.college || 'Not set'} ({userProfile.usn || '-'})</td>
                                                <td>{userProfile.branch || '-'} • {userProfile.year || '-'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="empty-search-cell">
                                                <Search size={48} />
                                                <p>No students found matching your search.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            </div>
                        </div>
                    ) : activeTab === 'logs' ? (
                        <div className="admin-logs-container animate-fade">
                            <div className="admin-card card logs-card">
                                <div className="logs-header">
                                    <div className="logs-header-left">
                                        <History size={24} className="accent-text" />
                                        <div>
                                            <h3>Real-time System Logs</h3>
                                            <p>Automated tracking of system & admin operations</p>
                                        </div>
                                    </div>
                                    <div className="logs-count">Showing last 50 actions</div>
                                </div>
                                
                                <div className="logs-timeline">
                                    {activityLogs.length > 0 ? (
                                        activityLogs.map((log) => (
                                            <div key={log.id} className="log-item clickable" onClick={() => setSelectedLog(log)}>
                                                <div className="log-admin-avatar">
                                                    {log.adminPhoto ? (
                                                        <img src={log.adminPhoto} alt={log.adminName} />
                                                    ) : (
                                                        <div className="avatar-placeholder">{log.adminName?.charAt(0) || 'A'}</div>
                                                    )}
                                                </div>
                                                <div className="log-details">
                                                    <div className="log-top">
                                                        <span className="log-admin-name">{log.adminName}</span>
                                                        <span className="log-time">{new Date(log.timestamp).toLocaleString()}</span>
                                                    </div>
                                                    <div className="log-action-row">
                                                        <span className={`log-badge ${log.action.toLowerCase().includes('delete') ? 'delete' : log.action.toLowerCase().includes('create') ? 'create' : 'update'}`}>
                                                            {log.action}
                                                        </span>
                                                        <span className="log-section">in <span className="highlight">{log.section}</span></span>
                                                    </div>
                                                    <div className="log-resource">
                                                        Resource: <strong>{log.details}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-logs">
                                            <History size={48} />
                                            <p>No activity logs found yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade">
                            <div className="resource-management-header">
                                <div className="header-left">
                                    <h3>Manage {activeTab === 'notes' ? 'Resources' : 'DCET Materials'}</h3>
                                    <p>Organize academic content across branch, syllabus, and semester</p>
                                </div>
                                <div className="resource-controls">
                                    <div className="search-box-premium">
                                        <Search size={18} />
                                        <input 
                                            type="text" 
                                            placeholder="Search by title, branch, year..." 
                                            value={resourceSearchTerm}
                                            onChange={(e) => setResourceSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="sort-box-premium">
                                        <Filter size={18} />
                                        <select 
                                            value={resourceSortOrder} 
                                            onChange={(e) => setResourceSortOrder(e.target.value)}
                                        >
                                            <option value="title">Sort by Title</option>
                                            <option value="year">Sort by Year</option>
                                        </select>
                                    </div>
                                    <div className="admin-action-buttons">
                                        <button className="btn-outline" onClick={() => setShowSyllabusModal(true)}>
                                            <Plus size={16} /> Syllabus
                                        </button>
                                        <button className="btn-outline" onClick={() => setShowBranchModal(true)}>
                                            <Plus size={16} /> Branch
                                        </button>
                                        <button className="btn-outline" onClick={() => setShowFolderModal(true)}>
                                            <FolderPlus size={16} /> Folder
                                        </button>
                                        <button className="btn-primary" onClick={() => {
                                            setEditingId(null);
                                            setTitle(''); setUrl(''); setChapter('');
                                            setShowResourceModal(true);
                                        }}>
                                            <Plus size={16} /> Resource
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Folder Grid Section */}
                            <div className="resources-section-title">
                                <FolderPlus size={18} /> Directories & Units
                            </div>
                            <div className="folder-grid">
                                {displayFolders.length > 0 ? displayFolders.map(folder => (
                                    <div key={folder.id} className="folder-card-premium" onClick={() => setPeakedFolder(folder)}>
                                        <div className="folder-icon-wrapper">
                                            <Folder size={24} />
                                        </div>
                                        <div className="folder-info">
                                            <h4>{folder.title}</h4>
                                            <p>{folder.branch} • {folder.syllabus || folder.academicYear || 'No Year'} {folder.semester ? `• ${folder.semester}` : ''}</p>
                                        </div>
                                        <div className="folder-actions-overlay">
                                            <button className="mini-action-btn" onClick={(e) => { e.stopPropagation(); handleEdit(folder); }} title="Edit">
                                                <Edit2 size={14} />
                                            </button>
                                            <button className="mini-action-btn delete" onClick={(e) => { e.stopPropagation(); handleDelete(folder.id); }} title="Delete">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="empty-grid-state">
                                        <p>No folders found matching your criteria</p>
                                    </div>
                                )}
                            </div>

                            {/* Individual Files / Resources Section */}
                            <div className="resources-section-title">
                                <FileText size={18} /> Individual Files & Links
                            </div>
                            <div className="admin-card card list-card">
                                <div className="resource-list" style={{ maxHeight: '60vh' }}>
                                    {displayFiles.length === 0 ? (
                                        <div className="empty-state">No individual resources found.</div>
                                    ) : displayFiles.map(res => (
                                        <div key={res.id} className="resource-item">
                                            <div className="res-info">
                                                <h4>{res.title}</h4>
                                                <div className="res-meta">
                                                    {res.syllabus ? <span className="res-tag">{res.syllabus}</span> : <span className="res-tag">{res.academicYear}</span>}
                                                    {res.semester && <span className="res-tag">{res.semester}</span>}
                                                    <span className="res-tag">{res.branch}</span>
                                                    <span className="res-val">{res.chapter}</span>
                                                    {activeTab === 'notes' && (
                                                        <span className="res-tag" style={{
                                                            backgroundColor: res.type === 'Paper' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)', 
                                                            color: res.type === 'Paper' ? '#ef4444' : '#eab308'
                                                        }}>
                                                            {res.type || 'Note'}
                                                        </span>
                                                    )}
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
                                                <button onClick={() => setViewUrl(res.url)} className="btn-outline btn-sm" style={{padding: '0.4rem 0.6rem'}}>View</button>
                                                <button onClick={() => handleEdit(res)} className="btn-edit" title="Edit"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(res.id)} className="btn-delete" title="Delete"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>

        {/* ===== MODALS (rendered at top level, outside overflow:hidden containers) ===== */}

        {/* Folder Modal */}
        {showFolderModal && (
            <div className="admin-modal-overlay" onClick={(e) => { if(e.target.className === 'admin-modal-overlay') setShowFolderModal(false); }}>
                <div className="admin-modal-content">
                    <div className="admin-modal-header">
                        <div className="admin-modal-header-left">
                            <div className="admin-modal-header-icon folder">
                                <FolderPlus size={18} />
                            </div>
                            <div>
                                <h3>Create New Folder</h3>
                                <p>Organize resources into a folder</p>
                            </div>
                        </div>
                        <button className="admin-modal-close" onClick={() => setShowFolderModal(false)}><X size={16} /></button>
                    </div>
                    <form onSubmit={handleAddFolder}>
                        <div className="admin-modal-body">
                            <div className="modal-form">
                                <div className="modal-field">
                                    <label>Folder Name</label>
                                    <input type="text" placeholder="e.g. Unit 1: OS Basics" value={folderTitle} onChange={e => setFolderTitle(e.target.value)} required />
                                </div>
                                <div className="modal-form-row">
                                    <div className="modal-field">
                                        <label>Syllabus</label>
                                        <select value={syllabus} onChange={e => setSyllabus(e.target.value)}>
                                            {syllabusesList.map(s => (
                                                <option key={s.id} value={s.title}>{s.title} Scheme</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="modal-field">
                                        <label>Semester</label>
                                        <select value={semester} onChange={e => setSemester(e.target.value)}>
                                            <option value="1st Sem">1st Sem</option>
                                            <option value="2nd Sem">2nd Sem</option>
                                            <option value="3rd Sem">3rd Sem</option>
                                            <option value="4th Sem">4th Sem</option>
                                            <option value="5th Sem">5th Sem</option>
                                            <option value="6th Sem">6th Sem</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-form-row">
                                    <div className="modal-field">
                                        <label>Branch</label>
                                        <select value={branch} onChange={e => setBranch(e.target.value)}>
                                            <option value="">All Branches</option>
                                            {branchesList.map((b) => (
                                                <option key={b.id} value={b.title}>{b.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button type="submit" className="modal-submit-btn primary" disabled={isSaving}>
                                <FolderPlus size={16} /> {isSaving ? 'Creating...' : 'Create Folder'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Resource Modal */}
        {showResourceModal && (
            <div className="admin-modal-overlay" onClick={(e) => { if(e.target.className === 'admin-modal-overlay') {setShowResourceModal(false); setEditingId(null); setTitle('');} }}>
                <div className="admin-modal-content">
                    <div className="admin-modal-header">
                        <div className="admin-modal-header-left">
                            <div className="admin-modal-header-icon resource">
                                {editingId ? <Edit2 size={18} /> : <Plus size={18} />}
                            </div>
                            <div>
                                <h3>{editingId ? 'Edit' : 'Add'} {activeTab === 'notes' ? 'Note / Paper' : 'DCET Resource'}</h3>
                                <p>{editingId ? 'Update existing resource details' : 'Add a new resource to the collection'}</p>
                            </div>
                        </div>
                        <button className="admin-modal-close" onClick={() => {setShowResourceModal(false); setEditingId(null); setTitle('');}}><X size={16} /></button>
                    </div>
                    <form onSubmit={handleAddResource}>
                        <div className="admin-modal-body">
                            <div className="modal-form">
                                <div className="modal-field">
                                    <label>Inside Folder</label>
                                    <select value={parentId} onChange={e => setParentId(e.target.value)}>
                                        <option value="root">Main Directory (Root)</option>
                                        {foldersList.map(f => <option key={f.id} value={f.id}>📁 {f.title}</option>)}
                                    </select>
                                </div>
                                <div className="modal-field">
                                    <label>Title</label>
                                    <input type="text" placeholder="Resource title" required value={title} onChange={e => setTitle(e.target.value)} />
                                </div>
                                <div className="modal-field">
                                    <label>Drive URL</label>
                                    <div className="input-icon-wrap">
                                        <LinkIcon size={15} />
                                        <input type="url" placeholder="https://drive.google.com/..." required value={url} onChange={e => setUrl(e.target.value)} />
                                    </div>
                                </div>
                                <div className="modal-form-row">
                                    <div className="modal-field">
                                        <label>Syllabus</label>
                                        <select required value={syllabus} onChange={e => setSyllabus(e.target.value)}>
                                            {syllabusesList.map(s => (
                                                <option key={s.id} value={s.title}>{s.title} Scheme</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="modal-field">
                                        <label>Semester</label>
                                        <select required value={semester} onChange={e => setSemester(e.target.value)}>
                                            <option value="1st Sem">1st Sem</option>
                                            <option value="2nd Sem">2nd Sem</option>
                                            <option value="3rd Sem">3rd Sem</option>
                                            <option value="4th Sem">4th Sem</option>
                                            <option value="5th Sem">5th Sem</option>
                                            <option value="6th Sem">6th Sem</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-form-row">
                                    <div className="modal-field">
                                        <label>Branch</label>
                                        <select required value={branch} onChange={e => setBranch(e.target.value)}>
                                            {branchesList.map((b) => (
                                                <option key={b.id} value={b.title}>{b.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {activeTab === 'notes' && (
                                    <div className="modal-field">
                                        <label>Resource Type</label>
                                        <select required value={resourceType} onChange={e => setResourceType(e.target.value)}>
                                            <option value="Note">Notes</option>
                                            <option value="Paper">Question Paper</option>
                                        </select>
                                    </div>
                                )}
                                <div className="modal-field">
                                    <label>{activeTab === 'notes' ? 'Chapter / Module Name' : 'Topic'}</label>
                                    <input type="text" placeholder={activeTab === 'notes' ? 'e.g. Unit 3: Deadlocks' : 'e.g. Mathematics'} required value={chapter} onChange={e => setChapter(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button type="submit" className="modal-submit-btn primary" disabled={isSaving}>
                                {isSaving ? 'Saving...' : <>{editingId ? <Edit2 size={16} /> : <Plus size={16} />} {editingId ? 'Update Resource' : 'Add Resource'}</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Branch Modal */}
        {showBranchModal && (
            <div className="admin-modal-overlay" onClick={(e) => { if(e.target.className === 'admin-modal-overlay') setShowBranchModal(false); }}>
                <div className="admin-modal-content" style={{maxWidth: '420px'}}>
                    <div className="admin-modal-header">
                        <div className="admin-modal-header-left">
                            <div className="admin-modal-header-icon branch">
                                <Plus size={18} />
                            </div>
                            <div>
                                <h3>Manage Branches</h3>
                                <p>Add or remove academic branches</p>
                            </div>
                        </div>
                        <button className="admin-modal-close" onClick={() => setShowBranchModal(false)}><X size={16} /></button>
                    </div>
                    <form onSubmit={handleAddBranch}>
                        <div className="admin-modal-body">
                            <div className="modal-form">
                                <div className="modal-field">
                                    <label>New Branch Name</label>
                                    <div style={{display: 'flex', gap: '0.5rem'}}>
                                        <input type="text" placeholder="e.g. Chemical" value={newBranchTitle} onChange={e => setNewBranchTitle(e.target.value)} required />
                                        <button type="submit" className="btn-primary" style={{padding: '0 1rem'}} disabled={isSaving}>Add</button>
                                    </div>
                                </div>
                                <div style={{marginTop: '1.5rem'}}>
                                    <label style={{fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem'}}>Existing Branches</label>
                                    <div className="manage-list" style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                                        {branchesList.map(b => (
                                            <div key={b.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)'}}>
                                                <span style={{fontSize: '0.9rem'}}>{b.title}</span>
                                                <button type="button" onClick={() => handleDeleteBranch(b.id, b.title)} style={{background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex'}}><Trash2 size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Syllabus Modal */}
        {showSyllabusModal && (
            <div className="admin-modal-overlay" onClick={(e) => { if(e.target.className === 'admin-modal-overlay') setShowSyllabusModal(false); }}>
                <div className="admin-modal-content" style={{maxWidth: '420px'}}>
                    <div className="admin-modal-header">
                        <div className="admin-modal-header-left">
                            <div className="admin-modal-header-icon resource">
                                <Database size={18} />
                            </div>
                            <div>
                                <h3>Manage Syllabuses</h3>
                                <p>Add or remove syllabus schemes</p>
                            </div>
                        </div>
                        <button className="admin-modal-close" onClick={() => setShowSyllabusModal(false)}><X size={16} /></button>
                    </div>
                    <form onSubmit={handleAddSyllabus}>
                        <div className="admin-modal-body">
                            <div className="modal-form">
                                <div className="modal-field">
                                    <label>New Syllabus Name</label>
                                    <div style={{display: 'flex', gap: '0.5rem'}}>
                                        <input type="text" placeholder="e.g. C-30" value={newSyllabusTitle} onChange={e => setNewSyllabusTitle(e.target.value)} required />
                                        <button type="submit" className="btn-primary" style={{padding: '0 1rem'}} disabled={isSaving}>Add</button>
                                    </div>
                                </div>
                                <div style={{marginTop: '1.5rem'}}>
                                    <label style={{fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem'}}>Existing Schemes</label>
                                    <div className="manage-list" style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                                        {syllabusesList.map(s => (
                                            <div key={s.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)'}}>
                                                <span style={{fontSize: '0.9rem'}}>{s.title} Scheme</span>
                                                <button type="button" onClick={() => handleDeleteSyllabus(s.id, s.title)} style={{background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex'}}><Trash2 size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* System Log Detail Modal */}
        {selectedLog && (
            <div className="admin-modal-overlay" onClick={() => setSelectedLog(null)}>
                <div className="admin-modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '480px'}}>
                    <div className="admin-modal-header">
                        <div className="admin-modal-header-left">
                            <div className={`admin-modal-header-icon ${selectedLog.action.toLowerCase().includes('delete') ? 'delete-action' : 'update-action'}`} 
                                 style={{ background: selectedLog.action.toLowerCase().includes('delete') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 243, 255, 0.15)', color: selectedLog.action.toLowerCase().includes('delete') ? '#ef4444' : '#00f3ff' }}>
                                <History size={18} />
                            </div>
                            <div>
                                <h3>System Log Detail</h3>
                                <p>Detailed metadata for this operation</p>
                            </div>
                        </div>
                        <button className="admin-modal-close" onClick={() => setSelectedLog(null)}><X size={16} /></button>
                    </div>
                    <div className="admin-modal-body">
                        <div className="log-detail-grid">
                            <div className="log-detail-section">
                                <label>Action & Scope</label>
                                <div className="log-detail-card">
                                    <div className="log-detail-row">
                                        <span className="label">Operation:</span>
                                        <span className={`log-badge ${selectedLog.action.toLowerCase().includes('delete') ? 'delete' : selectedLog.action.toLowerCase().includes('create') ? 'create' : 'update'}`}>
                                            {selectedLog.action}
                                        </span>
                                    </div>
                                    <div className="log-detail-row">
                                        <span className="label">Target Section:</span>
                                        <span className="value highlight">{selectedLog.section}</span>
                                    </div>
                                    <div className="log-detail-row">
                                        <span className="label">Timestamp:</span>
                                        <span className="value">{new Date(selectedLog.timestamp).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="log-detail-section">
                                <label>Administrator Details</label>
                                <div className="log-detail-card admin-info">
                                    <div className="log-admin-avatar-lg">
                                        {selectedLog.adminPhoto ? (
                                            <img src={selectedLog.adminPhoto} alt={selectedLog.adminName} />
                                        ) : (
                                            <div className="avatar-placeholder">{selectedLog.adminName?.charAt(0) || 'A'}</div>
                                        )}
                                    </div>
                                    <div className="admin-text">
                                        <h4>{selectedLog.adminName}</h4>
                                        <p>{selectedLog.adminEmail}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="log-detail-section" style={{marginBottom: 0}}>
                                <label>Contextual Details</label>
                                <div className="log-detail-context">
                                    {selectedLog.details}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="admin-modal-footer">
                        <button className="modal-submit-btn" onClick={() => setSelectedLog(null)}>
                            Close Audit Detail
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* User Detail Modal */}
        {selectedUser && (
            <div className="admin-modal-overlay" onClick={() => setSelectedUser(null)}>
                <div className="admin-modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '480px'}}>
                    <div className="admin-modal-header">
                        <div className="admin-modal-header-left">
                            <div className="admin-modal-header-icon" style={{ background: 'rgba(253, 224, 71, 0.1)', color: 'var(--accent-color)' }}>
                                <Users size={18} />
                            </div>
                            <div>
                                <h3>Student Profile</h3>
                                <p>Full digital identity details</p>
                            </div>
                        </div>
                        <button className="admin-modal-close" onClick={() => setSelectedUser(null)}><X size={16} /></button>
                    </div>
                    <div className="admin-modal-body">
                        <div className="user-profile-detail">
                            <div className="profile-hero">
                                <div className="profile-avatar-xl">
                                    {selectedUser.photoURL ? (
                                        <img src={selectedUser.photoURL} alt={selectedUser.name} />
                                    ) : (
                                        <div className="avatar-placeholder-xl">{selectedUser.name?.charAt(0) || 'S'}</div>
                                    )}
                                </div>
                                <h2>{selectedUser.name || 'Anonymous Student'}</h2>
                                <p>{selectedUser.email}</p>
                            </div>

                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>University (USN)</label>
                                    <div className="value">{selectedUser.usn || 'Not provided'}</div>
                                </div>
                                <div className="detail-item">
                                    <label>College Name</label>
                                    <div className="value">{selectedUser.college || 'Not provided'}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Academic Branch</label>
                                    <div className="value highlight">{selectedUser.branch || 'General'}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Current Year</label>
                                    <div className="value">{selectedUser.year || 'N/A'}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Account Created</label>
                                    <div className="value">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'Initial Setup'}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Last Updated</label>
                                    <div className="value">{selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleDateString() : 'Never'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="admin-modal-footer">
                        <button className="modal-submit-btn primary" onClick={() => setSelectedUser(null)}>
                            Done Reviewing
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Peaked Folder Modal */}
        {peakedFolder && (
            <div className="admin-modal-overlay" onClick={() => setPeakedFolder(null)}>
                <div className="admin-modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '600px'}}>
                    <div className="peak-modal-header">
                        <div className="peak-modal-title">
                            <Folder size={24} color="var(--accent-color)" />
                            <h3>Peaking inside: {peakedFolder.title}</h3>
                        </div>
                        <button className="admin-modal-close" onClick={() => setPeakedFolder(null)}><X size={18} /></button>
                    </div>
                    <div className="peak-modal-grid">
                        {resources.filter(r => r.parentId === peakedFolder.id).length > 0 ? (
                            resources.filter(r => r.parentId === peakedFolder.id).map(res => (
                                <div key={res.id} className="peek-resource-item">
                                    <div className="peek-res-info">
                                        <h5>{res.title}</h5>
                                        <p>{res.chapter || 'No chapter info'}</p>
                                    </div>
                                    <div className="res-actions">
                                        <button onClick={() => setViewUrl(res.url)} className="btn-outline btn-sm">View</button>
                                        <button onClick={() => { setPeakedFolder(null); handleEdit(res); }} className="btn-edit" style={{padding: '0.4rem'}}><Edit2 size={14} /></button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{textAlign: 'center', padding: '3rem', color: 'var(--text-muted)'}}>
                                <p>This folder is currently empty.</p>
                            </div>
                        )}
                    </div>
                    <div className="admin-modal-footer">
                        <button className="modal-submit-btn" style={{width: '100%', background: 'rgba(255,255,255,0.05)', color: 'white'}} onClick={() => setPeakedFolder(null)}>Close View</button>
                    </div>
                </div>
            </div>
        )}

        {/* View Document Modal */}
        {viewUrl && <IframeModal url={viewUrl} onClose={() => setViewUrl(null)} />}
    </>
    );
}
