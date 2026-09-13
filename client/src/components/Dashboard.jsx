import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Cpu, 
  Award, 
  BookOpen, 
  Zap, 
  TrendingUp, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  Flame,
  FileText,
  MapPin,
  Globe
} from 'lucide-react';
import { getTranslation } from '../utils/i18n';

export default function Dashboard({ currentUser, onNavigate, onOpenHistory, currentLang }) {
  const [summary, setSummary] = useState(null);
  const [scores, setScores] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const t = getTranslation(currentLang);

  useEffect(() => {
    if (!currentUser?.id) return;
    setLoading(true);

    Promise.all([
      fetch(`/api/competency/summary/${currentUser.id}`).then(r => r.json()),
      fetch(`/api/competency/scores/${currentUser.id}`).then(r => r.json()),
      fetch(`/api/history/${currentUser.id}`).then(r => r.json()),
    ])
      .then(([sumData, scoreData, histData]) => {
        setSummary(sumData);
        setScores(Array.isArray(scoreData) ? scoreData : []);
        setRecentEvents(Array.isArray(histData) ? histData.slice(0, 4) : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading dashboard:', err);
        setLoading(false);
      });
  }, [currentUser?.id]);

  const topGap = summary?.criticalGaps?.[0] || { skill: 'Data Quality & Governance', score: 38 };

  return (
    <div className="container-responsive" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Welcome Hero Banner */}
      <div className="responsive-hero">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="badge badge-blue">
              <Sparkles size={12} /> {t.learningLoopActive}
            </span>
            <span className="badge badge-teal">
              {t.liveDb}
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginTop: 10 }}>
            {t.welcomeBack}, {currentUser?.name || 'Learner'}!
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 6, maxWidth: 640, lineHeight: 1.6 }}>
            Your continuous Competency Twin is calibrated to {currentUser?.designation || 'Data Specialist'}. The closed-loop diagnostic engine has updated your skill roadmap based on recent activity.
          </p>
        </div>

        <div className="responsive-hero-actions" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('geo')}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: 13.5, background: 'linear-gradient(135deg, #0d9488, #2563eb)', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 0 16px rgba(13, 148, 136, 0.4)' }}
          >
            <MapPin size={16} /> 🇮🇳 {t.tabGeo || 'India Heat Map'}
          </button>
          <button
            onClick={() => onNavigate('assessment')}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: 13.5 }}
          >
            <Award size={16} /> {t.takeTest}
          </button>
          <button
            onClick={() => onNavigate('pdfquiz')}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: 13.5, background: 'linear-gradient(135deg, #ea580c, #8b5cf6)' }}
          >
            <FileText size={16} /> {t.tabPdfQuiz}
          </button>
          <button
            onClick={() => onNavigate('training')}
            className="btn-secondary"
            style={{ padding: '10px 20px', fontSize: 13.5 }}
          >
            <Zap size={16} color="#fb923c" /> {t.resumeTraining}
          </button>
        </div>
      </div>

      {/* Top Telemetry KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
        {/* Card 1: Overall Competency */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {t.avgCompetency}
            </span>
            <Cpu size={16} color="#2dd4bf" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#2dd4bf', marginTop: 8 }}>
            {summary?.averageScore || 55}%
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            Benchmark Target: 85%
          </div>
        </div>

        {/* Card 2: Critical Gaps */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {t.topCriticalGap}
            </span>
            <AlertTriangle size={16} color="#f87171" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#f87171', marginTop: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {topGap.skill}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            Current Mastery: <strong style={{ color: '#f87171' }}>{topGap.score}%</strong> (High Priority)
          </div>
        </div>

        {/* Card 3: Career Readiness */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {t.roleReadiness}
            </span>
            <TrendingUp size={16} color="#818cf8" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#818cf8', marginTop: 8 }}>
            68%
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            Senior Data Analyst Track
          </div>
        </div>

        {/* Card 4: Learning Velocity */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {t.activeStreak}
            </span>
            <Flame size={16} color="#ea580c" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#ea580c', marginTop: 8 }}>
            4 Days
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            +18% Competency Acceleration
          </div>
        </div>
      </div>

      {/* India Geographical Skill-Gap Heat Map Interactive Showcase Banner */}
      <div 
        className="card" 
        style={{ 
          padding: '24px 28px', 
          background: 'radial-gradient(ellipse at 85% 50%, rgba(13, 148, 136, 0.22) 0%, rgba(15, 23, 42, 0.95) 70%)', 
          border: '1px solid rgba(13, 148, 136, 0.4)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 8px 30px rgba(13, 148, 136, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20
        }}
      >
        <div style={{ maxWidth: 640 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span className="badge badge-teal" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <MapPin size={12} /> National Skill Intelligence
            </span>
            <span className="badge badge-blue">Live Telemetry</span>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '4px 0 8px 0' }}>
            🇮🇳 India Geographical Skill-Gap Heat Map
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Real-time state telemetry mapping regional competency levels across 16 states. Identify high-priority intervention zones (UP, Bihar, Assam, Odisha) and benchmark centers (Karnataka, Kerala).
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap', fontSize: 12 }}>
            <span style={{ color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span> Leaders: KA (78%), KL (76%), MH (74%)
            </span>
            <span style={{ color: '#f87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></span> High Need: BR (48%), AS (51%), UP (52%), OD (53%)
            </span>
          </div>
        </div>

        <button
          onClick={() => onNavigate('geo')}
          className="btn-primary"
          style={{
            padding: '12px 24px',
            fontSize: 14,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #0d9488, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 4px 20px rgba(13, 148, 136, 0.35)',
            cursor: 'pointer'
          }}
        >
          <MapPin size={18} />
          <span>Open India Heat Map</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Main Grid: Competency Digital Twin & AI Recommended Action */}
      <div className="responsive-grid-split">
        {/* Left Column: Competency Twin Preview */}
        <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{t.twinStatus}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Live multi-axis evaluation</p>
            </div>
            <button
              onClick={() => onNavigate('competency')}
              style={{ fontSize: 12, color: '#60a5fa', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {t.openFullRadar} <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(scores.length > 0 ? scores : [
              { skill: 'Python Programming', score: 72 },
              { skill: 'SQL & Databases', score: 58 },
              { skill: 'Statistics & Probability', score: 65 },
              { skill: 'Data Modeling', score: 45 },
              { skill: 'Data Quality & Governance', score: 38 },
              { skill: 'Machine Learning', score: 52 },
            ]).map((s) => (
              <div key={s.skill} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.skill}</span>
                  <span style={{ fontWeight: 700, color: s.score >= 70 ? '#34d399' : s.score >= 50 ? '#fbbf24' : '#f87171' }}>
                    {s.score}%
                  </span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${s.score}%`,
                    background: s.score >= 70 ? '#10b981' : s.score >= 50 ? '#f59e0b' : '#ef4444',
                    borderRadius: 3
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: AI Recommended Action & Quick Jumps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Action Card */}
          <div className="card" style={{
            padding: 24,
            background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.12), rgba(37, 99, 235, 0.12))',
            border: '1px solid rgba(234, 88, 12, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} color="#fb923c" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fb923c', textTransform: 'uppercase' }}>
                {t.aiPrescribed}
              </span>
            </div>

            <h4 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
              Practice: SQL Window Functions & Aggregations
            </h4>

            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Diagnostic assessment flagged complex partitioning and analytical queries as your primary bottleneck. Completing this training module will yield an estimated <strong>+12 point gain</strong> on your digital twin.
            </p>

            <button
              onClick={() => onNavigate('training')}
              className="btn-primary"
              style={{ background: 'linear-gradient(135deg, #ea580c, #2563eb)', alignSelf: 'flex-start' }}
            >
              <Zap size={14} /> {t.launchModule} <ArrowRight size={14} />
            </button>
          </div>

          {/* Recent Timeline Preview */}
          <div className="card" style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>{t.recentEvents}</h3>
              <button
                onClick={onOpenHistory}
                style={{ fontSize: 11, color: '#60a5fa', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                {t.viewAll} <ChevronRight size={13} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentEvents.length > 0 ? (
                recentEvents.map((evt, i) => (
                  <div
                    key={evt.id || i}
                    style={{
                      padding: 10,
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 12
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Clock size={14} color="var(--text-muted)" />
                      <span style={{ fontWeight: 600, color: '#fff' }}>{evt.title}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                      {evt.score ? `${evt.score}%` : 'Completed'}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Loading recent events...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
