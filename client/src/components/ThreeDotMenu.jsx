import React from 'react';
import { 
  X, 
  Database, 
  Clock, 
  RotateCcw, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  Cpu, 
  Award, 
  BookOpen, 
  Zap, 
  TrendingUp, 
  MapPin, 
  MessageSquare, 
  ShieldCheck 
} from 'lucide-react';

export default function ThreeDotMenu({ 
  isOpen, 
  onClose, 
  setCurrentTab, 
  onOpenHistory, 
  currentUser 
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(6px)',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'flex-end',
      transition: 'opacity 0.2s ease'
    }}>
      {/* Drawer Overlay backdrop dismiss */}
      <div 
        onClick={onClose} 
        style={{ flex: 1 }} 
      />

      {/* Slide-in Drawer */}
      <div style={{
        width: 380,
        maxWidth: '90vw',
        background: 'var(--bg-surface-elevated)',
        borderLeft: '1px solid var(--border-medium)',
        height: '100%',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Platform Navigation & Tools
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              SkillMatrix AI Enterprise Quick Access
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{
          padding: '20px 24px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 24
        }}>
          {/* Timeline & History Button */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
              Learning History & Audit
            </div>
            <button
              onClick={() => {
                onOpenHistory();
                onClose();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(139, 92, 246, 0.15))',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: 'var(--text-primary)',
                textAlign: 'left'
              }}
            >
              <Clock size={20} color="#60a5fa" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>History & Timeline Drawer</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  View past assessments, sessions, & score gains
                </div>
              </div>
            </button>
          </div>

          {/* Quick Jump Navigation */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
              Quick Module Jump
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { id: 'competency', label: 'Digital Twin', icon: Cpu },
                { id: 'assessment', label: 'Adaptive Test', icon: Award },
                { id: 'rag', label: 'RAG Knowledge', icon: BookOpen },
                { id: 'training', label: 'Training Mode', icon: Zap },
                { id: 'predictor', label: 'Career Future', icon: TrendingUp },
                { id: 'geo', label: 'India Heat Map', icon: MapPin },
                { id: 'mentor', label: 'AI Mentor', icon: MessageSquare },
                { id: 'admin', label: 'Command Center', icon: ShieldCheck },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setCurrentTab(m.id);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: 12,
                      fontWeight: 500,
                      textAlign: 'left'
                    }}
                  >
                    <Icon size={16} color="#94a3b8" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* System & Database Status */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
              Architecture & Persistence Status
            </div>
            <div style={{
              padding: 16,
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Database size={14} color="#10b981" /> Storage Engine
                </span>
                <span style={{ fontWeight: 600, color: '#34d399' }}>SQLite Persistent</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Server Port</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>5000 (REST API)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-secondary)' }}>State Restoration</span>
                <span style={{ fontWeight: 600, color: '#60a5fa' }}>Multi-user Sync</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-secondary)' }}>RAG Vector Chunking</span>
                <span style={{ fontWeight: 600, color: '#c084fc' }}>TF-IDF + Cosine</span>
              </div>
            </div>
          </div>

          {/* Compliance & Spec Note */}
          <div style={{
            padding: 14,
            borderRadius: 'var(--radius-md)',
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            fontSize: 11,
            color: 'var(--text-secondary)',
            lineHeight: 1.5
          }}>
            <strong style={{ color: '#60a5fa' }}>SkillMatrix AI Architecture Guarantee:</strong> All attempts, radar competency updates, and RAG document queries are persisted on the server SQLite database and survive page refreshes.
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: 11,
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>SkillMatrix AI v1.0.0</span>
          <span>Enterprise Talent Platform</span>
        </div>
      </div>
    </div>
  );
}
