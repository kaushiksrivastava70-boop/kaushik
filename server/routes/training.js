const express = require('express');
const { queryAll, queryOne, runSql } = require('../db');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// List training modules
router.get('/', (req, res) => {
  const modules = queryAll('SELECT id, title, skill_area, difficulty, description, estimated_minutes FROM training_modules ORDER BY title');
  res.json(modules);
});

// Get full training module
router.get('/:moduleId', (req, res) => {
  const mod = queryOne('SELECT * FROM training_modules WHERE id = ?', [req.params.moduleId]);
  if (!mod) return res.status(404).json({ error: 'Module not found' });
  res.json({
    ...mod,
    test_cases: JSON.parse(mod.test_cases || '[]'),
    hints: JSON.parse(mod.hints || '[]'),
  });
});

// Start or resume training attempt
router.post('/start', (req, res) => {
  const { userId, moduleId } = req.body;

  // Check for existing in-progress attempt
  const existing = queryOne(
    'SELECT * FROM training_attempts WHERE user_id = ? AND module_id = ? AND status = ?',
    [userId, moduleId, 'in_progress']
  );

  if (existing) {
    const mod = queryOne('SELECT * FROM training_modules WHERE id = ?', [moduleId]);
    return res.json({
      attemptId: existing.id,
      currentStep: existing.current_step,
      hintsUsed: existing.hints_used,
      userCode: existing.user_code,
      resumed: true,
      module: mod ? {
        ...mod,
        test_cases: JSON.parse(mod.test_cases || '[]'),
        hints: JSON.parse(mod.hints || '[]'),
      } : null
    });
  }

  const id = uuidv4();
  runSql(
    'INSERT INTO training_attempts (id, user_id, module_id, current_step, hints_used, status) VALUES (?, ?, ?, ?, ?, ?)',
    [id, userId, moduleId, 1, 0, 'in_progress']
  );

  const mod = queryOne('SELECT * FROM training_modules WHERE id = ?', [moduleId]);
  res.json({
    attemptId: id,
    currentStep: 1,
    hintsUsed: 0,
    resumed: false,
    module: mod ? {
      ...mod,
      test_cases: JSON.parse(mod.test_cases || '[]'),
      hints: JSON.parse(mod.hints || '[]'),
    } : null
  });
});

// Update progress step
router.post('/progress', (req, res) => {
  const { attemptId, step, userCode } = req.body;
  runSql('UPDATE training_attempts SET current_step = ?, user_code = ? WHERE id = ?', [step, userCode || '', attemptId]);
  res.json({ success: true, currentStep: step });
});

// Request hint
router.post('/hint', (req, res) => {
  const { attemptId, moduleId } = req.body;
  const attempt = queryOne('SELECT * FROM training_attempts WHERE id = ?', [attemptId]);
  const mod = queryOne('SELECT * FROM training_modules WHERE id = ?', [moduleId]);
  if (!attempt || !mod) return res.status(404).json({ error: 'Not found' });

  const hints = JSON.parse(mod.hints || '[]');
  const hintsUsed = attempt.hints_used + 1;
  runSql('UPDATE training_attempts SET hints_used = ? WHERE id = ?', [hintsUsed, attemptId]);

  const hintIndex = Math.min(hintsUsed - 1, hints.length - 1);
  res.json({
    hint: hints[hintIndex] || 'No more hints available.',
    hintNumber: hintsUsed,
    totalHints: hints.length,
    remainingHints: Math.max(0, hints.length - hintsUsed),
  });
});

