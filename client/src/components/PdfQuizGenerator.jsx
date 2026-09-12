import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  Clock, 
  ArrowRight, 
  RotateCcw, 
  Award, 
  FileCheck, 
  Layers, 
  AlertCircle,
  FileCode
} from 'lucide-react';
import { getTranslation } from '../utils/i18n';

export default function PdfQuizGenerator({ currentUser, onNavigate, currentLang }) {
  const t = getTranslation(currentLang);

  const [inputMode, setInputMode] = useState('upload'); // 'upload' or 'text'
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [docTitle, setDocTitle] = useState('National Data Competency Manual');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('adaptive');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Active Quiz State
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);

  // Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.pdf')) {
        setErrorMessage('Please upload a valid .pdf document');
        return;
      }
      setSelectedFile(file);
      setDocTitle(file.name.replace('.pdf', '').replace(/_/g, ' '));
      setErrorMessage('');
    }
  };

  // Generate Quiz Trigger
  const handleGenerateQuiz = async () => {
    setErrorMessage('');
    setIsGenerating(true);

    try {
      let res;
      if (inputMode === 'upload' && selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('userId', currentUser?.id || 'user-ananya');
        formData.append('numQuestions', numQuestions.toString());
        formData.append('difficulty', difficulty);

        res = await fetch('/api/pdf/upload-and-generate-quiz', {
          method: 'POST',
          body: formData
        });
      } else {
        // Text mode
        const textToProcess = pastedText.trim() || `The National Data Quality Benchmark mandates that all administrative datasets conform to five core dimensions: completeness, uniqueness, timeliness, validity, and consistency. Automated anomaly detection scripts must run prior to cross-departmental data exchanges, ensuring null-value ratios remain below 0.5% for primary key identifiers. Vectorized transformations are required for scalable pipeline performance.`;

        res = await fetch('/api/pdf/generate-quiz-from-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser?.id || 'user-ananya',
            title: docTitle || 'Custom Curriculum PDF',
            text: textToProcess,
            numQuestions: Number(numQuestions),
            difficulty
          })
        });
      }

      if (!res.ok) throw new Error('Failed to generate quiz from PDF');
      const data = await res.json();
      
      setGeneratedQuiz(data);
      setCurrentQIndex(0);
      setSelectedOption(null);
      setUserAnswers([]);
      setQuizFinished(false);
      setIsGenerating(false);
    } catch (err) {
      console.error(err);
      setErrorMessage('Could not process PDF. Please verify your document or use the text excerpt mode.');
      setIsGenerating(false);
    }
  };

  // Answer handling
  const handleAnswerSubmit = () => {
    if (!selectedOption || !generatedQuiz) return;

    const currentQ = generatedQuiz.questions[currentQIndex];
    const isCorrect = selectedOption === currentQ.correct_answer;

    const updatedAnswers = [
      ...userAnswers,
      {
        question: currentQ.question_text,
        userAnswer: selectedOption,
        correctAnswer: currentQ.correct_answer,
        isCorrect,
        explanation: currentQ.explanation,
        distractorAnalysis: currentQ.distractor_analysis
      }
    ];

    setUserAnswers(updatedAnswers);
    setSelectedOption(null);

    if (currentQIndex + 1 < generatedQuiz.questions.length) {
      setCurrentQIndex(i => i + 1);
    } else {
      // Finished all questions
      setQuizFinished(true);
      // Award competency gain
      fetch('/api/competency/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || 'user-ananya',
          skill: 'Data Quality & Governance',
          score: 68.0,
          evidenceSource: `PDF Quiz: ${generatedQuiz.title}`
        })
      }).catch(err => console.error(err));
    }
  };

  const getDifficultyBadge = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy': return <span className="badge badge-green">Easy</span>;
      case 'medium': return <span className="badge badge-yellow">Medium</span>;
      case 'hard': return <span className="badge badge-red">Hard</span>;
      default: return <span className="badge badge-blue">Adaptive</span>;
    }
  };

  const currentQ = generatedQuiz?.questions?.[currentQIndex];
  const scorePct = userAnswers.length > 0
    ? Math.round((userAnswers.filter(a => a.isCorrect).length / userAnswers.length) * 100)
    : 0;

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.15), rgba(139, 92, 246, 0.15))',
        border: '1px solid rgba(234, 88, 12, 0.3)',
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
            background: 'linear-gradient(135deg, #ea580c, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(234, 88, 12, 0.4)'
          }}>
            <FileText size={28} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>
                {t.pdfGenTitle}
              </h1>
              <span className="badge badge-orange">Python pypdf Engine</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              {t.pdfGenSubtitle}
            </p>
          </div>
        </div>

        {generatedQuiz && !quizFinished && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--bg-surface-elevated)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <Award size={16} color="#fb923c" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
              Q {currentQIndex + 1} of {generatedQuiz.questions.length}
            </span>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <AlertCircle size={16} />
          {errorMessage}
        </div>
      )}

      {/* Step 1: Upload / Input Interface */}
      {!generatedQuiz && (
        <div className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Input Mode Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12, gap: 16 }}>
            <button
              onClick={() => setInputMode('upload')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 14,
                fontWeight: 600,
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                background: inputMode === 'upload' ? 'rgba(234, 88, 12, 0.18)' : 'transparent',
                color: inputMode === 'upload' ? '#fb923c' : 'var(--text-secondary)',
                border: inputMode === 'upload' ? '1px solid rgba(234, 88, 12, 0.4)' : '1px solid transparent'
              }}
            >
              <Upload size={16} /> {t.uploadPdfTab}
            </button>
            <button
              onClick={() => setInputMode('text')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 14,
                fontWeight: 600,
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                background: inputMode === 'text' ? 'rgba(234, 88, 12, 0.18)' : 'transparent',
                color: inputMode === 'text' ? '#fb923c' : 'var(--text-secondary)',
                border: inputMode === 'text' ? '1px solid rgba(234, 88, 12, 0.4)' : '1px solid transparent'
              }}
            >
              <FileCode size={16} /> {t.pasteTextTab}
            </button>
          </div>

          {/* Mode 1: PDF Dropzone */}
          {inputMode === 'upload' ? (
            <div style={{
              border: '2px dashed rgba(255, 255, 255, 0.15)',
              borderRadius: 'var(--radius-lg)',
              padding: '40px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              background: 'rgba(255, 255, 255, 0.01)',
              cursor: 'pointer'
            }}>
              <Upload size={36} color="#fb923c" />
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
                  {selectedFile ? selectedFile.name : t.choosePdfFile}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {selectedFile
                    ? `${(selectedFile.size / 1024).toFixed(1)} KB • Ready for Python extraction`
                    : 'Drag and drop your PDF here or click to browse files'}
                </p>
              </div>

              <input
                type="file"
                accept=".pdf"
                id="pdf-input"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label
                htmlFor="pdf-input"
                className="btn-secondary"
                style={{ cursor: 'pointer', marginTop: 8 }}
              >
                Browse Document
              </label>
            </div>
          ) : (
            /* Mode 2: Paste Text */
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                Paste PDF Text Content or Guidelines:
              </label>
              <textarea
                rows={6}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste paragraph or excerpt from any PDF here (e.g. National Data Quality Benchmark rules, Python guidelines, or technical specifications)..."
                style={{
                  width: '100%',
                  padding: 14,
                  fontSize: 13,
                  lineHeight: 1.6,
                  borderRadius: 'var(--radius-md)',
                  resize: 'vertical'
                }}
              />
            </div>
          )}

          {/* Configuration Parameters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Document Title
              </label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                {t.numQuestionsLabel}
              </label>
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                style={{ width: '100%' }}
              >
                <option value={3}>3 Questions (Quick Check)</option>
                <option value={5}>5 Questions (Standard Diagnostic)</option>
                <option value={10}>10 Questions (Comprehensive Assessment)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                {t.difficultyLabel}
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="adaptive">Adaptive Progression (Recommended)</option>
                <option value="easy">Foundational (Easy)</option>
                <option value="medium">Intermediate (Medium)</option>
                <option value="hard">Advanced (Hard)</option>
              </select>
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: 20 }}>
            <button
              onClick={handleGenerateQuiz}
              disabled={isGenerating || (inputMode === 'upload' && !selectedFile)}
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg, #ea580c, #8b5cf6)',
                padding: '12px 28px',
                fontSize: 14,
                opacity: isGenerating || (inputMode === 'upload' && !selectedFile) ? 0.6 : 1
              }}
            >
              <Sparkles size={16} />
              {isGenerating ? t.generatingQuiz : t.generateQuizBtn}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Interactive Quiz Solving */}
      {generatedQuiz && !quizFinished && currentQ && (
        <div className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
                Question {currentQIndex + 1} of {generatedQuiz.questions.length}
              </span>
              {getDifficultyBadge(currentQ.difficulty)}
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Source: <strong style={{ color: '#fb923c' }}>{generatedQuiz.title}</strong>
            </span>
          </div>

          {/* Prompt */}
          <div style={{ fontSize: 17, fontWeight: 600, color: '#fff', lineHeight: 1.6 }}>
            {currentQ.question_text}
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {currentQ.options?.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const letter = String.fromCharCode(65 + idx);
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
                    background: isSelected ? 'rgba(234, 88, 12, 0.18)' : 'var(--bg-surface-elevated)',
                    border: isSelected ? '2px solid #ea580c' : '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: isSelected ? '#ea580c' : 'rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#fff',
                    flexShrink: 0
                  }}>
                    {letter}
                  </div>
                  <span style={{ fontSize: 14, lineHeight: 1.4 }}>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: 20 }}>
            <button
              onClick={handleAnswerSubmit}
              disabled={!selectedOption}
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg, #ea580c, #2563eb)',
                opacity: !selectedOption ? 0.5 : 1
              }}
            >
              {currentQIndex + 1 >= generatedQuiz.questions.length ? t.seeResults : t.submitAnswer}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Quiz Finished & Diagnostic Breakdown */}
      {quizFinished && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Result Banner */}
          <div className="card" style={{
            padding: 32,
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(234, 88, 12, 0.15))',
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
                  {t.scoreResult}
                </h2>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
                You completed the AI quiz extracted from <strong>{generatedQuiz.title}</strong>. Your competency score has been incremented by <strong style={{ color: '#34d399' }}>+15 points</strong>.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: scorePct >= 70 ? '#34d399' : '#fbbf24' }}>
                  {scorePct}%
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {userAnswers.filter(a => a.isCorrect).length} / {userAnswers.length} Correct
                </div>
              </div>

              <button
                onClick={() => onNavigate('competency')}
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)' }}
              >
                <Award size={16} /> View Digital Twin
              </button>
            </div>
          </div>

          {/* Granular Questions Review */}
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>
              PDF Concept Diagnostic & Explanations
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {userAnswers.map((ans, idx) => (
                <div key={idx} style={{
                  padding: 18,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: ans.isCorrect ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                      Q{idx + 1}: {ans.question}
                    </span>
                    <span className={`badge ${ans.isCorrect ? 'badge-green' : 'badge-red'}`}>
                      {ans.isCorrect ? 'Correct' : 'Needs Review'}
                    </span>
                  </div>

                  <div style={{ fontSize: 13, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Your Selection: </span>
                      <strong style={{ color: ans.isCorrect ? '#34d399' : '#f87171' }}>{ans.userAnswer}</strong>
                    </div>
                    {!ans.isCorrect && (
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Correct Answer: </span>
                        <strong style={{ color: '#34d399' }}>{ans.correctAnswer}</strong>
                      </div>
                    )}
                  </div>

                  {ans.explanation && (
                    <div style={{
                      marginTop: 12,
                      padding: 12,
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(59, 130, 246, 0.08)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      fontSize: 12,
                      color: 'var(--text-secondary)'
                    }}>
                      <strong style={{ color: '#60a5fa' }}>PDF Excerpt Explanation: </strong>
                      {ans.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setGeneratedQuiz(null);
                  setSelectedFile(null);
                  setUserAnswers([]);
                }}
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #ea580c, #2563eb)' }}
              >
                <RotateCcw size={15} /> Upload Another PDF Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
