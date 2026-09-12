import React, { useState, useEffect } from 'react';
import { X, Clock, Award, Zap, BookOpen, CheckCircle, Search, Filter } from 'lucide-react';

export default function HistoryDrawer({ isOpen, onClose, currentUser }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isOpen || !currentUser?.id) return;
    setLoading(true);
    fetch(`/api/history/${currentUser.id}`)
      .then(res => res.json())
      .then(data => {
        setHistory(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load history:', err);
        setLoading(false);
      });
  }, [isOpen, currentUser?.id]);

  if (!isOpen) return null;

  const filteredHistory = history.filter(item => {
    const matchesFilter = filterType === 'all' || item.type === filterType;
    const matchesSearch = !searchQuery || 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getEventIcon = (type) => {
    switch (type) {
      case 'assessment': return <Award size={16} color="#60a5fa" />;
      case 'training': return <Zap size={16} color="#f59e0b" />;
      default: return <BookOpen size={16} color="#c084fc" />;
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts) return 'Recent';
    try {
      const d = new Date(ts);
      return d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return ts;
    }
  };

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
      justifyContent: 'flex-end'
    }}>
      <div onClick={onClose} style={{ flex: 1 }} />

      <div style={{
        width: 440,
        maxWidth: '92vw',
        background: 'var(--bg-surface-elevated)',
        borderLeft: '1px solid var(--border-medium)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)'
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
            <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} color="#60a5fa" />
              Learning History & Timeline
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Audit trail of activities for {currentUser?.name}
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

        {/* Filter & Search Bar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: 11 }} />
            <input
              type="text"
              placeholder="Search past attempts, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: 32,
                fontSize: 12,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'assessment', 'training', 'session'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  background: filterType === type ? 'var(--brand-blue)' : 'var(--bg-surface)',
                  color: filterType === type ? '#fff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Events List */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              Loading learning timeline...
            </div>
          ) : filteredHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>
              No learning records found matching the filter.
            </div>
          ) : (
            <div style={{ position: 'relative', paddingLeft: 20 }}>
              {/* Timeline continuous vertical line */}
              <div style={{
                position: 'absolute',
                left: 6,
                top: 8,
                bottom: 8,
                width: 2,
                background: 'var(--border-subtle)'
              }} />

              {filteredHistory.map((item, idx) => (
                <div key={item.id || idx} style={{ position: 'relative', marginBottom: 20 }}>
                  {/* Timeline bullet dot */}
                  <div style={{
                    position: 'absolute',
                    left: -20,
                    top: 4,
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: item.type === 'assessment' ? '#2563eb' : item.type === 'training' ? '#ea580c' : '#8b5cf6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--bg-surface-elevated)'
                  }} />

                  <div style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {getEventIcon(item.type)}
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {item.title}
                        </span>
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {formatTimestamp(item.timestamp)}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {item.description}
                    </div>
                    {item.score !== undefined && (
                      <div style={{ marginTop: 6, display: 'inline-block' }}>
                        <span className={`badge ${item.score >= 70 ? 'badge-green' : item.score >= 50 ? 'badge-yellow' : 'badge-red'}`} style={{ fontSize: 10, padding: '2px 8px' }}>
                          Score: {item.score}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-subtle)', fontSize: 11, color: 'var(--text-muted)' }}>
          Real-time timeline synchronized with SQLite database.
        </div>
      </div>
    </div>
  );
}
