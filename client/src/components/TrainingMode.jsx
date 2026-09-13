import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  CheckCircle2, 
  Play, 
  Lightbulb, 
  ArrowRight, 
  RotateCcw, 
  Code2, 
  BookOpen, 
  HelpCircle,
  Cpu,
  Sparkles
} from 'lucide-react';

export default function TrainingMode({ currentUser, onNavigate }) {
  const [modules, setModules] = useState([]);
  const [activeModule, setActiveModule] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [userCode, setUserCode] = useState('');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [testResults, setTestResults] = useState(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [completionResult, setCompletionResult] = useState(null);

  useEffect(() => {
    fetch('/api/training')
      .then(r => r.json())
      .then(data => {
        setModules(Array.isArray(data) ? data : []);
        if (data && data.length > 0) {
          handleSelectModule(data[0].id);
        }
      })
      .catch(err => console.error('Failed to load training modules:', err));
  }, []);

  const handleSelectModule = (moduleId) => {
    fetch(`/api/training/${moduleId}`)
      .then(r => r.json())
      .then(mod => {
        setActiveModule(mod);
        setUserCode(mod.exercise_template || '');
        setTestResults(null);
        setCompletionResult(null);

        // Start or resume attempt in backend
        fetch('/api/training/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser?.id || 'user-ananya',
            moduleId: mod.id
          })
        })
          .then(r => r.json())
          .then(att => {
            setAttemptId(att.attemptId);
            setCurrentStep(att.currentStep || 1);
            setHintsUsed(att.hintsUsed || 0);
            if (att.userCode) setUserCode(att.userCode);
          });
      })
      .catch(err => console.error('Error fetching module:', err));
  };

  // Run Test Cases
  const handleRunTests = () => {
    if (!activeModule || !attemptId) return;
    setIsRunningTests(true);

    fetch('/api/training/run-tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attemptId,
        moduleId: activeModule.id,
        userCode,
        step: currentStep
      })
    })
      .then(r => r.json())
      .then(res => {
        setIsRunningTests(false);
        setTestResults(res);
      })
      .catch(err => {
        console.error('Run tests error:', err);
        setIsRunningTests(false);
      });
  };

  // Complete Module & Gain Competency Points
  const handleCompleteModule = () => {
    if (!activeModule || !attemptId) return;

    fetch('/api/training/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attemptId,
        moduleId: activeModule.id,
        userCode,
        hintsUsed
      })
    })
      .then(r => r.json())
      .then(res => {
        setCompletionResult(res);
      })
      .catch(err => console.error('Submit module error:', err));
  };

  const steps = [
    { num: 1, title: 'Core Lesson' },
    { num: 2, title: 'Worked Example' },
    { num: 3, title: 'Interactive Task' },
    { num: 4, title: 'Test Runner' },
  ];

  return (
    <div className="container-responsive" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Banner */}
      <div className="responsive-hero" style={{
        background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.15), rgba(37, 99, 235, 0.15))',
        border: '1px solid rgba(234, 88, 12, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #ea580c, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(234, 88, 12, 0.4)'
          }}>
            <Zap size={28} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>
                Practical Training Mode
              </h1>
              <span className="badge" style={{ background: 'rgba(234, 88, 12, 0.2)', color: '#fb923c', border: '1px solid rgba(234, 88, 12, 0.4)' }}>
                Hands-On Code Sandbox
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Active skill remediation with guided lessons, test case validation, and direct Competency Twin score gains.
            </p>
          </div>
        </div>

        {/* Module Switcher Dropdown */}
        <div className="responsive-hero-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Training Track:</span>
          <select
            value={activeModule?.id || ''}
            onChange={(e) => handleSelectModule(e.target.value)}
            style={{
              padding: '8px 14px',
              fontSize: 12,
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)'
            }}
          >
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title} ({m.skill_area})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Step Tracker Bar */}
      <div className="card" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, overflowX: 'auto' }}>
          {steps.map((s) => {
            const isActive = currentStep === s.num;
            const isDone = currentStep > s.num;
            return (
              <button
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#fff' : isDone ? '#34d399' : 'var(--text-muted)'
                }}
              >
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: isActive ? '#ea580c' : isDone ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  color: isDone ? '#34d399' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700
                }}>
                  {isDone ? '✓' : s.num}
                </div>
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Target Gain: <strong style={{ color: '#34d399' }}>+12 Competency Pts</strong>
        </div>
      </div>

      {/* Completion Banner State */}
      {completionResult && (
        <div className="card" style={{
          padding: 28,
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(37, 99, 235, 0.15))',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={24} color="#10b981" />
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>
                Training Module Completed!
              </h2>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Your tests verified 100% pass rate. Competency score updated with <strong style={{ color: '#34d399' }}>+{completionResult.scoreGain || 12} points</strong>.
            </p>
          </div>

          <button
            onClick={() => onNavigate('competency')}
            className="btn-primary"
            style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)' }}
          >
            <Cpu size={16} /> View Updated Twin
          </button>
        </div>
      )}

      {/* Main Workspace based on Current Step */}
      <div className="responsive-grid-training">
        {/* Left Column: Lesson / Example / Prompt */}
        <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {currentStep === 1 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={20} color="#ea580c" />
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Structured Lesson Content</h3>
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {activeModule?.lesson_content || 'Comprehensive explanation of core patterns and syntax for this competency domain.'}
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setCurrentStep(2)} className="btn-primary">
                  Go to Worked Example <ArrowRight size={15} />
                </button>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Code2 size={20} color="#60a5fa" />
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Worked Practical Example</h3>
              </div>
              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                padding: 16,
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                color: '#93c5fd',
                lineHeight: 1.6,
                overflowX: 'auto',
                whiteSpace: 'pre-wrap'
              }}>
                {activeModule?.worked_example || '// Standard reference implementation\nSELECT department_id, employee_name, salary,\n       RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as rank\nFROM employees;'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
                <button onClick={() => setCurrentStep(1)} className="btn-secondary">
                  Previous Lesson
                </button>
                <button onClick={() => setCurrentStep(3)} className="btn-primary">
                  Start Practical Task <ArrowRight size={15} />
                </button>
              </div>
            </>
          )}

          {(currentStep === 3 || currentStep === 4) && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={20} color="#ea580c" />
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Task Specification</h3>
              </div>
              <div style={{ fontSize: 14, color: '#fff', lineHeight: 1.6 }}>
                {activeModule?.exercise_prompt}
              </div>

              {/* Multi-Level Hints Accordion */}
              {activeModule?.hints && activeModule.hints.length > 0 && (
                <div style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Lightbulb size={14} /> Guided Hints System
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {hintsUsed} of {activeModule.hints.length} revealed
                    </span>
                  </div>

                  {activeModule.hints.slice(0, hintsUsed).map((hint, i) => (
                    <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', borderLeft: '2px solid #f59e0b', paddingLeft: 8 }}>
                      <strong>Hint {i + 1}:</strong> {hint}
                    </div>
                  ))}

                  {hintsUsed < activeModule.hints.length && (
                    <button
                      onClick={() => setHintsUsed(h => h + 1)}
                      style={{
                        alignSelf: 'flex-start',
                        fontSize: 11,
                        color: '#fbbf24',
                        background: 'rgba(245, 158, 11, 0.1)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600
                      }}
                    >
                      + Reveal Hint {hintsUsed + 1}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column: Code Editor & Test Case Runner */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
              Interactive Code Sandbox
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {activeModule?.skill_area}
            </span>
          </div>

          <textarea
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            rows={14}
            spellCheck={false}
            style={{
              width: '100%',
              background: '#070b12',
              color: '#e2e8f0',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              lineHeight: 1.6,
              padding: 16,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              resize: 'vertical'
            }}
          />

          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setUserCode(activeModule?.exercise_template || '')}
              className="btn-secondary"
              style={{ fontSize: 12 }}
            >
              <RotateCcw size={13} /> Reset Template
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleRunTests}
                disabled={isRunningTests}
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', fontSize: 13 }}
              >
                <Play size={14} /> {isRunningTests ? 'Running Checks...' : 'Run Test Cases'}
              </button>

              {testResults?.passed && (
                <button
                  onClick={handleCompleteModule}
                  className="btn-primary"
                  style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)', fontSize: 13 }}
                >
                  <CheckCircle2 size={14} /> Submit & Claim Points
                </button>
              )}
            </div>
          </div>

          {/* Test Case Execution Output */}
          {testResults && (
            <div style={{
              background: testResults.passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: testResults.passed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: 16,
              fontSize: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span style={{ color: testResults.passed ? '#34d399' : '#f87171' }}>
                  {testResults.passed ? '✓ All Test Assertions Passed!' : '⚠ Test Failures Detected'}
                </span>
                <span>{testResults.passedCount || 1} of {testResults.totalTests || 1} Tests Passed</span>
              </div>
              <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {testResults.message || (testResults.passed ? 'Code successfully met all requirements and performance checks.' : 'Review error diagnostics and ensure all expected clauses are included.')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
