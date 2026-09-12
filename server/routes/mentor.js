const express = require('express');
const { queryAll, queryOne, runSql } = require('../db');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Chat with AI Mentor (context-aware)
router.post('/chat', (req, res) => {
  const { userId, message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  // Save user message
  runSql('INSERT INTO messages (id, user_id, role, content) VALUES (?, ?, ?, ?)',
    [uuidv4(), userId, 'user', message]);

  // Build context from user's competency twin
  const scores = queryAll(`
    SELECT cs.* FROM competency_scores cs
    INNER JOIN (
      SELECT skill, MAX(assessed_at) as max_date
      FROM competency_scores WHERE user_id = ?
      GROUP BY skill
    ) latest ON cs.skill = latest.skill AND cs.assessed_at = latest.max_date
    WHERE cs.user_id = ?
  `, [userId, userId]);

  const gaps = queryAll('SELECT * FROM skill_gaps WHERE user_id = ? ORDER BY priority', [userId]);
  const user = queryOne('SELECT * FROM users WHERE id = ?', [userId]);
  const recentSessions = queryAll(
    'SELECT * FROM learning_sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT 3',
    [userId]
  );

  // Generate context-aware response
  const response = generateMentorResponse(message, { user, scores, gaps, recentSessions });

  // Save assistant response
  runSql('INSERT INTO messages (id, user_id, role, content) VALUES (?, ?, ?, ?)',
    [uuidv4(), userId, 'assistant', response]);

  // Log session
  runSql('INSERT INTO audit_logs (id, user_id, action, entity_type, details) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), userId, 'mentor_chat', 'mentor', `Query: ${message.substring(0, 100)}`]);

  res.json({
    response,
    context: {
      userName: user ? user.name : 'Learner',
      topSkill: scores.length > 0 ? scores.reduce((a, b) => a.score > b.score ? a : b).skill : 'N/A',
      criticalGap: gaps.length > 0 ? gaps[0].skill : 'None',
    }
  });
});

// Get chat history
router.get('/history/:userId', (req, res) => {
  const messages = queryAll(
    'SELECT * FROM messages WHERE user_id = ? ORDER BY created_at ASC',
    [req.params.userId]
  );
  res.json(messages);
});

function generateMentorResponse(message, context) {
  const { user, scores, gaps, recentSessions } = context;
  const msgLower = message.toLowerCase();
  const userName = user ? user.name.split(' ')[0] : 'there';

  // Build competency summary
  const scoreMap = {};
  scores.forEach(s => { scoreMap[s.skill] = s.score; });
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b.score, 0) / scores.length) : 0;
  const strongestSkill = scores.length > 0 ? scores.reduce((a, b) => a.score > b.score ? a : b) : null;
  const weakestSkill = scores.length > 0 ? scores.reduce((a, b) => a.score < b.score ? a : b) : null;

  // Pattern matching for different query types
  if (msgLower.includes('learn next') || msgLower.includes('what should i') || msgLower.includes('recommend')) {
    const topGap = gaps.length > 0 ? gaps[0] : null;
    if (topGap) {
      return `Hi ${userName}! Based on your Competency Digital Twin, I recommend focusing on **${topGap.skill}** next. Your current score in this area is ${scoreMap[topGap.skill] || 'below target'}, and it's classified as a ${topGap.gap_severity} gap.\n\n**Recommended Action:** ${topGap.recommended_action}\n\nYou can:\n1. 📝 Take an **Adaptive Assessment** in ${topGap.skill} to benchmark your level\n2. 🎓 Start a **Training Module** for hands-on practice\n3. 📚 Use the **RAG AI Tutor** to study relevant documents\n\nYour strongest area is ${strongestSkill ? strongestSkill.skill + ' (' + strongestSkill.score + '%)' : 'N/A'}, so you have a solid foundation to build upon!`;
    }
    return `Hi ${userName}! Your overall competency average is ${avgScore}%. I'd suggest exploring the Training Mode or taking an Adaptive Assessment to identify specific areas for improvement.`;
  }

  if (msgLower.includes('gap') || msgLower.includes('weak') || msgLower.includes('improve')) {
    const gapList = gaps.map((g, i) => `${i + 1}. **${g.skill}** (${g.gap_severity}) — ${g.recommended_action}`).join('\n');
    return `${userName}, here's your current skill gap analysis:\n\n${gapList || 'No critical gaps identified! Great progress!'}\n\nYour average competency is **${avgScore}%**. ${weakestSkill ? `Focus on **${weakestSkill.skill}** (${weakestSkill.score}%) for the highest impact.` : ''}\n\nWould you like me to suggest a specific learning path or training module?`;
  }

  if (msgLower.includes('career') || msgLower.includes('data scientist') || msgLower.includes('ml engineer') || msgLower.includes('readiness')) {
    return `${userName}, based on your current competency profile (avg: ${avgScore}%), here's a quick career readiness overview:\n\n🎯 **Data Analyst**: Best fit with your current skills — ${strongestSkill ? `your ${strongestSkill.skill} at ${strongestSkill.score}% is a strong asset` : 'continue building core skills'}.\n📊 **Data Scientist**: Requires stronger Statistics & ML — check the Future Skills Predictor for detailed projections.\n🤖 **ML Engineer**: Requires advanced Python & ML — longer timeline but achievable with focused effort.\n\nUse the **Future Career Predictor** tab to explore 3 learning pace scenarios for each path!`;
  }

  if (msgLower.includes('sql') || msgLower.includes('database')) {
    const sqlScore = scoreMap['SQL & Databases'] || 0;
    return `${userName}, your SQL & Databases competency is currently at **${sqlScore}%**.\n\n${sqlScore < 50 ? '⚠️ This is below the Competent threshold (51-70). I recommend:\n1. Starting with the **SQL Window Functions** training module\n2. Reviewing the Python Data Engineering document sections on SQL\n3. Taking the SQL adaptive assessment to identify specific gaps' : sqlScore < 70 ? '📈 You\'re at the Competent level. To reach Proficient:\n1. Practice advanced window functions and CTEs\n2. Complete the SQL training module exercises\n3. Explore data modeling concepts' : '✅ Strong SQL skills! Consider:\n1. Mentoring others in your department\n2. Exploring advanced database optimization\n3. Focusing on other gap areas'}\n\nThe **Training Mode** has a dedicated SQL Window Functions module ready for you.`;
  }

  if (msgLower.includes('python') || msgLower.includes('programming')) {
    const pyScore = scoreMap['Python Programming'] || 0;
    return `${userName}, your Python Programming is at **${pyScore}%**.\n\n${pyScore >= 70 ? '🌟 Great progress! You\'re at the Proficient level. Consider:\n- Working on data pipeline projects\n- Exploring advanced pandas patterns\n- Building ML models with scikit-learn' : `📚 To strengthen your Python skills:\n1. Complete the **Python Data Pipeline** training module\n2. Study the ETL Pipeline Design section in the document vault\n3. Practice with the adaptive assessment`}\n\nRemember, Python is weighted heavily in Data Analyst (25%) and ML Engineer (30%) career paths!`;
  }

  if (msgLower.includes('progress') || msgLower.includes('how am i') || msgLower.includes('status')) {
    const recent = recentSessions.map(s => `- **${s.title}** (${s.session_type}) — ${s.duration_minutes} min`).join('\n');
    return `Here's your learning progress summary, ${userName}:\n\n📊 **Overall Competency:** ${avgScore}%\n${strongestSkill ? `💪 **Strongest:** ${strongestSkill.skill} (${strongestSkill.score}%)` : ''}\n${weakestSkill ? `📈 **Needs Focus:** ${weakestSkill.skill} (${weakestSkill.score}%)` : ''}\n\n**Recent Activity:**\n${recent || 'No recent sessions. Let\'s get started!'}\n\nKeep going! Consistent practice is the key to mastery. 🚀`;
  }

  if (msgLower.includes('hello') || msgLower.includes('hi') || msgLower.includes('hey')) {
    return `Hello ${userName}! 👋 I'm your AI Learning Mentor. I have access to your Competency Digital Twin and learning history to give personalized guidance.\n\nYour current average competency is **${avgScore}%** across ${scores.length} skill areas.\n\nHow can I help you today? Try asking:\n- "What should I learn next?"\n- "Explain my SQL gap"\n- "How can I reach Data Scientist readiness?"\n- "How am I doing?"`;
  }

  // Default response
  return `${userName}, that's a great question! Based on your competency profile (avg: ${avgScore}%), here are some general recommendations:\n\n1. ${gaps.length > 0 ? `**Priority:** Address your ${gaps[0].skill} gap (${gaps[0].gap_severity})` : 'Continue building across all skill areas'}\n2. ${strongestSkill ? `**Leverage:** Your ${strongestSkill.skill} strength (${strongestSkill.score}%)` : 'Take assessments to establish baselines'}\n3. **Explore:** Use the RAG AI Tutor to study specific topics from the document vault\n\nCould you be more specific about what you'd like to know? I can help with:\n- Learning recommendations\n- Skill gap analysis\n- Career path guidance\n- Assessment preparation`;
}

module.exports = router;
