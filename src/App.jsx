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
              <Route path="/notes" element={<Notes />} />
              <Route path="/dcet" element={<DCET />} />
              <Route path="/contribute" element={<Contribute />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          <Footer />
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
