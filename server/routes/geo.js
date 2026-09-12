const express = require('express');
const { queryAll } = require('../db');
const router = express.Router();

// Get regional analytics with filters
router.get('/', (req, res) => {
  const { skill, state } = req.query;
  let sql = 'SELECT * FROM regional_skill_analytics WHERE 1=1';
  const params = [];

  if (skill) {
    sql += ' AND skill_area = ?';
    params.push(skill);
  }
  if (state) {
    sql += ' AND state_code = ?';
    params.push(state);
  }

  sql += ' ORDER BY state_name, skill_area';
  const data = queryAll(sql, params);
  res.json(data);
});

// Get aggregated state summary (avg across all skills)
router.get('/summary', (req, res) => {
  const { skill } = req.query;
  let whereClause = '';
  const params = [];
  if (skill) {
    whereClause = 'WHERE skill_area = ?';
    params.push(skill);
  }

  const states = queryAll(`
    SELECT state_name, state_code,
      ROUND(AVG(avg_competency), 1) as avg_competency,
      SUM(learner_count) as total_learners,
      ROUND(AVG(improvement_rate), 1) as avg_improvement_rate,
      CASE
        WHEN AVG(avg_competency) < 40 THEN 'critical'
        WHEN AVG(avg_competency) < 55 THEN 'high'
        WHEN AVG(avg_competency) < 70 THEN 'moderate'
        ELSE 'low'
      END as overall_gap
    FROM regional_skill_analytics
    ${whereClause}
    GROUP BY state_name, state_code
    ORDER BY avg_competency ASC
  `, params);

  res.json(states);
});

// Get quadrant analysis
router.get('/quadrant', (req, res) => {
  const { skill } = req.query;
  let whereClause = '';
  const params = [];
  if (skill) {
    whereClause = 'WHERE skill_area = ?';
    params.push(skill);
  }

  const states = queryAll(`
    SELECT state_name, state_code,
      ROUND(AVG(avg_competency), 1) as avg_competency,
      ROUND(AVG(improvement_rate), 1) as improvement_rate
    FROM regional_skill_analytics
    ${whereClause}
    GROUP BY state_name, state_code
  `, params);

  // Classify into quadrants
  const medianComp = states.length > 0
    ? states.map(s => s.avg_competency).sort((a, b) => a - b)[Math.floor(states.length / 2)]
    : 50;
  const medianRate = states.length > 0
    ? states.map(s => s.improvement_rate).sort((a, b) => a - b)[Math.floor(states.length / 2)]
    : 8;

  const quadrants = {
    criticalIntervention: [], // Low competency, low improvement
    improving: [],            // Low competency, high improvement
    healthy: [],              // High competency, high improvement
    monitor: [],              // High competency, low improvement
  };

  for (const s of states) {
    if (s.avg_competency < medianComp && s.improvement_rate < medianRate) {
      quadrants.criticalIntervention.push(s);
    } else if (s.avg_competency < medianComp && s.improvement_rate >= medianRate) {
      quadrants.improving.push(s);
    } else if (s.avg_competency >= medianComp && s.improvement_rate >= medianRate) {
      quadrants.healthy.push(s);
    } else {
      quadrants.monitor.push(s);
    }
  }

  res.json({
    quadrants,
    medians: { competency: medianComp, improvementRate: medianRate },
    allStates: states,
  });
});

// Get available skill areas for filters
router.get('/skills', (req, res) => {
  const skills = queryAll('SELECT DISTINCT skill_area FROM regional_skill_analytics ORDER BY skill_area');
  res.json(skills.map(s => s.skill_area));
});

module.exports = router;
