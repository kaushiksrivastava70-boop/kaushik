const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'sih_database.sqlite');

let db = null;
let dbReady = null;

function initializeDatabase() {
  if (dbReady) return dbReady;

  dbReady = initSqlJs().then(SQL => {
    // Load existing database or create new
    if (fs.existsSync(DB_PATH)) {
      const fileBuffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(fileBuffer);
      console.log('[DB] Loaded existing database from', DB_PATH);
    } else {
      db = new SQL.Database();
      console.log('[DB] Created new database.');
    }

    // Create schema
    db.run('PRAGMA foreign_keys = ON;');

    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL DEFAULT 'learner',
        avatar_url TEXT,
        department TEXT,
        region TEXT,
        designation TEXT,
        joined_at TEXT DEFAULT (datetime('now')),
        last_active TEXT DEFAULT (datetime('now'))
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS learning_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        session_type TEXT NOT NULL,
        title TEXT,
        description TEXT,
        metadata TEXT,
        started_at TEXT DEFAULT (datetime('now')),
        ended_at TEXT,
        duration_minutes INTEGER DEFAULT 0
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        context TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS competency_scores (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        skill TEXT NOT NULL,
        score REAL NOT NULL DEFAULT 0,
        target_score REAL NOT NULL DEFAULT 100,
        confidence REAL NOT NULL DEFAULT 0.5,
        evidence_source TEXT,
        assessed_at TEXT DEFAULT (datetime('now'))
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS skill_gaps (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        skill TEXT NOT NULL,
        gap_severity TEXT NOT NULL DEFAULT 'moderate',
        recommended_action TEXT,
        priority INTEGER DEFAULT 5,
        identified_at TEXT DEFAULT (datetime('now'))
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        skill_area TEXT,
        difficulty TEXT DEFAULT 'intermediate',
        duration_hours REAL DEFAULT 1,
        content TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS course_progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        progress_pct REAL DEFAULT 0,
        status TEXT DEFAULT 'not_started',
        started_at TEXT,
        completed_at TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        file_type TEXT DEFAULT 'pdf',
        total_pages INTEGER DEFAULT 1,
        uploaded_by TEXT,
        uploaded_at TEXT DEFAULT (datetime('now'))
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS document_chunks (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        chunk_index INTEGER NOT NULL,
        page_number INTEGER DEFAULT 1,
        section_title TEXT,
        content TEXT NOT NULL,
        keywords TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS assessments (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        skill_area TEXT NOT NULL,
        description TEXT,
        total_questions INTEGER DEFAULT 10,
        time_limit_minutes INTEGER DEFAULT 30,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS assessment_questions (
        id TEXT PRIMARY KEY,
        assessment_id TEXT NOT NULL,
        question_text TEXT NOT NULL,
        question_type TEXT DEFAULT 'mcq',
        difficulty TEXT NOT NULL DEFAULT 'medium',
        skill_tag TEXT,
        options TEXT,
        correct_answer TEXT NOT NULL,
        explanation TEXT,
        distractor_analysis TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS assessment_attempts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        assessment_id TEXT NOT NULL,
        score REAL,
        total_questions INTEGER,
        correct_count INTEGER,
        difficulty_progression TEXT,
        time_taken_seconds INTEGER,
        started_at TEXT DEFAULT (datetime('now')),
        completed_at TEXT,
        status TEXT DEFAULT 'in_progress'
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS question_attempts (
        id TEXT PRIMARY KEY,
        attempt_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        user_answer TEXT,
        is_correct INTEGER DEFAULT 0,
        time_spent_seconds INTEGER DEFAULT 0,
        difficulty_at_time TEXT,
        answered_at TEXT DEFAULT (datetime('now'))
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS training_modules (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        skill_area TEXT NOT NULL,
        difficulty TEXT DEFAULT 'intermediate',
        description TEXT,
        lesson_content TEXT,
        worked_example TEXT,
        exercise_prompt TEXT,
        exercise_template TEXT,
        test_cases TEXT,
        hints TEXT,
        estimated_minutes INTEGER DEFAULT 30,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS training_attempts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        module_id TEXT NOT NULL,
        current_step INTEGER DEFAULT 1,
        user_code TEXT,
        hints_used INTEGER DEFAULT 0,
        test_results TEXT,
        score_gain REAL DEFAULT 0,
        status TEXT DEFAULT 'in_progress',
        started_at TEXT DEFAULT (datetime('now')),
        completed_at TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS career_predictions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        career_path TEXT NOT NULL,
        current_readiness REAL DEFAULT 0,
        target_readiness REAL DEFAULT 100,
        projected_readiness REAL DEFAULT 0,
        timeline_months INTEGER DEFAULT 12,
        confidence REAL DEFAULT 0.7,
        weight_breakdown TEXT,
        calculated_at TEXT DEFAULT (datetime('now'))
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS prediction_scenarios (
        id TEXT PRIMARY KEY,
        prediction_id TEXT NOT NULL,
        scenario_name TEXT NOT NULL,
        weekly_hours_change REAL DEFAULT 0,
        projected_score REAL DEFAULT 0,
        timeline_months INTEGER DEFAULT 12,
        description TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS regional_skill_analytics (
        id TEXT PRIMARY KEY,
        state_name TEXT NOT NULL,
        state_code TEXT NOT NULL,
        skill_area TEXT NOT NULL,
        avg_competency REAL DEFAULT 0,
        gap_severity TEXT DEFAULT 'moderate',
        learner_count INTEGER DEFAULT 0,
        improvement_rate REAL DEFAULT 0,
        last_updated TEXT DEFAULT (datetime('now'))
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        action TEXT NOT NULL,
        entity_type TEXT,
        entity_id TEXT,
        details TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT,
        type TEXT DEFAULT 'info',
        is_read INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    console.log('[DB] Schema initialized.');
    saveDb();
    return db;
  });

  return dbReady;
}

function getDb() {
  return db;
}

function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

// Helper to run queries and return results as array of objects
function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function queryOne(sql, params = []) {
  const results = queryAll(sql, params);
  return results.length > 0 ? results[0] : null;
}

function runSql(sql, params = []) {
  if (params.length) {
    db.run(sql, params);
  } else {
    db.run(sql);
  }
  saveDb();
}

module.exports = { initializeDatabase, getDb, saveDb, queryAll, queryOne, runSql };
