const express = require('express');
const { queryAll, queryOne, runSql } = require('../db');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Get Admin Command Center KPIs
router.get('/kpis', (req, res) => {
  const totalLearners = queryOne("SELECT COUNT(*) as count FROM users WHERE role = 'learner'")?.count || 0;
  const totalAssessments = queryOne("SELECT COUNT(*) as count FROM assessment_attempts WHERE status = 'completed'")?.count || 0;
  
  // Calculate system-wide average competency
  const avgComp = queryOne(`
    SELECT AVG(score) as avg_score FROM competency_scores cs
    INNER JOIN (
      SELECT user_id, skill, MAX(assessed_at) as max_date
      FROM competency_scores
      GROUP BY user_id, skill
    ) latest ON cs.user_id = latest.user_id AND cs.skill = latest.skill AND cs.assessed_at = latest.max_date
  `)?.avg_score || 64.5;

  const criticalGapsCount = queryOne("SELECT COUNT(*) as count FROM skill_gaps WHERE gap_severity = 'critical'")?.count || 0;

  const departmentStats = queryAll(`
    SELECT u.department, COUNT(DISTINCT u.id) as user_count, ROUND(AVG(cs.score), 1) as avg_score
    FROM users u
    LEFT JOIN competency_scores cs ON u.id = cs.user_id
    WHERE u.role = 'learner'
    GROUP BY u.department
  `);

  const regionalStats = queryAll(`
    SELECT state_name, state_code, avg_competency, gap_severity, learner_count, improvement_rate
    FROM regional_skill_analytics
    ORDER BY avg_competency ASC
  `);

  res.json({
    totalLearners,
    totalAssessments,
    averageCompetency: Math.round(avgComp * 10) / 10,
    criticalGapsCount,
    departmentStats,
    regionalStats
  });
});

// Get Audit Logs
router.get('/audit-logs', (req, res) => {
  const limit = parseInt(req.query.limit) || 30;
  const logs = queryAll(`
    SELECT al.*, u.name as user_name, u.role as user_role
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    ORDER BY al.created_at DESC
    LIMIT ?
  `, [limit]);
  res.json(logs);
});

// Trigger Intervention Action
router.post('/interventions', (req, res) => {
  const { title, targetRegion, targetSkill, actionType, notes, createdBy } = req.body;
  const id = uuidv4();
  
  runSql(
    'INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)',
    [uuidv4(), createdBy || 'user-admin', 'trigger_intervention', 'intervention', id, `Initiated ${actionType}: ${title} for ${targetRegion} (${targetSkill})`]
  );

  // Notify affected learners or region
  const regionalLearners = queryAll('SELECT id FROM users WHERE region = ? AND role = "learner"', [targetRegion]);
  for (const learner of regionalLearners) {
    runSql(
      'INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), learner.id, `Intervention Scheduled: ${title}`, `Special training initiative planned for ${targetSkill} in ${targetRegion}. Notes: ${notes || 'Attend designated sessions.'}`, 'action_required']
    );
  }

  res.json({
    success: true,
    interventionId: id,
    message: `Intervention initiated for ${targetRegion}. ${regionalLearners.length} learners notified.`
  });
});

// Trainer Content Review Portal: get modules and pending reviews
router.get('/training-review', (req, res) => {
  const modules = queryAll('SELECT * FROM training_modules ORDER BY title');
  const attempts = queryAll(`
    SELECT ta.*, u.name as learner_name, tm.title as module_title
    FROM training_attempts ta
    JOIN users u ON ta.user_id = u.id
    JOIN training_modules tm ON ta.module_id = tm.id
    ORDER BY ta.started_at DESC
    LIMIT 20
  `);
  res.json({ modules, recentAttempts: attempts });
});

module.exports = router;
