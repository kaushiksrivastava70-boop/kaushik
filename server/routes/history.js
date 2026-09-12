const express = require('express');
const { queryAll, queryOne, runSql } = require('../db');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Get unified timeline / history for a user
router.get('/:userId', (req, res) => {
  const { userId } = req.params;

  // 1. Learning sessions
  const sessions = queryAll(
    'SELECT id, session_type as type, title, description, started_at as timestamp, metadata FROM learning_sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT 20',
    [userId]
  );

  // 2. Assessment attempts
  const assessments = queryAll(`
    SELECT aa.id, 'assessment' as type, a.title, 
      ROUND(aa.score, 1) as score, aa.correct_count, aa.total_questions,
      aa.completed_at as timestamp,
      ('Scored ' || ROUND(aa.score, 1) || '% (' || aa.correct_count || '/' || aa.total_questions || ' correct)') as description
    FROM assessment_attempts aa
    JOIN assessments a ON aa.assessment_id = a.id
    WHERE aa.user_id = ? AND aa.status = 'completed'
    ORDER BY aa.completed_at DESC LIMIT 20
  `, [userId]);

  // 3. Training attempts
  const trainings = queryAll(`
    SELECT ta.id, 'training' as type, tm.title,
      ta.completed_at as timestamp,
      ('Completed practical module with +' || ta.score_gain || ' skill points gain') as description
    FROM training_attempts ta
    JOIN training_modules tm ON ta.module_id = tm.id
    WHERE ta.user_id = ? AND ta.status = 'completed'
    ORDER BY ta.completed_at DESC LIMIT 20
  `, [userId]);

  // Combine and sort by timestamp descending
  const allEvents = [...sessions, ...assessments, ...trainings]
    .filter(e => e.timestamp)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.json(allEvents);
});

// Record a new learning session
router.post('/session', (req, res) => {
  const { userId, sessionType, title, description, metadata, durationMinutes } = req.body;
  const id = uuidv4();
  runSql(
    'INSERT INTO learning_sessions (id, user_id, session_type, title, description, metadata, duration_minutes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, userId, sessionType, title, description, JSON.stringify(metadata || {}), durationMinutes || 15]
  );

  runSql(
    'INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)',
    [uuidv4(), userId, 'complete_session', sessionType, id, title]
  );

  res.json({ success: true, sessionId: id });
});

module.exports = router;
