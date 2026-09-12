const express = require('express');
const { queryAll, queryOne, runSql } = require('../db');
const router = express.Router();

// Get all users / login as user
router.get('/users', (req, res) => {
  const users = queryAll('SELECT * FROM users ORDER BY role, name');
  res.json(users);
});

// Get current user (simulated by query param or default)
router.get('/current', (req, res) => {
  const userId = req.query.userId || 'user-ananya';
  const user = queryOne('SELECT * FROM users WHERE id = ?', [userId]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  // Update last active
  runSql('UPDATE users SET last_active = datetime("now") WHERE id = ?', [userId]);
  res.json(user);
});

// Switch user
router.post('/switch', (req, res) => {
  const { userId } = req.body;
  const user = queryOne('SELECT * FROM users WHERE id = ?', [userId]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  runSql('UPDATE users SET last_active = datetime("now") WHERE id = ?', [userId]);
  res.json(user);
});

module.exports = router;