// Submit exercise and evaluate
router.post('/submit', (req, res) => {
  const { attemptId, userId, moduleId, userCode } = req.body;
  const mod = queryOne('SELECT * FROM training_modules WHERE id = ?', [moduleId]);
  if (!mod) return res.status(404).json({ error: 'Module not found' });

  const testCases = JSON.parse(mod.test_cases || '[]');

  // Simulate test evaluation (rule-based checking)
  const codeLength = (userCode || '').trim().length;
  const hasKeyPatterns = checkCodePatterns(userCode || '', mod.skill_area);
  const passRate = hasKeyPatterns.score;

  const testResults = testCases.map((tc, i) => ({
    ...tc,
    passed: passRate > (i * 0.25),
    feedback: passRate > (i * 0.25) ? 'Test passed!' : 'Review the hint for this pattern.'
  }));

  const passed = testResults.filter(t => t.passed).length;
  const totalTests = testResults.length;
  const scoreGain = Math.round((passed / Math.max(totalTests, 1)) * 15);

  // Update attempt
  runSql(
    'UPDATE training_attempts SET user_code = ?, test_results = ?, score_gain = ?, status = ?, completed_at = datetime("now") WHERE id = ?',
    [userCode, JSON.stringify(testResults), scoreGain, 'completed', attemptId]
  );

  // Update competency score
  if (scoreGain > 0 && userId) {
    const current = queryOne(
      `SELECT * FROM competency_scores WHERE user_id = ? AND skill = ? ORDER BY assessed_at DESC LIMIT 1`,
      [userId, mod.skill_area]
    );
    const newScore = Math.min(100, (current ? current.score : 50) + scoreGain);
    runSql(
      'INSERT INTO competency_scores (id, user_id, skill, score, target_score, confidence, evidence_source) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [uuidv4(), userId, mod.skill_area, newScore, 85, 0.8, 'Training Module Completion']
    );
  }

  // Log to audit
  runSql(
    'INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)',
    [uuidv4(), userId, 'training_completed', 'training', moduleId, `Score gain: +${scoreGain}, Tests: ${passed}/${totalTests}`]
  );

  res.json({
    testResults,
    passed,
    totalTests,
    scoreGain,
    feedback: hasKeyPatterns.feedback,
    completed: true
  });
});

function checkCodePatterns(code, skillArea) {
  const codeLower = code.toLowerCase();
  let score = 0;
  let feedback = [];

  if (skillArea === 'SQL & Databases') {
    if (codeLower.includes('over') && codeLower.includes('partition')) {
      score += 0.4;
      feedback.push('✓ Correct use of window function with PARTITION BY');
    }
    if (codeLower.includes('avg') || codeLower.includes('sum')) {
      score += 0.2;
      feedback.push('✓ Aggregate function used correctly');
    }
    if (codeLower.includes('lag') || codeLower.includes('lead')) {
      score += 0.2;
      feedback.push('✓ LAG/LEAD function applied for row comparison');
    }
    if (codeLower.includes('order by')) {
      score += 0.2;
      feedback.push('✓ ORDER BY clause included for window ordering');
    }
  } else if (skillArea === 'Python Programming') {
    if (codeLower.includes('def ')) {
      score += 0.3;
      feedback.push('✓ Functions defined for modular pipeline');
    }
    if (codeLower.includes('return') || codeLower.includes('df[')) {
      score += 0.2;
      feedback.push('✓ DataFrame operations used');
    }
    if (codeLower.includes('groupby') || codeLower.includes('cumsum')) {
      score += 0.3;
      feedback.push('✓ Aggregation/cumulative operations applied');
    }
    if (codeLower.includes('fillna') || codeLower.includes('dropna') || codeLower.includes('>= 0')) {
      score += 0.2;
      feedback.push('✓ Data cleaning logic implemented');
    }
  }

  if (code.trim().length < 20) {
    score = 0.1;
    feedback = ['Code seems too short. Try implementing the full solution using the hints.'];
  }

  return { score: Math.min(score, 1), feedback };
}

// Get user's training history
router.get('/history/:userId', (req, res) => {
  const attempts = queryAll(
    `SELECT ta.*, tm.title, tm.skill_area, tm.difficulty
     FROM training_attempts ta
     JOIN training_modules tm ON ta.module_id = tm.id
     WHERE ta.user_id = ? ORDER BY ta.started_at DESC`,
    [req.params.userId]
  );
  res.json(attempts);
});

module.exports = router;
