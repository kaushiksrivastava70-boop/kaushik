import React, { useState } from 'react';
import { Sparkles, Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2, User, Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getTranslation } from '../utils/i18n';

export default function LoginPage({ onLoginSuccess, currentLang, onChangeLang }) {
  const [identifier, setIdentifier] = useState('ananya.sharma@gov.in');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const t = getTranslation(currentLang);

  const demoAccounts = [
    { name: 'Ananya Sharma', email: 'ananya.sharma@gov.in', role: 'Junior Data Analyst', dept: 'Data Analytics' },
    { name: 'Rajesh Kumar', email: 'rajesh.kumar@gov.in', role: 'ML Research Associate', dept: 'AI & ML Wing' },
    { name: 'Priya Menon', email: 'priya.menon@gov.in', role: 'Statistical Officer', dept: 'Statistical Bureau' },
    { name: 'Dr. Vikram Singh', email: 'vikram.singh@gov.in', role: 'Senior Training Officer', dept: 'Training Academy' },
    { name: 'Sunita Deshmukh', email: 'sunita.deshmukh@gov.in', role: 'Program Director (Admin)', dept: 'GovTech Authority' },
  ];

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage('Please enter an email or username');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: identifier, password })
    })
      .then(res => {
        if (!res.ok) throw new Error('Login failed');
        return res.json();
      })
      .then(user => {
        setIsLoading(false);
        onLoginSuccess(user);
      })
      .catch(err => {
        setIsLoading(false);
        // Fallback for offline demo
        onLoginSuccess({
          id: 'user-ananya',
          name: 'Ananya Sharma',
          email: identifier,
          role: 'learner',
          designation: 'Junior Data Analyst',
          department: 'Data Analytics Division'
        });
      });
  };

  const selectDemoUser = (user) => {
    setIdentifier(user.email);
    setPassword('demo123');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'radial-gradient(circle at 50% 20%, #172554 0%, #090d16 80%)',
      padding: '24px 16px',
      position: 'relative'
    }}>
      {/* Background Subtle Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 0)',
        backgroundSize: '24px 24px',
        pointerEvents: 'none'
      }} />

      {/* Google-Style Card */}
      <div style={{
        width: '100%',
        maxWidth: 460,
        background: '#0f172a',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 24,
        padding: '40px 36px',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(37, 99, 235, 0.15)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 24
      }}>
        {/* Google-Style Header with Platform Logo */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          {/* Logo Badge */}
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.4)'
          }}>
            <Sparkles size={26} color="#fff" />
          </div>

          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc', letterSpacing: -0.3 }}>
              {t.signInTitle}
            </h1>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
              {t.signInSubtitle}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: 12
          }}>
            {errorMessage}
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Email / Username Input */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: 6 }}>
              {t.emailLabel}
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. ananya.sharma@gov.in"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: 14,
                borderRadius: 10,
                background: '#1e293b',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#fff'
              }}
            />
          </div>

          {/* Password Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>
                {t.passwordLabel}
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  fontSize: 11,
                  color: '#60a5fa',
                  background: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                {showPassword ? 'Hide' : t.showPassword}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: 14,
                borderRadius: 10,
                background: '#1e293b',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#fff'
              }}
            />
          </div>

          {/* Remember Me Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8' }}>
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ width: 16, height: 16, cursor: 'pointer' }}
            />
            <label htmlFor="remember" style={{ cursor: 'pointer' }}>
              {t.rememberMe}
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <span style={{ fontSize: 12, color: '#60a5fa', cursor: 'pointer' }}>
              Need account help?
            </span>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{
                padding: '10px 24px',
                fontSize: 14,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
              }}
            >
              {isLoading ? 'Authenticating...' : t.signInBtn}
              <ArrowRight size={15} />
            </button>
          </div>
        </form>

        {/* Demo One-Click Personas Picker */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 10 }}>
            {t.demoAccountsTitle}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {demoAccounts.map((u) => {
              const isSelected = identifier === u.email;
              return (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => selectDemoUser(u)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: isSelected ? 'rgba(37, 99, 235, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                    textAlign: 'left',
                    color: isSelected ? '#60a5fa' : '#cbd5e1',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700
                    }}>
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{u.name}</div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>{u.role}</div>
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 size={14} color="#60a5fa" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Google-Style Footer with Language Selector */}
      <div style={{
        marginTop: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 460,
        fontSize: 12,
        color: '#64748b',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Globe size={14} />
          <select
            value={currentLang}
            onChange={(e) => onChangeLang(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: 12,
              cursor: 'pointer',
              outline: 'none',
              padding: '2px 4px'
            }}
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code} style={{ background: '#0f172a', color: '#fff' }}>
                {lang.native} ({lang.name})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          <span>Privacy</span>
          <span>Terms</span>
          <span>Help</span>
        </div>
      </div>
    </div>
  );
}
