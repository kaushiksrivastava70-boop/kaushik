const express = require('express');
const { queryAll, queryOne, runSql } = require('../db');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// List all assessments
router.get('/', (req, res) => {
  const assessments = queryAll('SELECT * FROM assessments ORDER BY title');
  res.json(assessments);
});

// Get questions for an assessment (adaptive: filter by difficulty)
router.get('/:assessmentId/questions', (req, res) => {
  const { assessmentId } = req.params;
  const { difficulty } = req.query;
  let sql = 'SELECT * FROM assessment_questions WHERE assessment_id = ?';
  const params = [assessmentId];
  if (difficulty) {
    sql += ' AND difficulty = ?';
    params.push(difficulty);
  }
  const questions = queryAll(sql, params);
  // Don't expose correct answer in question listing
  const safeQuestions = questions.map(q => ({
    ...q,
    options: JSON.parse(q.options || '[]'),
    correct_answer: undefined,
    explanation: undefined,
    distractor_analysis: undefined,
  }));
  res.json(safeQuestions);
});

// Start a new assessment attempt
router.post('/start', (req, res) => {
  const { userId, assessmentId } = req.body;
  const id = uuidv4();
  runSql(
    'INSERT INTO assessment_attempts (id, user_id, assessment_id, status) VALUES (?, ?, ?, ?)',
    [id, userId, assessmentId, 'in_progress']
  );
  // Get first question (easy)
  const firstQ = queryOne(
    'SELECT * FROM assessment_questions WHERE assessment_id = ? AND difficulty = ? LIMIT 1',
    [assessmentId, 'easy']
  );
  res.json({
    attemptId: id,
    question: firstQ ? {
      ...firstQ,
      options: JSON.parse(firstQ.options || '[]'),
      correct_answer: undefined,
      explanation: undefined,
      distractor_analysis: undefined,
    } : null
  });
});

// Submit answer and get next question (adaptive)
router.post('/answer', (req, res) => {
  const { attemptId, questionId, answer, timeSpent } = req.body;
  const question = queryOne('SELECT * FROM assessment_questions WHERE id = ?', [questionId]);
  if (!question) return res.status(404).json({ error: 'Question not found' });

  const isCorrect = answer === question.correct_answer ? 1 : 0;
  const currentDifficulty = question.difficulty;

  // Record the answer
  runSql(
    'INSERT INTO question_attempts (id, attempt_id, question_id, user_answer, is_correct, time_spent_seconds, difficulty_at_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [uuidv4(), attemptId, questionId, answer, isCorrect, timeSpent || 0, currentDifficulty]
  );

  // Determine next difficulty (adaptive)
  const difficultyLevels = ['easy', 'medium', 'hard', 'expert'];
  const currentIdx = difficultyLevels.indexOf(currentDifficulty);
  let nextDifficulty;
  if (isCorrect) {
    nextDifficulty = difficultyLevels[Math.min(currentIdx + 1, difficultyLevels.length - 1)];
  } else {
    nextDifficulty = difficultyLevels[Math.max(currentIdx - 1, 0)];
  }

  // Get answered question IDs for this attempt
  const answered = queryAll('SELECT question_id FROM question_attempts WHERE attempt_id = ?', [attemptId]);
  const answeredIds = answered.map(a => a.question_id);

  // Try to get next question at target difficulty
  const allQuestions = queryAll(
    'SELECT * FROM assessment_questions WHERE assessment_id = ?',
    [question.assessment_id]
  );
  let nextQ = allQuestions.find(q => q.difficulty === nextDifficulty && !answeredIds.includes(q.id));
  if (!nextQ) {
    // Try adjacent difficulties
    for (const d of difficultyLevels) {
      nextQ = allQuestions.find(q => q.difficulty === d && !answeredIds.includes(q.id));
      if (nextQ) break;
    }
  }

  res.json({
    isCorrect: !!isCorrect,
    correctAnswer: question.correct_answer,
    explanation: question.explanation,
    distractorAnalysis: JSON.parse(question.distractor_analysis || '{}'),
    nextDifficulty,
    questionsAnswered: answeredIds.length,
    nextQuestion: nextQ ? {
      ...nextQ,
      options: JSON.parse(nextQ.options || '[]'),
      correct_answer: undefined,
      explanation: undefined,
      distractor_analysis: undefined,
    } : null
  });
});

// Complete assessment and get results
router.post('/complete', (req, res) => {
  const { attemptId, userId } = req.body;
  const answers = queryAll('SELECT * FROM question_attempts WHERE attempt_id = ?', [attemptId]);
  const attempt = queryOne('SELECT * FROM assessment_attempts WHERE id = ?', [attemptId]);
  if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

  const totalQuestions = answers.length;
  const correctCount = answers.filter(a => a.is_correct).length;
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const totalTime = answers.reduce((sum, a) => sum + (a.time_spent_seconds || 0), 0);
  const diffProgression = answers.map(a => a.difficulty_at_time);

  runSql(
    'UPDATE assessment_attempts SET score = ?, total_questions = ?, correct_count = ?, difficulty_progression = ?, time_taken_seconds = ?, completed_at = datetime("now"), status = ? WHERE id = ?',
    [score, totalQuestions, correctCount, JSON.stringify(diffProgression), totalTime, 'completed', attemptId]
  );

  // Update competency score
  const assessment = queryOne('SELECT * FROM assessments WHERE id = ?', [attempt.assessment_id]);
  if (assessment && userId) {
    runSql(
      'INSERT INTO competency_scores (id, user_id, skill, score, target_score, confidence, evidence_source) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [uuidv4(), userId, assessment.skill_area, score, 85, Math.min(0.95, 0.5 + totalQuestions * 0.03), 'Adaptive Assessment']
    );
  }

  // Build diagnostic
  const byDifficulty = {};
  for (const a of answers) {
    const d = a.difficulty_at_time;
    if (!byDifficulty[d]) byDifficulty[d] = { total: 0, correct: 0 };
    byDifficulty[d].total++;
    if (a.is_correct) byDifficulty[d].correct++;
  }

  // Get question details for each answer
  const detailed = answers.map(a => {
    const q = queryOne('SELECT * FROM assessment_questions WHERE id = ?', [a.question_id]);
    return {
      question: q ? q.question_text : '',
      difficulty: a.difficulty_at_time,
      userAnswer: a.user_answer,
      correctAnswer: q ? q.correct_answer : '',
      isCorrect: !!a.is_correct,
      explanation: q ? q.explanation : '',
      distractorAnalysis: q ? JSON.parse(q.distractor_analysis || '{}') : {},
      timeSpent: a.time_spent_seconds
    };
  });

  res.json({
    score,
    totalQuestions,
    correctCount,
    timeTaken: totalTime,
    difficultyProgression: diffProgression,
    byDifficulty,
    detailed,
    skillArea: assessment ? assessment.skill_area : '',
  });
});

// Get attempt history for a user
router.get('/history/:userId', (req, res) => {
  const { userId } = req.params;
  const attempts = queryAll(
    `SELECT aa.*, a.title as assessment_title, a.skill_area
     FROM assessment_attempts aa
     JOIN assessments a ON aa.assessment_id = a.id
     WHERE aa.user_id = ? ORDER BY aa.started_at DESC`,
    [userId]
  );
  res.json(attempts.map(a => ({
    ...a,
    difficulty_progression: JSON.parse(a.difficulty_progression || '[]')
  })));
});

module.exports = router;
