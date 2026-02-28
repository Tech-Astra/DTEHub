import { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserWorkspace } from '../hooks/useUserWorkspace';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const auth = useAuth();
  const workspace = useUserWorkspace(auth.user);

  return (
    <AuthContext.Provider value={{ ...auth, ...workspace }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
