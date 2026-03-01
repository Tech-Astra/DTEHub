import { useAuthContext } from '../context/AuthContext';
import { LogIn, ShieldCheck } from 'lucide-react';

export default function ProtectedRoute({ children }) {
    const { user, loading, loginWithGoogle } = useAuthContext();

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '60vh' }}>
                <div className="loader"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex-center" style={{
                minHeight: '60vh',
                flexDirection: 'column',
                gap: '1.5rem',
                textAlign: 'center',
                padding: '2rem'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'rgba(var(--accent-rgb, 99, 102, 241), 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <ShieldCheck size={40} style={{ color: 'var(--accent-color)' }} />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Login Required</h2>
                <p style={{ color: 'var(--text-muted)', margin: 0, maxWidth: '400px' }}>
                    You need to sign in to access this page. Please log in with your Google account to continue.
                </p>
                <button
                    className="btn-primary"
                    onClick={loginWithGoogle}
                    style={{
                        marginTop: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.75rem',
                        fontSize: '1rem'
                    }}
                >
                    <LogIn size={18} />
                    Sign In with Google
                </button>
            </div>
        );
    }

    return children;
}
