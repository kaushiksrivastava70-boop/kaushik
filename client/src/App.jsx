import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ThreeDotMenu from './components/ThreeDotMenu';
import HistoryDrawer from './components/HistoryDrawer';
import Dashboard from './components/Dashboard';
import CompetencyTwin from './components/CompetencyTwin';
import AdaptiveAssessment from './components/AdaptiveAssessment';
import RagTutor from './components/RagTutor';
import PdfQuizGenerator from './components/PdfQuizGenerator';
import TrainingMode from './components/TrainingMode';
import CareerPredictor from './components/CareerPredictor';
import GeoHeatMap from './components/GeoHeatMap';
import AiMentor from './components/AiMentor';
import AdminCenter from './components/AdminCenter';
import LoginPage from './components/LoginPage';

const VALID_TABS = ['dashboard', 'competency', 'assessment', 'pdfquiz', 'rag', 'training', 'predictor', 'geo', 'mentor', 'admin'];

export default function App() {
  const getInitialTab = () => {
    if (typeof window === 'undefined') return 'dashboard';
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (VALID_TABS.includes(hash)) return hash;
    if (hash === 'india' || hash === 'heatmap' || hash === 'map') return 'geo';
    return 'dashboard';
  };

  const defaultGuestUser = {
    id: 'user-ananya',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@gov.in',
    role: 'learner',
    designation: 'Junior Data Analyst',
    department: 'Data Analytics Division',
    region: 'Delhi'
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentTab, setCurrentTab] = useState(getInitialTab);
  const [currentUser, setCurrentUser] = useState(defaultGuestUser);
  const [users, setUsers] = useState([]);
  const [currentLang, setCurrentLang] = useState('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const switchTab = (tab) => {
    const target = VALID_TABS.includes(tab) ? tab : 'dashboard';
    setCurrentTab(target);
    if (window.location.hash.replace('#', '') !== target) {
      window.location.hash = target;
    }
  };

  // Keep saved user preference if available
  useEffect(() => {
    const saved = localStorage.getItem('skillmatrix_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u && u.id) {
          setCurrentUser(u);
        }
      } catch (e) {
        console.error('Session load error:', e);
      }
    }
  }, []);

  // Hash change synchronization
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (VALID_TABS.includes(hash)) {
        setCurrentTab(hash);
      } else if (hash === 'india' || hash === 'heatmap' || hash === 'map') {
        setCurrentTab('geo');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Initialize and load users
  useEffect(() => {
    fetch('/api/auth/users')
      .then(r => r.json())
      .then(usersList => {
        const uList = Array.isArray(usersList) ? usersList : [];
        setUsers(uList);
        if (uList.length > 0 && !currentUser) {
          const defaultUser = uList.find(u => u.id === 'user-ananya') || uList[0];
          setCurrentUser(defaultUser);
        }
      })
      .catch(err => console.error('Failed to load users:', err));
  }, []);

  const handleLoginSuccess = (user, targetTab) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('skillmatrix_user', JSON.stringify(user));
    } catch (e) {}
    const hash = window.location.hash.replace('#', '').toLowerCase();
    const dest = targetTab || (VALID_TABS.includes(hash) ? hash : 'dashboard');
    switchTab(dest);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('skillmatrix_user');
    } catch (e) {}
  };

  const handleSwitchUser = (userId) => {
    fetch('/api/auth/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    })
      .then(r => r.json())
      .then(user => {
        setCurrentUser(user);
        try {
          localStorage.setItem('skillmatrix_user', JSON.stringify(user));
        } catch (e) {}
        if (user.role === 'admin' && currentTab === 'assessment') {
          switchTab('admin');
        }
      })
      .catch(err => console.error('Switch user error:', err));
  };

  // Google-Style Login Gate
  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        currentLang={currentLang}
        onChangeLang={setCurrentLang}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={switchTab}
        currentUser={currentUser}
        users={users}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        onToggleMenu={() => setIsMenuOpen(true)}
        currentLang={currentLang}
        onChangeLang={setCurrentLang}
      />

      {/* Main View Area */}
      <main style={{ flex: 1, paddingBottom: 60 }}>
        {currentTab === 'dashboard' && (
          <Dashboard
            currentUser={currentUser}
            onNavigate={switchTab}
            onOpenHistory={() => setIsHistoryOpen(true)}
            currentLang={currentLang}
          />
        )}
        {currentTab === 'competency' && (
          <CompetencyTwin
            currentUser={currentUser}
            onNavigate={switchTab}
          />
        )}
        {currentTab === 'assessment' && (
          <AdaptiveAssessment
            currentUser={currentUser}
            onNavigate={switchTab}
          />
        )}
        {currentTab === 'pdfquiz' && (
          <PdfQuizGenerator
            currentUser={currentUser}
            onNavigate={switchTab}
            currentLang={currentLang}
          />
        )}
        {currentTab === 'rag' && (
          <RagTutor
            currentUser={currentUser}
          />
        )}
        {currentTab === 'training' && (
          <TrainingMode
            currentUser={currentUser}
            onNavigate={switchTab}
          />
        )}
        {currentTab === 'predictor' && (
          <CareerPredictor
            currentUser={currentUser}
            onNavigate={switchTab}
          />
        )}
        {currentTab === 'geo' && (
          <GeoHeatMap onNavigate={switchTab} />
        )}
        {currentTab === 'mentor' && (
          <AiMentor
            currentUser={currentUser}
            onNavigate={switchTab}
          />
        )}
        {currentTab === 'admin' && (
          <AdminCenter
            currentUser={currentUser}
          />
        )}
      </main>

      {/* Slide-out Three Dot Menu Drawer */}
      <ThreeDotMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        setCurrentTab={switchTab}
        onOpenHistory={() => setIsHistoryOpen(true)}
        currentUser={currentUser}
      />

      {/* Slide-out History & Timeline Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
