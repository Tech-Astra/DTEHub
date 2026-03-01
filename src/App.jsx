import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WorkspaceDock from './components/WorkspaceDock';
import ProfileOnboardingModal from './components/ProfileOnboardingModal';
import Home from './pages/Home';
import Notes from './pages/Notes';
import Profile from './pages/Profile';
import DCET from './pages/DCET';
import Contribute from './pages/Contribute';
import Admin from './pages/Admin';
import PrivacyPolicy from './pages/Legal';
import Papers from './pages/Papers';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          {/* Background Branding Watermark for all pages */}
          <div className="bg-branding-watermark flex-center">
            <img src="/favicon.png" alt="" className="watermark-logo" />
            <span className="watermark-x">×</span>
            <span>DTEHub</span>
          </div>
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
              <Route path="/papers" element={<ProtectedRoute><Papers /></ProtectedRoute>} />
              <Route path="/dcet" element={<ProtectedRoute><DCET /></ProtectedRoute>} />
              <Route path="/contribute" element={<Contribute />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
            </Routes>
          </main>
          {/* Global Workspace Dock — visible on every page */}
          <WorkspaceDock />

          {/* Profile Onboarding Modal for first-time sign-ins */}
          <ProfileOnboardingModal />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
