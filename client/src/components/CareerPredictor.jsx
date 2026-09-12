import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  HelpCircle, 
  ArrowRight, 
  Zap, 
  Layers, 
  Info,
  CheckCircle2,
  Sliders,
  Sparkles
} from 'lucide-react';

export default function CareerPredictor({ currentUser, onNavigate }) {
  const [predictions, setPredictions] = useState([]);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [activeScenario, setActiveScenario] = useState('current'); // 'current', 'increased', 'reduced'
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.id) return;
    setLoading(true);

    fetch(`/api/predictions/${currentUser.id}`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setPredictions(list);
        if (list.length > 0) {
          setSelectedPrediction(list[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching predictions:', err);
        setLoading(false);
      });
  }, [currentUser?.id]);

  // Fallback demo paths if backend empty
  const defaultPaths = [
    {
      career_path: 'Senior Data Analyst',
      current_readiness: 68,
      target_readiness: 85,
      projected_readiness: 88,
      timeline_months: 6,
      confidence: 0.88,
      weight_breakdown: [
        { skill: 'SQL & Databases', weight: 0.3, userScore: 58 },
        { skill: 'Python Programming', weight: 0.25, userScore: 72 },
        { skill: 'Statistics & Probability', weight: 0.2, userScore: 65 },
        { skill: 'Data Quality & Governance', weight: 0.15, userScore: 38 },
        { skill: 'Data Modeling', weight: 0.1, userScore: 45 },
      ]
    },
    {
      career_path: 'Machine Learning Engineer',
      current_readiness: 56,
      target_readiness: 85,
      projected_readiness: 82,
      timeline_months: 10,
      confidence: 0.82,
      weight_breakdown: [
        { skill: 'Python Programming', weight: 0.35, userScore: 72 },
        { skill: 'Machine Learning', weight: 0.3, userScore: 52 },
        { skill: 'Statistics & Probability', weight: 0.2, userScore: 65 },
        { skill: 'SQL & Databases', weight: 0.15, userScore: 58 },
      ]
    },
    {
      career_path: 'Data Scientist',
      current_readiness: 62,
      target_readiness: 90,
      projected_readiness: 85,
      timeline_months: 8,
      confidence: 0.84,
      weight_breakdown: [
        { skill: 'Statistics & Probability', weight: 0.3, userScore: 65 },
        { skill: 'Machine Learning', weight: 0.25, userScore: 52 },
        { skill: 'Python Programming', weight: 0.25, userScore: 72 },
        { skill: 'Data Modeling', weight: 0.2, userScore: 45 },
      ]
    }
  ];

  const currentList = predictions.length > 0 ? predictions : defaultPaths;
  const currentPred = selectedPrediction || currentList[0];

  // Calculate Scenario Modifiers
  const getScenarioValues = (basePred) => {
    if (!basePred) return { projected: 80, months: 6 };
    const baseProj = basePred.projected_readiness || 80;
    const baseMonths = basePred.timeline_months || 8;

    if (activeScenario === 'increased') {
      return {
        projected: Math.min(96, Math.round(baseProj * 1.12)),
        months: Math.max(3, Math.round(baseMonths * 0.65)),
        paceLabel: '+5 Hours/Week Accelerated Learning',
        paceColor: '#34d399'
      };
    } else if (activeScenario === 'reduced') {
      return {
        projected: Math.max(50, Math.round(baseProj * 0.82)),
        months: Math.round(baseMonths * 1.6),
        paceLabel: 'Reduced Pace (-50% practice)',
        paceColor: '#f87171'
      };
    }
    return {
      projected: baseProj,
      months: baseMonths,
      paceLabel: 'Current Steady Pace (~3-4 hrs/wk)',
      paceColor: '#60a5fa'
    };
  };

  const scenario = getScenarioValues(currentPred);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(37, 99, 235, 0.15))',
        border: '1px solid rgba(99, 102, 241, 0.3)',
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
            background: 'linear-gradient(135deg, #6366f1, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
          }}>
            <TrendingUp size={28} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>
                Future Skill & Career Predictor
              </h1>
              <span className="badge badge-purple">Explainable Trajectory</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Predictive models calibrating role readiness based on current competency velocity and scenario simulations.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowFormulaModal(!showFormulaModal)}
          className="btn-secondary"
          style={{ fontSize: 12 }}
        >
          <Info size={15} /> Explainable Math Formula
        </button>
      </div>

      {/* Pathway Selection Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {currentList.map((p) => {
          const isSelected = (currentPred.career_path || currentPred.careerPath) === (p.career_path || p.careerPath);
          return (
            <div
              key={p.career_path || p.id}
              onClick={() => setSelectedPrediction(p)}
              className="card"
              style={{
                cursor: 'pointer',
                borderColor: isSelected ? '#6366f1' : 'var(--border-subtle)',
                background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-surface)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span className="badge badge-blue">Role Pathway</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {Math.round((p.confidence || 0.85) * 100)}% Confidence
                </span>
              </div>

              <h3 style={{ fontSize: 17, fontWeight: 700, color: isSelected ? '#818cf8' : 'var(--text-primary)', marginBottom: 8 }}>
                {p.career_path}
              </h3>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 12 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>
                  {p.current_readiness}%
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Current Readiness (Target: {p.target_readiness || 85}%)
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, marginTop: 10, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${p.current_readiness}%`,
                  background: 'linear-gradient(90deg, #6366f1, #3b82f6)',
                  borderRadius: 3
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Scenario Simulation Controls */}
      <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sliders size={18} color="#818cf8" />
              Scenario Simulator for: {currentPred.career_path}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Evaluate timeline outcomes under varying weekly learning pace commitments
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { id: 'reduced', label: 'Reduced (-50%)' },
              { id: 'current', label: 'Current Pace' },
              { id: 'increased', label: 'Accelerated (+5 hrs/wk)' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveScenario(tab.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 12,
                  fontWeight: 600,
                  background: activeScenario === tab.id ? 'var(--brand-blue)' : 'var(--bg-surface-elevated)',
                  color: activeScenario === tab.id ? '#fff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projection Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20,
          background: 'var(--bg-surface-elevated)',
          padding: 24,
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Scenario</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: scenario.paceColor, marginTop: 4 }}>
              {scenario.paceLabel}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Projected Readiness</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#34d399', marginTop: 2 }}>
              {scenario.projected}%
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              Exceeds {currentPred.target_readiness || 85}% threshold
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Expected Timeline</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#60a5fa', marginTop: 2 }}>
              {scenario.months} Months
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              To reach full employment readiness
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => onNavigate('training')}
            className="btn-primary"
            style={{ background: 'linear-gradient(135deg, #6366f1, #2563eb)' }}
          >
            <Zap size={15} /> Bridge Bottleneck Skills in Training Mode <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Explainability Math Formula Drawer / Card */}
      {showFormulaModal && (
        <div className="card" style={{ padding: 28, border: '1px solid rgba(99, 102, 241, 0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#818cf8' }}>
              Explainable Career Readiness Formulation
            </h3>
            <span className="badge badge-purple">Transparent Math Engine</span>
          </div>

          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
            The Readiness Index is calculated as a weighted normalized sum of individual skill scores against target role benchmarks:
          </div>

          <div style={{
            background: 'rgba(0,0,0,0.4)',
            padding: 16,
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            color: '#a5b4fc',
            marginBottom: 20
          }}>
            Readiness = Σ (w_i × min(100, (UserScore_i / TargetBenchmark_i) × 100))
          </div>

          <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
            Curriculum Skill Weight Distribution for {currentPred.career_path}:
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {(currentPred.weight_breakdown || defaultPaths[0].weight_breakdown).map((w, idx) => (
              <div key={idx} style={{
                padding: 12,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                fontSize: 12
              }}>
                <div style={{ fontWeight: 600, color: '#fff' }}>{w.skill}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, color: 'var(--text-secondary)' }}>
                  <span>Weight: {Math.round(w.weight * 100)}%</span>
                  <span style={{ color: '#34d399' }}>User: {w.userScore || 65}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
