const express = require('express');
const { queryAll, queryOne } = require('../db');
const router = express.Router();

// Get career predictions for a user
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const predictions = queryAll(
    'SELECT * FROM career_predictions WHERE user_id = ? ORDER BY current_readiness DESC',
    [userId]
  );

  const withScenarios = predictions.map(p => {
    const scenarios = queryAll(
      'SELECT * FROM prediction_scenarios WHERE prediction_id = ? ORDER BY scenario_name',
      [p.id]
    );
    return {
      ...p,
      weight_breakdown: JSON.parse(p.weight_breakdown || '{}'),
      scenarios
    };
  });

  res.json(withScenarios);
});

// Get specific career path prediction
router.get('/:userId/:careerPath', (req, res) => {
  const { userId, careerPath } = req.params;
  const prediction = queryOne(
    'SELECT * FROM career_predictions WHERE user_id = ? AND career_path = ?',
    [userId, careerPath]
  );
  if (!prediction) return res.status(404).json({ error: 'Prediction not found' });

  const scenarios = queryAll(
    'SELECT * FROM prediction_scenarios WHERE prediction_id = ?',
    [prediction.id]
  );

  // Get user's current competency scores for detailed breakdown
  const scores = queryAll(`
    SELECT cs.* FROM competency_scores cs
    INNER JOIN (
      SELECT skill, MAX(assessed_at) as max_date
      FROM competency_scores WHERE user_id = ?
      GROUP BY skill
    ) latest ON cs.skill = latest.skill AND cs.assessed_at = latest.max_date
    WHERE cs.user_id = ?
  `, [userId, userId]);

  const weights = JSON.parse(prediction.weight_breakdown || '{}');
  const skillMapping = {
    python: 'Python Programming',
    sql: 'SQL & Databases',
    statistics: 'Statistics & Probability',
    data_modeling: 'Data Modeling',
    data_quality: 'Data Quality & Governance',
    ml: 'Machine Learning'
  };

  const detailedBreakdown = Object.entries(weights).map(([key, weight]) => {
    const skillName = skillMapping[key] || key;
    const scoreRecord = scores.find(s => s.skill === skillName);
    const currentScore = scoreRecord ? scoreRecord.score : 0;
    const weightedContribution = currentScore * weight;
    return {
      skill: skillName,
      weight: Math.round(weight * 100),
      currentScore,
      weightedContribution: Math.round(weightedContribution * 10) / 10,
      gap: Math.max(0, 85 - currentScore),
    };
  });

  res.json({
    ...prediction,
    weight_breakdown: weights,
    scenarios,
    detailedBreakdown,
    formula: `Readiness = Σ(skill_score × weight) = ${detailedBreakdown.map(d => `${d.currentScore}×${d.weight}%`).join(' + ')} = ${prediction.current_readiness}`,
  });
});

module.exports = router;
