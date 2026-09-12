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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentLang, setCurrentLang] = useState('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
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
        if (user.role === 'admin' && currentTab === 'assessment') {
          setCurrentTab('admin');
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
        setCurrentTab={setCurrentTab}
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
            onNavigate={setCurrentTab}
            onOpenHistory={() => setIsHistoryOpen(true)}
            currentLang={currentLang}
          />
        )}
        {currentTab === 'competency' && (
          <CompetencyTwin
            currentUser={currentUser}
            onNavigate={setCurrentTab}
          />
        )}
        {currentTab === 'assessment' && (
          <AdaptiveAssessment
            currentUser={currentUser}
            onNavigate={setCurrentTab}
          />
        )}
        {currentTab === 'pdfquiz' && (
          <PdfQuizGenerator
            currentUser={currentUser}
            onNavigate={setCurrentTab}
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
            onNavigate={setCurrentTab}
          />
        )}
        {currentTab === 'predictor' && (
          <CareerPredictor
            currentUser={currentUser}
            onNavigate={setCurrentTab}
          />
        )}
        {currentTab === 'geo' && (
          <GeoHeatMap />
        )}
        {currentTab === 'mentor' && (
          <AiMentor
            currentUser={currentUser}
            onNavigate={setCurrentTab}
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
        setCurrentTab={setCurrentTab}
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
