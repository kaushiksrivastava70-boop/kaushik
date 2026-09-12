import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Award, 
  AlertTriangle, 
  TrendingUp, 
  Send, 
  CheckCircle2, 
  Layers, 
  Clock, 
  FileText,
  Filter
} from 'lucide-react';

export default function AdminCenter({ currentUser }) {
  const [kpis, setKpis] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [trainingReview, setTrainingReview] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'interventions', 'training-review', 'audit'

  // Intervention modal state
  const [targetRegion, setTargetRegion] = useState('Uttar Pradesh');
  const [targetSkill, setTargetSkill] = useState('Python Programming');
  const [actionType, setActionType] = useState('Accelerated Workshop');
  const [notes, setNotes] = useState('Target 15% competency gain within 30 days');
  const [dispatchSuccess, setDispatchSuccess] = useState(null);

  useEffect(() => {
    fetch('/api/admin/kpis')
      .then(r => r.json())
      .then(data => setKpis(data))
      .catch(err => console.error('Admin KPIs error:', err));

    fetch('/api/admin/audit-logs')
      .then(r => r.json())
      .then(data => setAuditLogs(Array.isArray(data) ? data : []))
      .catch(err => console.error('Audit logs error:', err));

    fetch('/api/admin/training-review')
      .then(r => r.json())
      .then(data => setTrainingReview(data))
      .catch(err => console.error('Training review error:', err));
  }, []);

  const handleDispatchIntervention = (e) => {
    e.preventDefault();
    fetch('/api/admin/interventions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `${actionType} for ${targetSkill}`,
        targetRegion,
        targetSkill,
        actionType,
        notes,
        createdBy: currentUser?.id || 'user-admin'
      })
    })
      .then(r => r.json())
      .then(res => {
        setDispatchSuccess(res.message);
        setTimeout(() => setDispatchSuccess(null), 5000);
      })
      .catch(err => console.error('Dispatch error:', err));
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(37, 99, 235, 0.15))',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #ef4444, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)'
          }}>
            <ShieldCheck size={28} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>
                Admin & Trainer Command Center
              </h1>
              <span className="badge badge-red">Executive Governance</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              National oversight of learning cohorts, intervention deployment, and trainer review workflows.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { id: 'overview', label: 'Executive KPIs' },
            { id: 'interventions', label: 'Deploy Intervention' },
            { id: 'training-review', label: 'Trainer Review' },
            { id: 'audit', label: 'Audit Trail' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: 12,
                fontWeight: 600,
                background: activeTab === t.id ? 'var(--brand-blue)' : 'var(--bg-surface-elevated)',
                color: activeTab === t.id ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Executive KPIs & Department Breakdown */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Top KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            <div className="card" style={{ padding: 22 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Total Active Learners
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#60a5fa', marginTop: 4 }}>
                {kpis?.totalLearners || 5}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                Enrolled across civil divisions
              </div>
            </div>

            <div className="card" style={{ padding: 22 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Completed Assessments
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#34d399', marginTop: 4 }}>
                {kpis?.totalAssessments || 12}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                100% verified server records
              </div>
            </div>

            <div className="card" style={{ padding: 22 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                National Avg Competency
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#2dd4bf', marginTop: 4 }}>
                {kpis?.averageCompetency || 64.5}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                Against 75% target benchmark
              </div>
            </div>

            <div className="card" style={{ padding: 22 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Critical Gap Alerts
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#f87171', marginTop: 4 }}>
                {kpis?.criticalGapsCount || 3}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                Requires policy intervention
              </div>
            </div>
          </div>

          {/* Department Competency Table */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              Department Competency & Readiness Telemetry
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px' }}>Department</th>
                    <th style={{ padding: '10px 14px' }}>Enrolled Cohort</th>
                    <th style={{ padding: '10px 14px' }}>Average Competency</th>
                    <th style={{ padding: '10px 14px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(kpis?.departmentStats || [
                    { department: 'Data Analytics Division', user_count: 1, avg_score: 55.0 },
                    { department: 'AI & ML Wing', user_count: 1, avg_score: 72.5 },
                    { department: 'Statistical Bureau', user_count: 1, avg_score: 64.0 },
                  ]).map((dept, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: '#fff' }}>{dept.department}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{dept.user_count} Learners</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: dept.avg_score >= 70 ? '#34d399' : dept.avg_score >= 55 ? '#fbbf24' : '#f87171' }}>
                        {dept.avg_score}%
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={`badge ${dept.avg_score >= 70 ? 'badge-green' : dept.avg_score >= 55 ? 'badge-yellow' : 'badge-red'}`}>
                          {dept.avg_score >= 70 ? 'Benchmark Met' : dept.avg_score >= 55 ? 'Progressing' : 'Intervention Needed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Intervention Deployment */}
      {activeTab === 'interventions' && (
        <div className="card" style={{ padding: 32, maxWidth: 800, margin: '0 auto', width: '100%' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            Trigger Regional Skill Intervention
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
            Dispatches automated alerts, allocates special workshop cohorts, and records intervention mandates in the government audit ledger.
          </p>

          {dispatchSuccess && (
            <div style={{
              padding: 14,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              fontSize: 13,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <CheckCircle2 size={18} />
              {dispatchSuccess}
            </div>
          )}

          <form onSubmit={handleDispatchIntervention} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                  Target Region / State
                </label>
                <select
                  value={targetRegion}
                  onChange={(e) => setTargetRegion(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Uttar Pradesh">Uttar Pradesh (Critical Gap)</option>
                  <option value="Bihar">Bihar (Critical Gap)</option>
                  <option value="Odisha">Odisha (Critical Gap)</option>
                  <option value="Rajasthan">Rajasthan (High Gap)</option>
                  <option value="Delhi">Delhi (Moderate Gap)</option>
                  <option value="Karnataka">Karnataka (Benchmark)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                  Target Skill Area
                </label>
                <select
                  value={targetSkill}
                  onChange={(e) => setTargetSkill(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Python Programming">Python Programming</option>
                  <option value="SQL & Databases">SQL & Databases</option>
                  <option value="Data Quality & Governance">Data Quality & Governance</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Data Modeling">Data Modeling</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                Action / Program Type
              </label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="Accelerated Workshop">Accelerated 3-Day Technical Workshop</option>
                <option value="Mandatory Adaptive Assessment">Mandatory Diagnostic Re-assessment</option>
                <option value="Trainer Deployment">Senior Trainer Regional Deployment</option>
                <option value="Self-Paced Training Track">Designated Remedial Practice Module</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                Administrative Notes & Goals
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: 10 }}>
              <Send size={15} /> Dispatch Intervention Mandate
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Trainer Review Portal */}
      {activeTab === 'training-review' && (
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
            Trainer Portal: Practical Submissions & Curriculum Approval
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 14px' }}>Learner</th>
                  <th style={{ padding: '10px 14px' }}>Module Title</th>
                  <th style={{ padding: '10px 14px' }}>Current Step</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                  <th style={{ padding: '10px 14px' }}>Score Gain</th>
                </tr>
              </thead>
              <tbody>
                {trainingReview?.recentAttempts?.map((att, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#fff' }}>{att.learner_name}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{att.module_title}</td>
                    <td style={{ padding: '12px 14px' }}>Step {att.current_step} of 4</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className={`badge ${att.status === 'completed' ? 'badge-green' : 'badge-yellow'}`}>
                        {att.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#34d399' }}>
                      +{att.score_gain || 12} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
            National Platform Security & Action Audit Trail
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 500, overflowY: 'auto' }}>
            {auditLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: 12,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 12
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, color: '#60a5fa' }}>[{log.action}]</span>{' '}
                  <span style={{ color: 'var(--text-primary)' }}>{log.details || 'System event'}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>by {log.user_name || log.user_id || 'System'}</span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                  {log.created_at}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
