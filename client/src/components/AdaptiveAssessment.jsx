import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Clock, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  AlertCircle,
  TrendingUp,
  Cpu
} from 'lucide-react';

export default function AdaptiveAssessment({ currentUser, onNavigate }) {
  const [assessmentsList, setAssessmentsList] = useState([]);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Load available assessments
  useEffect(() => {
    fetch('/api/assessments')
      .then(r => r.json())
      .then(data => {
        setAssessmentsList(Array.isArray(data) ? data : []);
        if (data && data.length > 0) {
          setActiveAssessment(data[0]);
        }
      })
      .catch(err => console.error('Failed to load assessments:', err));
  }, []);

  // Timer tick
  useEffect(() => {
    let interval = null;
    if (attemptId && !testResult) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [attemptId, testResult]);

  // Start Assessment Attempt
  const handleStartTest = (assessment) => {
    setActiveAssessment(assessment);
    setTestResult(null);
    setTimerSeconds(0);
    setQuestionIndex(1);
    setSelectedOption(null);

    fetch('/api/assessments/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser?.id || 'user-ananya',
        assessmentId: assessment.id
      })
    })
      .then(r => r.json())
      .then(data => {
        setAttemptId(data.attemptId);
        setCurrentQuestion(data.question);
      })
      .catch(err => console.error('Start assessment error:', err));
  };

  // Submit Answer & Fetch Next Question
  const handleAnswerSubmit = () => {
    if (!selectedOption || !currentQuestion) return;
    setIsSubmitting(true);

    fetch('/api/assessments/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attemptId,
        questionId: currentQuestion.id,
        answer: selectedOption,
        timeSpent: timerSeconds
      })
    })
      .then(r => r.json())
      .then(data => {
        setIsSubmitting(false);
        setSelectedOption(null);

        if (data.isCompleted || questionIndex >= totalQuestions || !data.nextQuestion) {
          // Finish assessment
          handleCompleteAssessment();
        } else {
          setQuestionIndex(i => i + 1);
          setCurrentQuestion(data.nextQuestion);
        }
      })
      .catch(err => {
        console.error('Answer error:', err);
        setIsSubmitting(false);
      });
  };

  // Complete Assessment & Generate Diagnostics
  const handleCompleteAssessment = () => {
    fetch('/api/assessments/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attemptId,
        totalTimeSeconds: timerSeconds
      })
    })
      .then(r => r.json())
      .then(result => {
        setTestResult(result);
      })
      .catch(err => console.error('Complete error:', err));
  };

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const getDifficultyBadge = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy': return <span className="badge badge-green">Difficulty: Easy</span>;
      case 'medium': return <span className="badge badge-yellow">Difficulty: Medium</span>;
      case 'hard': return <span className="badge badge-red">Difficulty: Hard</span>;
      case 'expert': return <span className="badge badge-purple">Difficulty: Expert</span>;
      default: return <span className="badge badge-blue">Adaptive</span>;
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(139, 92, 246, 0.15))',
        border: '1px solid rgba(59, 130, 246, 0.3)',
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
            background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)'
          }}>
            <Award size={28} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>
                Adaptive Assessment Engine
              </h1>
              <span className="badge badge-blue">Dynamic Difficulty</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Item Response Theory (IRT) diagnostic calibration that adjusts test hardness per answer and recalculates your Competency Twin.
            </p>
          </div>
        </div>

        {attemptId && !testResult && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'var(--bg-surface-elevated)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <Clock size={16} color="#60a5fa" />
            <span style={{ fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff' }}>
              {formatTimer(timerSeconds)}
            </span>
          </div>
        )}
      </div>

      {/* State 1: Assessment Selection (if no test running and no result) */}
      {!attemptId && !testResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Select Assessment Track</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
            {assessmentsList.map((test) => (
              <div key={test.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 18 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <span className="badge badge-teal">{test.skill_area}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Adaptive (5-10 Qs)</span>
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                    {test.title}
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {test.description || 'Evaluates foundational to advanced competencies with real-time dynamic difficulty progression.'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Est. 10 mins</span>
                  <button
                    onClick={() => handleStartTest(test)}
                    className="btn-primary"
                  >
                    Start Adaptive Test <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* State 2: Active Test Question Card */}
      {attemptId && !testResult && !currentQuestion && (
        <div className="card" style={{ padding: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 40, border: '3px solid rgba(59, 130, 246, 0.3)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Preparing Adaptive Diagnostic...</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Calibrating difficulty parameters and pulling initial diagnostic question.</p>
          <button 
            onClick={() => { setAttemptId(null); setCurrentQuestion(null); }}
            className="btn-secondary"
            style={{ marginTop: 12 }}
          >
            Cancel & Return to Track Selection
          </button>
        </div>
      )}

      {attemptId && !testResult && currentQuestion && (
        <div className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Question Metadata Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                Question {questionIndex} of {totalQuestions}
              </span>
              {getDifficultyBadge(currentQuestion.difficulty)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Skill Domain: <strong style={{ color: '#60a5fa' }}>{currentQuestion.skill_tag || activeAssessment?.skill_area}</strong>
            </div>
          </div>

          {/* Question Prompt */}
          <div style={{ fontSize: 17, fontWeight: 600, color: '#fff', lineHeight: 1.6 }}>
            {currentQuestion.question_text}
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {currentQuestion.options?.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const optionLetter = String.fromCharCode(65 + idx);
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(opt)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'rgba(37, 99, 235, 0.18)' : 'var(--bg-surface-elevated)',
                    border: isSelected ? '2px solid #3b82f6' : '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: isSelected ? '#2563eb' : 'rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#fff',
                    flexShrink: 0
                  }}>
                    {optionLetter}
                  </div>
                  <span style={{ fontSize: 14, lineHeight: 1.4 }}>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Submit Action Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: 20 }}>
            <button
              onClick={handleAnswerSubmit}
              disabled={!selectedOption || isSubmitting}
              className="btn-primary"
              style={{
                opacity: (!selectedOption || isSubmitting) ? 0.5 : 1,
                padding: '10px 24px',
                fontSize: 14
              }}
            >
              {isSubmitting ? 'Calibrating...' : questionIndex >= totalQuestions ? 'Submit & View Results' : 'Submit & Next Question'}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* State 3: Test Completed Diagnostics & Distractor Analysis */}
      {testResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Result Score Banner */}
          <div className="card" style={{
            padding: 32,
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(37, 99, 235, 0.15))',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle2 size={24} color="#10b981" />
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>
                  Assessment Completed Successfully
                </h2>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
                Your responses have been processed through the diagnostic engine. Your Competency Twin score was updated to <strong style={{ color: '#34d399' }}>{testResult.updatedScore || Math.round(testResult.score)}%</strong>.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#34d399' }}>
                  {Math.round(testResult.score)}%
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Score ({testResult.correctCount}/{testResult.totalQuestions} Correct)
                </div>
              </div>

              <button
                onClick={() => onNavigate('competency')}
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)' }}
              >
                <Cpu size={16} /> View Updated Twin
              </button>
            </div>
          </div>

          {/* Granular Question Distractor Analysis */}
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>
              Diagnostic Distractor & Question Analysis
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Review your answers, correct reasoning, and pedagogical analysis of misconceptions:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {testResult.breakdown?.map((item, idx) => (
                <div key={idx} style={{
                  padding: 18,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: item.isCorrect ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {item.isCorrect ? (
                        <CheckCircle2 size={18} color="#10b981" />
                      ) : (
                        <XCircle size={18} color="#ef4444" />
                      )}
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        Q{idx + 1}: {item.questionText}
                      </span>
                    </div>
                    {getDifficultyBadge(item.difficulty)}
                  </div>

                  <div style={{ fontSize: 13, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Your Answer: </span>
                      <strong style={{ color: item.isCorrect ? '#34d399' : '#f87171' }}>{item.userAnswer}</strong>
                    </div>
                    {!item.isCorrect && (
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Correct Answer: </span>
                        <strong style={{ color: '#34d399' }}>{item.correctAnswer}</strong>
                      </div>
                    )}
                  </div>

                  {item.explanation && (
                    <div style={{
                      marginTop: 12,
                      padding: 12,
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(59, 130, 246, 0.08)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      fontSize: 12,
                      color: 'var(--text-secondary)'
                    }}>
                      <strong style={{ color: '#60a5fa' }}>Pedagogical Explanation: </strong>
                      {item.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={() => {
                  setAttemptId(null);
                  setTestResult(null);
                }}
                className="btn-secondary"
              >
                <RotateCcw size={14} /> Back to Assessments List
              </button>
              <button
                onClick={() => onNavigate('training')}
                className="btn-primary"
              >
                Practice in Training Mode <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
