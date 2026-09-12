import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Filter, 
  Layers, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Info,
  CheckCircle2,
  PieChart
} from 'lucide-react';

export default function GeoHeatMap() {
  // Canonical SVG coordinates for state nodes
  const baseMapCoordinates = {
    'DL': { x: 230, y: 155, name: 'Delhi' },
    'KA': { x: 200, y: 360, name: 'Karnataka' },
    'MH': { x: 190, y: 260, name: 'Maharashtra' },
    'TN': { x: 220, y: 410, name: 'Tamil Nadu' },
    'TS': { x: 230, y: 300, name: 'Telangana' },
    'UP': { x: 270, y: 175, name: 'Uttar Pradesh' },
    'BR': { x: 330, y: 195, name: 'Bihar' },
    'WB': { x: 350, y: 235, name: 'West Bengal' },
    'RJ': { x: 160, y: 180, name: 'Rajasthan' },
    'MP': { x: 225, y: 220, name: 'Madhya Pradesh' },
    'GJ': { x: 130, y: 230, name: 'Gujarat' },
    'KL': { x: 190, y: 440, name: 'Kerala' },
    'AP': { x: 240, y: 345, name: 'Andhra Pradesh' },
    'OD': { x: 315, y: 260, name: 'Odisha' },
    'PB': { x: 200, y: 120, name: 'Punjab' },
    'AS': { x: 420, y: 175, name: 'Assam' }
  };

  const defaultRegions = [
    { code: 'DL', name: 'Delhi', x: 230, y: 155, comp: 72, gap: 'moderate', learners: 4200, rate: 12.4, quadrant: 'Healthy' },
    { code: 'KA', name: 'Karnataka', x: 200, y: 360, comp: 78, gap: 'low', learners: 8900, rate: 15.2, quadrant: 'Healthy' },
    { code: 'MH', name: 'Maharashtra', x: 190, y: 260, comp: 74, gap: 'moderate', learners: 7600, rate: 14.1, quadrant: 'Healthy' },
    { code: 'TN', name: 'Tamil Nadu', x: 220, y: 410, comp: 71, gap: 'moderate', learners: 6100, rate: 11.8, quadrant: 'Healthy' },
    { code: 'TS', name: 'Telangana', x: 230, y: 300, comp: 69, gap: 'moderate', learners: 5200, rate: 13.5, quadrant: 'Improving' },
    { code: 'UP', name: 'Uttar Pradesh', x: 270, y: 175, comp: 52, gap: 'critical', learners: 12400, rate: 8.2, quadrant: 'Critical' },
    { code: 'BR', name: 'Bihar', x: 330, y: 195, comp: 48, gap: 'critical', learners: 9800, rate: 6.9, quadrant: 'Critical' },
    { code: 'WB', name: 'West Bengal', x: 350, y: 235, comp: 59, gap: 'high', learners: 5900, rate: 9.4, quadrant: 'Improving' },
    { code: 'RJ', name: 'Rajasthan', x: 160, y: 180, comp: 54, gap: 'high', learners: 4800, rate: 7.8, quadrant: 'Critical' },
    { code: 'MP', name: 'Madhya Pradesh', x: 225, y: 220, comp: 56, gap: 'high', learners: 6300, rate: 8.9, quadrant: 'Improving' },
    { code: 'GJ', name: 'Gujarat', x: 130, y: 230, comp: 67, gap: 'moderate', learners: 5100, rate: 10.5, quadrant: 'Monitoring' },
    { code: 'KL', name: 'Kerala', x: 190, y: 440, comp: 76, gap: 'low', learners: 3400, rate: 13.9, quadrant: 'Healthy' },
    { code: 'AP', name: 'Andhra Pradesh', x: 240, y: 345, comp: 63, gap: 'moderate', learners: 4900, rate: 11.2, quadrant: 'Improving' },
    { code: 'OD', name: 'Odisha', x: 315, y: 260, comp: 53, gap: 'critical', learners: 4100, rate: 7.5, quadrant: 'Critical' },
    { code: 'PB', name: 'Punjab', x: 200, y: 120, comp: 65, gap: 'moderate', learners: 3200, rate: 10.1, quadrant: 'Monitoring' },
    { code: 'AS', name: 'Assam', x: 420, y: 175, comp: 51, gap: 'critical', learners: 2800, rate: 7.1, quadrant: 'Critical' },
  ];

  const normalizeStateRecord = (raw) => {
    const code = raw.code || raw.state_code || 'DL';
    const name = raw.name || raw.state_name || baseMapCoordinates[code]?.name || code;
    const comp = Math.round(Number(raw.comp ?? raw.avg_competency ?? 60));
    const learners = Math.round(Number(raw.learners ?? raw.learner_count ?? 3500));
    const rate = Number(raw.rate ?? raw.improvement_rate ?? 10.0);
    const quadrant = raw.quadrant || (comp >= 70 ? 'Healthy' : comp >= 60 ? 'Monitoring' : comp >= 52 ? 'Improving' : 'Critical');
    const coord = baseMapCoordinates[code] || { x: 240, y: 240 };
    return {
      code,
      name,
      comp,
      learners,
      rate,
      quadrant,
      x: raw.x || coord.x,
      y: raw.y || coord.y,
      gap: raw.gap || raw.gap_severity || (comp >= 70 ? 'low' : comp >= 60 ? 'moderate' : 'critical')
    };
  };

  const [stateRegions, setStateRegions] = useState(defaultRegions);
  const [selectedState, setSelectedState] = useState(defaultRegions[0]);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'quadrant'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/geo')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const normalized = data.map(normalizeStateRecord);
          // Merge with default SVG coords to ensure full map coverage
          const codeMap = new Map();
          defaultRegions.forEach(d => codeMap.set(d.code, d));
          normalized.forEach(n => {
            const existing = codeMap.get(n.code);
            codeMap.set(n.code, { ...existing, ...n });
          });
          const merged = Array.from(codeMap.values());
          setStateRegions(merged);
          setSelectedState(merged[0]);
        }
      })
      .catch(err => {
        console.warn('Using default geo telemetry:', err);
      });
  }, []);

  const getColor = (comp) => {
    const c = Number(comp) || 0;
    if (c >= 72) return '#10b981'; // Green (Healthy)
    if (c >= 60) return '#f59e0b'; // Yellow (Moderate)
    if (c >= 52) return '#ea580c'; // Orange (High gap)
    return '#ef4444'; // Red (Critical gap)
  };

  const activeState = selectedState || stateRegions[0] || defaultRegions[0];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.15), rgba(37, 99, 235, 0.15))',
        border: '1px solid rgba(13, 148, 136, 0.3)',
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
            background: 'linear-gradient(135deg, #0d9488, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(13, 148, 136, 0.4)'
          }}>
            <MapPin size={28} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>
                Geographical Skill-Gap Heat Map
              </h1>
              <span className="badge badge-teal">National India Telemetry</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Regional intelligence mapping competency benchmarks, critical intervention zones, and learning velocity across states.
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setViewMode('map')}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: 12,
              fontWeight: 600,
              background: viewMode === 'map' ? 'var(--brand-blue)' : 'var(--bg-surface-elevated)',
              color: viewMode === 'map' ? '#fff' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            🗺️ SVG Regional Map
          </button>
          <button
            onClick={() => setViewMode('quadrant')}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: 12,
              fontWeight: 600,
              background: viewMode === 'quadrant' ? 'var(--brand-blue)' : 'var(--bg-surface-elevated)',
              color: viewMode === 'quadrant' ? '#fff' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            📊 Quadrant Analysis
          </button>
        </div>
      </div>

      {/* Verification Notice */}
      <div style={{
        padding: '12px 18px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(59, 130, 246, 0.08)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        fontSize: 12,
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }}>
        <Info size={16} color="#60a5fa" />
        <span>
          <strong>Aggregated Regional Data (Demo/Sample Verification Layer):</strong> Synchronized with national public sector training records. Hover over any state node to inspect regional cohorts.
        </span>
      </div>

      {/* Main Map or Quadrant View */}
      {viewMode === 'map' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
          {/* SVG Map Canvas */}
          <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>India Competency Distribution</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Click on state nodes to view demographic metrics</p>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: 10, fontSize: 11 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#34d399' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span> &gt;70%
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fbbf24' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }}></span> 60-70%
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fb923c' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ea580c' }}></span> 52-60%
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f87171' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></span> &lt;52% Critical
                </span>
              </div>
            </div>

            {/* High-Fidelity SVG Interactive Map */}
            <div style={{ width: '100%', height: 480, position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <svg width="480" height="480" viewBox="0 0 500 500">
                {/* Outlined Geographic Silhouette Grid */}
                <path
                  d="M 180 80 L 250 80 L 270 120 L 320 160 L 450 160 L 460 210 L 380 230 L 330 280 L 260 380 L 220 470 L 190 450 L 170 330 L 120 250 L 140 180 Z"
                  fill="rgba(255, 255, 255, 0.02)"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />

                {/* State Node Circles */}
                {stateRegions.map((state) => {
                  const isSelected = activeState.code === state.code;
                  const color = getColor(state.comp);
                  return (
                    <g key={state.code} onClick={() => setSelectedState(state)} style={{ cursor: 'pointer' }}>
                      {/* Pulse ring for selected */}
                      {isSelected && (
                        <circle
                          cx={state.x}
                          cy={state.y}
                          r={22}
                          fill="none"
                          stroke={color}
                          strokeWidth="2"
                          opacity="0.4"
                          className="pulsing-dot"
                        />
                      )}
                      <circle
                        cx={state.x}
                        cy={state.y}
                        r={isSelected ? 16 : 12}
                        fill={color}
                        stroke="#fff"
                        strokeWidth={isSelected ? 2.5 : 1}
                        opacity="0.9"
                      />
                      <text
                        x={state.x}
                        y={state.y + 1}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#000"
                        fontSize={9}
                        fontWeight={800}
                      >
                        {state.code}
                      </text>
                      <text
                        x={state.x}
                        y={state.y + (isSelected ? 26 : 22)}
                        textAnchor="middle"
                        fill="var(--text-secondary)"
                        fontSize={10}
                        fontWeight={isSelected ? 700 : 500}
                      >
                        {state.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Right Column: Selected State Telemetry Card */}
          <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>
                  {activeState.name} ({activeState.code})
                </h3>
                <span className={`badge ${activeState.comp >= 70 ? 'badge-green' : activeState.comp >= 60 ? 'badge-yellow' : 'badge-red'}`} style={{ marginTop: 6 }}>
                  {activeState.quadrant} Status
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: getColor(activeState.comp) }}>
                  {activeState.comp}%
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Avg Competency</div>
              </div>
            </div>

            {/* Regional Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ padding: 14, background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={13} /> Active Learners
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: '#fff' }}>
                  {(activeState?.learners ?? 3500).toLocaleString()}
                </div>
              </div>

              <div style={{ padding: 14, background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TrendingUp size={13} /> Learning Velocity
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: '#34d399' }}>
                  +{activeState?.rate ?? 10.0}% / mo
                </div>
              </div>
            </div>

            {/* Intervention Recommendation */}
            <div style={{
              padding: 16,
              borderRadius: 'var(--radius-md)',
              background: (activeState?.comp ?? 60) < 55 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
              border: (activeState?.comp ?? 60) < 55 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: (activeState?.comp ?? 60) < 55 ? '#f87171' : '#60a5fa', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={15} /> Recommended Action
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {(activeState?.comp ?? 60) < 55 
                  ? `High critical gap detected in ${activeState?.name || 'region'}. Dispatch accelerated workshop on Python & SQL Fundamentals to bring cohort over 65% benchmark.`
                  : `Cohort in ${activeState?.name || 'region'} maintains healthy growth. Continue monitoring automated assessments and initiate advanced ML specialization.`}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Quadrant Analysis View */
        <div className="card" style={{ padding: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            Regional Skill Gap vs Learning Progress Quadrant
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
            Classifies states into 4 strategic categories for targeted governmental resource allocation. Click any state to view its demographic telemetry.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Q1: Critical Intervention */}
            <div style={{ padding: 20, borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, color: '#f87171' }}>1. Critical Intervention Zone</span>
                <span className="badge badge-red">High Gap / Low Growth</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {stateRegions.filter(s => s.quadrant === 'Critical').map(s => (
                  <button 
                    key={s.code} 
                    onClick={() => { setSelectedState(s); setViewMode('map'); }}
                    className="badge" 
                    style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fff', border: 'none', cursor: 'pointer', padding: '6px 10px' }}
                  >
                    {s.name} ({s.comp}%)
                  </button>
                ))}
              </div>
            </div>

            {/* Q2: Improving */}
            <div style={{ padding: 20, borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, color: '#fbbf24' }}>2. Rapidly Improving Zone</span>
                <span className="badge badge-yellow">High Gap / High Growth</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {stateRegions.filter(s => s.quadrant === 'Improving').map(s => (
                  <button 
                    key={s.code} 
                    onClick={() => { setSelectedState(s); setViewMode('map'); }}
                    className="badge" 
                    style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fff', border: 'none', cursor: 'pointer', padding: '6px 10px' }}
                  >
                    {s.name} ({s.comp}%)
                  </button>
                ))}
              </div>
            </div>

            {/* Q3: Monitoring */}
            <div style={{ padding: 20, borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, color: '#60a5fa' }}>3. Steady Monitoring</span>
                <span className="badge badge-blue">Low Gap / Moderate Growth</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {stateRegions.filter(s => s.quadrant === 'Monitoring').map(s => (
                  <button 
                    key={s.code} 
                    onClick={() => { setSelectedState(s); setViewMode('map'); }}
                    className="badge" 
                    style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#fff', border: 'none', cursor: 'pointer', padding: '6px 10px' }}
                  >
                    {s.name} ({s.comp}%)
                  </button>
                ))}
              </div>
            </div>

            {/* Q4: Healthy Benchmark */}
            <div style={{ padding: 20, borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, color: '#34d399' }}>4. Benchmark Leaders</span>
                <span className="badge badge-green">Low Gap / High Growth</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {stateRegions.filter(s => s.quadrant === 'Healthy').map(s => (
                  <button 
                    key={s.code} 
                    onClick={() => { setSelectedState(s); setViewMode('map'); }}
                    className="badge" 
                    style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#fff', border: 'none', cursor: 'pointer', padding: '6px 10px' }}
                  >
                    {s.name} ({s.comp}%)
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
