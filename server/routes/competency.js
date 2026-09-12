const express = require('express');
const { queryAll, queryOne, runSql } = require('../db');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Get latest competency scores for a user
router.get('/scores/:userId', (req, res) => {
  const { userId } = req.params;
  // Get latest score for each skill
  const scores = queryAll(`
    SELECT cs.* FROM competency_scores cs
    INNER JOIN (
      SELECT skill, MAX(assessed_at) as max_date
      FROM competency_scores WHERE user_id = ?
      GROUP BY skill
    ) latest ON cs.skill = latest.skill AND cs.assessed_at = latest.max_date
    WHERE cs.user_id = ?
    ORDER BY cs.skill
  `, [userId, userId]);
  res.json(scores);
});

// Get competency history for a user
router.get('/history/:userId', (req, res) => {
  const { userId } = req.params;
  const history = queryAll(
    'SELECT * FROM competency_scores WHERE user_id = ? ORDER BY assessed_at ASC, skill',
    [userId]
  );

  // Group by assessment date
  const grouped = {};
  for (const row of history) {
    const date = row.assessed_at;
    if (!grouped[date]) grouped[date] = { date, scores: {} };
    grouped[date].scores[row.skill] = row.score;
  }

  res.json(Object.values(grouped));
});

// Get skill gaps for a user
router.get('/gaps/:userId', (req, res) => {
  const { userId } = req.params;
  const gaps = queryAll(
    'SELECT * FROM skill_gaps WHERE user_id = ? ORDER BY priority ASC',
    [userId]
  );
  res.json(gaps);
});

// Update a competency score (after assessment/training)
router.post('/update', (req, res) => {
  const { userId, skill, score, targetScore, confidence, evidenceSource } = req.body;
  const id = uuidv4();
  runSql(
    'INSERT INTO competency_scores (id, user_id, skill, score, target_score, confidence, evidence_source) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, userId, skill, score, targetScore || 85, confidence || 0.7, evidenceSource || 'Assessment']
  );
  res.json({ success: true, id });
});

// Get summary stats
router.get('/summary/:userId', (req, res) => {
  const { userId } = req.params;
  const scores = queryAll(`
    SELECT cs.* FROM competency_scores cs
    INNER JOIN (
      SELECT skill, MAX(assessed_at) as max_date
      FROM competency_scores WHERE user_id = ?
      GROUP BY skill
    ) latest ON cs.skill = latest.skill AND cs.assessed_at = latest.max_date
    WHERE cs.user_id = ?
  `, [userId, userId]);

  const gaps = queryAll('SELECT * FROM skill_gaps WHERE user_id = ?', [userId]);

  const avgScore = scores.length > 0 ? scores.reduce((s, r) => s + r.score, 0) / scores.length : 0;
  const strongSkills = scores.filter(s => s.score >= 70);
  const developingSkills = scores.filter(s => s.score >= 50 && s.score < 70);
  const criticalGaps = scores.filter(s => s.score < 50);

  res.json({
    averageScore: Math.round(avgScore * 10) / 10,
    totalSkills: scores.length,
    strongSkills: strongSkills.map(s => ({ skill: s.skill, score: s.score })),
    developingSkills: developingSkills.map(s => ({ skill: s.skill, score: s.score })),
    criticalGaps: criticalGaps.map(s => ({ skill: s.skill, score: s.score })),
    gapActions: gaps,
  });
});

module.exports = router;
