import React, { useState } from 'react';
import { 
  Compass, 
  Cpu, 
  BookOpen, 
  Award, 
  TrendingUp, 
  MapPin, 
  MessageSquare, 
  ShieldCheck, 
  MoreVertical, 
  ChevronDown,
  Sparkles,
  Zap,
  FileText,
  Globe,
  LogOut
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, getTranslation } from '../utils/i18n';

export default function Header({ 
  currentTab, 
  setCurrentTab, 
  currentUser, 
  users, 
  onSwitchUser, 
  onLogout,
  onToggleMenu,
  currentLang,
  onChangeLang
}) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const t = getTranslation(currentLang);

  const navItems = [
    { id: 'dashboard', label: t.tabDashboard, icon: Compass },
    { id: 'competency', label: t.tabTwin, icon: Cpu, badge: 'Twin' },
    { id: 'assessment', label: t.tabAssessment, icon: Award },
    { id: 'pdfquiz', label: t.tabPdfQuiz, icon: FileText, badge: 'PDF' },
    { id: 'rag', label: t.tabRag, icon: BookOpen, badge: 'AI' },
    { id: 'training', label: t.tabTraining, icon: Zap },
    { id: 'predictor', label: t.tabPredictor, icon: TrendingUp },
    { id: 'geo', label: t.tabGeo, icon: MapPin },
    { id: 'mentor', label: t.tabMentor, icon: MessageSquare },
  ];

  if (currentUser?.role === 'admin' || currentUser?.role === 'trainer') {
    navItems.push({ id: 'admin', label: t.tabAdmin, icon: ShieldCheck, badge: currentUser.role });
  }

  const activeLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-top-row">
          {/* Brand & Emblem */}
          <div 
            onClick={() => setCurrentTab('dashboard')}
            className="header-brand"
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(37, 99, 235, 0.4)'
            }}>
              <Sparkles size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="header-brand-title" style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.3, color: '#ffffff' }}>
                  {t.platformTitle}
                </span>
                <span className="badge badge-blue" style={{ fontSize: 10, padding: '2px 6px' }}>
                  {t.govBadge}
                </span>
              </div>
              <div className="header-subtitle" style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>
                {t.platformSubtitle}
              </div>
            </div>
          </div>

          {/* Right Tools: Language Selector, User Switcher, Logout, Menu */}
          <div className="header-tools">
            {/* Multilingual Selector Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: 12,
                  cursor: 'pointer'
                }}
                title="Change Language / भाषा बदलें"
              >
                <Globe size={14} color="#60a5fa" />
                <span style={{ fontWeight: 600 }}>{activeLangObj.native}</span>
                <ChevronDown size={12} color="var(--text-muted)" />
              </button>

              {showLangDropdown && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 44,
                  width: 180,
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 100,
                  padding: 6
                }}>
                  <div style={{ padding: '6px 10px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Select Language
                  </div>
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onChangeLang(lang.code);
                        setShowLangDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: lang.code === currentLang ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                        color: lang.code === currentLang ? '#60a5fa' : 'var(--text-primary)',
                        fontSize: 12,
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{lang.native}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Switcher & Logout Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)'
                }}
              >
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: currentUser?.role === 'admin' 
                    ? 'linear-gradient(135deg, #ef4444, #f59e0b)' 
                    : currentUser?.role === 'trainer'
                      ? 'linear-gradient(135deg, #10b981, #0d9488)'
                      : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#fff'
                }}>
                  {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
                </div>
                <div className="header-hide-mobile" style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600 }}>{currentUser?.name || 'User'}</div>
                  <div style={{ fontSize: 9.5, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {currentUser?.designation || currentUser?.role || 'Learner'}
                  </div>
                </div>
                <ChevronDown size={13} color="var(--text-muted)" />
              </button>

              {showUserDropdown && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 44,
                  width: 250,
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 100,
                  padding: 8
                }}>
                  <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{currentUser?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{currentUser?.email}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{currentUser?.department} • {currentUser?.region}</div>
                  </div>

                  <div style={{ padding: '8px 4px 4px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '4px 8px' }}>
                      {t.switchPersona}
                    </div>
                    {users.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSwitchUser(u.id);
                          setShowUserDropdown(false);
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: u.id === currentUser?.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                          color: u.id === currentUser?.id ? '#60a5fa' : 'var(--text-primary)',
                          fontSize: 12,
                          textAlign: 'left'
                        }}
                      >
                        <span style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: u.id === currentUser?.id ? '#60a5fa' : 'transparent',
                          border: u.id === currentUser?.id ? 'none' : '1px solid var(--text-muted)'
                        }} />
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto' }}>{u.role}</span>
                      </button>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 6, marginTop: 4 }}>
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        color: '#f87171',
                        fontSize: 12,
                        fontWeight: 600,
                        textAlign: 'left'
                      }}
                    >
                      <LogOut size={14} />
                      <span>{t.signOut}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Three-Dot Menu Button */}
            <button
              onClick={onToggleMenu}
              aria-label="Open Application Menu"
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)'
              }}
            >
              <MoreVertical size={17} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="header-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 11px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 12.5,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(37, 99, 235, 0.18)' : 'transparent',
                  border: isActive ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <Icon size={15} color={isActive ? '#60a5fa' : '#94a3b8'} />
                <span>{item.label}</span>
                {item.badge && (
                  <span style={{
                    fontSize: 9,
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: 4,
                    background: isActive ? '#2563eb' : 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    textTransform: 'uppercase'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
