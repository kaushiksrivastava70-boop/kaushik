import sqlite3
import os
import json
import uuid
import shutil
import tempfile
from datetime import datetime

ORIGINAL_DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "sih_database_py.sqlite"))

if os.environ.get("VERCEL") or not os.access(os.path.dirname(ORIGINAL_DB_PATH) or ".", os.W_OK):
    temp_dir = "/tmp" if os.path.exists("/tmp") else tempfile.gettempdir()
    DB_PATH = os.path.join(temp_dir, "sih_database_py.sqlite")
    if not os.path.exists(DB_PATH) and os.path.exists(ORIGINAL_DB_PATH):
        try:
            shutil.copyfile(ORIGINAL_DB_PATH, DB_PATH)
        except Exception as e:
            print("[Database] Copy to temp dir note:", e)
else:
    DB_PATH = ORIGINAL_DB_PATH

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT DEFAULT 'demo123',
        role TEXT NOT NULL DEFAULT 'learner',
        avatar_url TEXT,
        department TEXT,
        region TEXT,
        designation TEXT,
        joined_at TEXT DEFAULT (datetime('now')),
        last_active TEXT DEFAULT (datetime('now'))
    );
    """)

    cursor.execute("""
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
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        context TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS competency_scores (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        skill TEXT NOT NULL,
        score REAL NOT NULL DEFAULT 0,
        target_score REAL NOT NULL DEFAULT 100,
        confidence REAL NOT NULL DEFAULT 0.5,
        evidence_source TEXT,
        assessed_at TEXT DEFAULT (datetime('now'))
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS skill_gaps (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        skill TEXT NOT NULL,
        gap_severity TEXT NOT NULL DEFAULT 'moderate',
        recommended_action TEXT,
        priority INTEGER DEFAULT 5,
        identified_at TEXT DEFAULT (datetime('now'))
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        file_type TEXT DEFAULT 'pdf',
        total_pages INTEGER DEFAULT 1,
        uploaded_by TEXT,
        uploaded_at TEXT DEFAULT (datetime('now'))
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS document_chunks (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        chunk_index INTEGER NOT NULL,
        page_number INTEGER DEFAULT 1,
        section_title TEXT,
        content TEXT NOT NULL,
        keywords TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS assessments (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        skill_area TEXT NOT NULL,
        description TEXT,
        total_questions INTEGER DEFAULT 10,
        time_limit_minutes INTEGER DEFAULT 30,
        created_at TEXT DEFAULT (datetime('now'))
    );
    """)

    cursor.execute("""
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
    );
    """)

    cursor.execute("""
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
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS question_attempts (
        id TEXT PRIMARY KEY,
        attempt_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        user_answer TEXT,
        is_correct INTEGER DEFAULT 0,
        time_spent_seconds INTEGER DEFAULT 0,
        difficulty_at_time TEXT,
        answered_at TEXT DEFAULT (datetime('now'))
    );
    """)

    cursor.execute("""
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
    );
    """)

    cursor.execute("""
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
    );
    """)

    cursor.execute("""
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
    );
    """)

    cursor.execute("""
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
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        action TEXT NOT NULL,
        entity_type TEXT,
        entity_id TEXT,
        details TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT,
        type TEXT DEFAULT 'info',
        is_read INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pdf_quizzes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        pdf_title TEXT NOT NULL,
        total_pages INTEGER DEFAULT 1,
        extracted_topics TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pdf_quiz_questions (
        id TEXT PRIMARY KEY,
        quiz_id TEXT NOT NULL,
        question_text TEXT NOT NULL,
        options TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        difficulty TEXT DEFAULT 'medium',
        explanation TEXT,
        distractor_analysis TEXT
    );
    """)

    conn.commit()

    # Seed if empty
    cursor.execute("SELECT COUNT(*) as c FROM users")
    if cursor.fetchone()['c'] == 0:
        seed_db(conn)

    conn.close()

def seed_db(conn):
    cursor = conn.cursor()
    print("[DB Python] Seeding database with initial sample records...")

    # Users
    users = [
        ('user-ananya', 'Ananya Sharma', 'ananya.sharma@gov.in', 'demo123', 'learner', '', 'Data Analytics Division', 'Delhi', 'Junior Data Analyst'),
        ('user-rajesh', 'Rajesh Kumar', 'rajesh.kumar@gov.in', 'demo123', 'learner', '', 'AI & ML Wing', 'Karnataka', 'ML Research Associate'),
        ('user-priya', 'Priya Menon', 'priya.menon@gov.in', 'demo123', 'learner', '', 'Statistical Bureau', 'Kerala', 'Statistical Officer'),
        ('user-trainer', 'Dr. Vikram Singh', 'vikram.singh@gov.in', 'demo123', 'trainer', '', 'Training Academy', 'Maharashtra', 'Senior Training Officer'),
        ('user-admin', 'Sunita Deshmukh', 'sunita.deshmukh@gov.in', 'demo123', 'admin', '', 'National Digital Skills Authority', 'Delhi', 'Program Director'),
    ]
    cursor.executemany("INSERT INTO users (id, name, email, password, role, avatar_url, department, region, designation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", users)

    # Competency Scores for Ananya
    scores = [
        (str(uuid.uuid4()), 'user-ananya', 'Python Programming', 72, 90, 0.85, 'Assessment + Training', '2026-09-12T18:00:00'),
        (str(uuid.uuid4()), 'user-ananya', 'SQL & Databases', 58, 85, 0.78, 'Assessment', '2026-09-12T18:00:00'),
        (str(uuid.uuid4()), 'user-ananya', 'Statistics & Probability', 65, 80, 0.72, 'Assessment', '2026-09-12T18:00:00'),
        (str(uuid.uuid4()), 'user-ananya', 'Data Modeling', 45, 85, 0.65, 'Assessment', '2026-09-12T18:00:00'),
        (str(uuid.uuid4()), 'user-ananya', 'Data Quality & Governance', 38, 75, 0.55, 'Self-assessment', '2026-09-12T18:00:00'),
        (str(uuid.uuid4()), 'user-ananya', 'Machine Learning', 52, 80, 0.68, 'Assessment + Practice', '2026-09-12T18:00:00'),
    ]
    cursor.executemany("INSERT INTO competency_scores (id, user_id, skill, score, target_score, confidence, evidence_source, assessed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", scores)

    # Gaps for Ananya
    gaps = [
        (str(uuid.uuid4()), 'user-ananya', 'Data Quality & Governance', 'critical', 'Complete Data Quality Fundamentals course + practice assessment', 1),
        (str(uuid.uuid4()), 'user-ananya', 'Data Modeling', 'high', 'Start ER Modeling workshop and complete training module', 2),
        (str(uuid.uuid4()), 'user-ananya', 'SQL & Databases', 'moderate', 'Practice advanced SQL queries - window functions and CTEs', 3),
        (str(uuid.uuid4()), 'user-ananya', 'Machine Learning', 'moderate', 'Review supervised learning concepts and complete exercises', 4),
    ]
    cursor.executemany("INSERT INTO skill_gaps (id, user_id, skill, gap_severity, recommended_action, priority) VALUES (?, ?, ?, ?, ?, ?)", gaps)

    # Documents
    docs = [
        ('doc-guidelines', 'National Data Analytics Guidelines 2026', 'Official government guidelines for data analytics competency development, assessment standards, and career frameworks.', 'pdf', 62, 'user-admin', '2026-09-12 18:00:00'),
        ('doc-python', 'Python Data Engineering Essentials', 'Comprehensive guide to data engineering with Python covering pandas, NumPy, data pipelines, and ETL processes.', 'pdf', 45, 'user-trainer', '2026-09-12 18:00:00'),
    ]
    cursor.executemany("INSERT INTO documents (id, title, description, file_type, total_pages, uploaded_by, uploaded_at) VALUES (?, ?, ?, ?, ?, ?, ?)", docs)

    # Chunks
    chunks = [
        (str(uuid.uuid4()), 'doc-guidelines', 0, 3, 'Competency Framework Architecture', 'The National Data Analytics Framework establishes a five-tier competency model ranging from Foundational Literacy to Strategic Advisory. Each tier defines observable behaviors, diagnostic thresholds, and minimum verified evidence sources. For Government Data Specialists, Tier 3 (Practitioner) requires demonstrated proficiency in SQL analytical queries, statistical anomaly detection, and automated reporting pipelines.', 'competency, framework, tier, proficiency, government'),
        (str(uuid.uuid4()), 'doc-guidelines', 1, 14, 'Data Quality and Governance Standards', 'Section 4 mandates that all administrative datasets conform to the National Data Quality Benchmark (NDQB). Five core dimensions are evaluated: completeness, uniqueness, timeliness, validity, and consistency. Automated anomaly detection scripts must run prior to cross-departmental data exchanges, ensuring null-value ratios remain below 0.5% for primary key identifiers.', 'data quality, governance, NDQB, validity, completeness'),
        (str(uuid.uuid4()), 'doc-python', 0, 8, 'Pandas Vectorized Transformations', 'Vectorized operations in pandas leverage underlying C and NumPy arrays to perform calculations simultaneously across entire Series, eliminating Python interpreter overhead. Using .apply() or row-level iteration creates performance bottlenecks. Prefer built-in numpy ufuncs, np.select(), and boolean masking for pipeline scalability.', 'pandas, vectorized, performance, numpy, transformations'),
        (str(uuid.uuid4()), 'doc-python', 1, 22, 'SQL Window Functions & Analytical Partitioning', 'Window functions perform calculations across a set of table rows that are related to the current row without grouping rows into a single output row. Crucial analytical functions include ROW_NUMBER(), RANK(), DENSE_RANK(), and LAG()/LEAD(). The OVER() clause with PARTITION BY and ORDER BY defines the analytical window partition.', 'SQL, window functions, partition, rank, analytics'),
    ]
    cursor.executemany("INSERT INTO document_chunks (id, document_id, chunk_index, page_number, section_title, content, keywords) VALUES (?, ?, ?, ?, ?, ?, ?)", chunks)

    # Assessments & Questions
    cursor.execute("""
    INSERT INTO assessments (id, title, skill_area, description, total_questions, time_limit_minutes) VALUES
    ('assess-sql', 'SQL & Databases Diagnostic', 'SQL & Databases', 'Adaptive assessment covering joins, aggregations, CTEs, and window functions.', 5, 15),
    ('assess-python', 'Python Data Engineering Diagnostic', 'Python Programming', 'Evaluates Python core, pandas, NumPy, and data manipulation mastery.', 5, 15)
    """)

    q_sql = [
        (str(uuid.uuid4()), 'assess-sql', 'Which SQL window function assigns ranks without leaving gaps between rank values in case of ties?', 'mcq', 'easy', 'SQL & Databases', json.dumps(['ROW_NUMBER()', 'RANK()', 'DENSE_RANK()', 'PERCENT_RANK()']), 'DENSE_RANK()', 'DENSE_RANK() ensures contiguous numbering without gaps, unlike RANK() which skips ranks after ties.', json.dumps({'RANK()': 'Skips numbers after ties (e.g., 1, 2, 2, 4)', 'ROW_NUMBER()': 'Assigns distinct sequential numbers regardless of ties'})),
        (str(uuid.uuid4()), 'assess-sql', 'What is the primary operational difference between WHERE and HAVING clauses in SQL?', 'mcq', 'medium', 'SQL & Databases', json.dumps(['WHERE filters grouped records; HAVING filters individual rows before grouping', 'WHERE filters individual rows prior to grouping; HAVING filters aggregate results after grouping', 'WHERE is only for numeric columns; HAVING is for strings', 'There is no difference; they are interchangeable']), 'WHERE filters individual rows prior to grouping; HAVING filters aggregate results after grouping', 'WHERE executes before aggregation (GROUP BY), while HAVING executes after GROUP BY on aggregated metrics.', json.dumps({'Interchangeable': 'WHERE cannot evaluate aggregate functions like SUM() or AVG()'})),
        (str(uuid.uuid4()), 'assess-sql', 'In a common table expression (CTE), which keyword initiates a recursive query definition?', 'mcq', 'hard', 'SQL & Databases', json.dumps(['LOOP WITH', 'WITH RECURSIVE', 'START RECURSION', 'ITERATE CTE']), 'WITH RECURSIVE', 'WITH RECURSIVE allows a CTE to reference itself iteratively for hierarchical or tree-structured datasets.', json.dumps({'LOOP WITH': 'Invalid SQL syntax', 'ITERATE CTE': 'Not a standard SQL command'})),
        (str(uuid.uuid4()), 'assess-sql', 'Which index type is best suited for columns containing low-cardinality values such as gender or status flags?', 'mcq', 'hard', 'SQL & Databases', json.dumps(['B-Tree Index', 'Bitmap Index', 'Hash Index', 'Spatial Index']), 'Bitmap Index', 'Bitmap indexes represent distinct values as bit arrays and provide high performance for low-cardinality columns.', json.dumps({'B-Tree Index': 'Optimized for high-cardinality columns with unique values', 'Hash Index': 'Used for exact equality lookups in memory'})),
        (str(uuid.uuid4()), 'assess-sql', 'What execution plan anomaly occurs when the database optimizer defaults to a nested loop join on large unindexed tables?', 'mcq', 'expert', 'SQL & Databases', json.dumps(['Index Thrashing', 'Cartesian Product Blowup', 'High Disk Spill & O(N*M) Execution Cost', 'Deadlock Escalation']), 'High Disk Spill & O(N*M) Execution Cost', 'A nested loop join without indexing performs an inner loop scan for each outer row, causing O(N*M) time complexity.', json.dumps({'Index Thrashing': 'Related to buffer cache cache-line contention'})),
    ]
    cursor.executemany("INSERT INTO assessment_questions (id, assessment_id, question_text, question_type, difficulty, skill_tag, options, correct_answer, explanation, distractor_analysis) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", q_sql)

    q_python = [
        (str(uuid.uuid4()), 'assess-python', 'What is the output of list(range(2, 10, 3)) in Python?', 'mcq', 'easy', 'Python Programming', json.dumps(['[2, 5, 8]', '[2, 4, 6, 8]', '[2, 5, 8, 11]', '[3, 6, 9]']), '[2, 5, 8]', 'range(2, 10, 3) generates integers starting from 2 up to 10 with step 3: 2, 5, 8.', json.dumps({'[2, 4, 6, 8]': 'Incorrect step', '[3, 6, 9]': 'Incorrect start'})),
        (str(uuid.uuid4()), 'assess-python', 'Which pandas method is used to merge two DataFrames based on a common key or column?', 'mcq', 'easy', 'Python Programming', json.dumps(['df.merge()', 'df.concat()', 'df.append()', 'df.combine_keys()']), 'df.merge()', 'df.merge() performs database-style joins on common columns or indexes.', json.dumps({'df.concat()': 'Stacks DataFrames along an axis'})),
        (str(uuid.uuid4()), 'assess-python', 'What does a Python decorator fundamentally do?', 'mcq', 'medium', 'Python Programming', json.dumps(['A function that takes another function and extends its behavior without modifying it', 'A special class inheritance syntax', 'A memory management garbage collection flag', 'A method for multithreaded lock acquisition']), 'A function that takes another function and extends its behavior without modifying it', 'Decorators wrap a function to extend or alter its behavior using @decorator syntax.', json.dumps({'Class syntax': 'Uses class keyword'})),
        (str(uuid.uuid4()), 'assess-python', 'In pandas, what is returned by df.groupby("dept")["salary"].transform("mean")?', 'mcq', 'medium', 'Python Programming', json.dumps(['A Series with the same index as the original DataFrame containing group mean for each row', 'A grouped DataFrame indexed by dept', 'A single floating point number', 'An array of tuples']), 'A Series with the same index as the original DataFrame containing group mean for each row', 'transform() computes the aggregated value per group and broadcasts it back to align with the original DataFrame index.', json.dumps({'agg()': 'agg reduces to one row per group'})),
        (str(uuid.uuid4()), 'assess-python', 'In NumPy, how does broadcasting operate when performing element-wise operations on arrays of different shapes?', 'mcq', 'medium', 'Python Programming', json.dumps(['It stretches smaller array dimensions along size-1 axes to match larger dimensions without copying memory', 'It flattens both arrays into 1D vectors', 'It pads arrays with random noise', 'It requires an external C++ compiler']), 'It stretches smaller array dimensions along size-1 axes to match larger dimensions without copying memory', 'NumPy broadcasting virtually stretches singleton axes to achieve compatible shapes efficiently.', json.dumps({'Flattens': 'Broadcasting preserves dimensionality'})),
        (str(uuid.uuid4()), 'assess-python', 'What is the average time complexity of key lookup in a standard Python dictionary?', 'mcq', 'hard', 'Python Programming', json.dumps(['O(1)', 'O(log n)', 'O(n)', 'O(n^2)']), 'O(1)', 'Python dictionaries are hash tables offering O(1) average time complexity for lookups.', json.dumps({'O(log n)': 'Tree-based structures', 'O(n)': 'Extreme collision only'})),
        (str(uuid.uuid4()), 'assess-python', 'What is the primary operational difference between __new__ and __init__ in Python OOP?', 'mcq', 'hard', 'Python Programming', json.dumps(['__new__ is a static constructor that creates and returns the instance; __init__ initializes instance attributes', '__init__ allocates memory; __new__ is called on destruction', 'They are exact synonyms and can be used interchangeably', '__new__ can only be defined in metaclasses']), '__new__ is a static constructor that creates and returns the instance; __init__ initializes instance attributes', '__new__ is the constructor returning a new instance of cls; __init__ initializes self.', json.dumps({'Synonyms': '__new__ returns a value; __init__ returns None'})),
        (str(uuid.uuid4()), 'assess-python', 'What is the Global Interpreter Lock (GIL) in CPython and how does it affect CPU-bound multithreading?', 'mcq', 'expert', 'Python Programming', json.dumps(['It is a mutex that prevents multiple native OS threads from executing Python bytecodes concurrently', 'It is an OS process scheduler', 'It automatically compiles Python to GPU shaders', 'It disables all asynchronous I/O']), 'It is a mutex that prevents multiple native OS threads from executing Python bytecodes concurrently', 'The GIL ensures only one thread executes CPython bytecodes at a time, so CPU-bound parallelism requires multiprocessing.', json.dumps({'Scheduler': 'GIL is an internal CPython mutex, not OS scheduler'}))
    ]
    cursor.executemany("INSERT INTO assessment_questions (id, assessment_id, question_text, question_type, difficulty, skill_tag, options, correct_answer, explanation, distractor_analysis) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", q_python)

    # Training Modules
    cursor.execute("""
    INSERT INTO training_modules (id, title, skill_area, difficulty, description, lesson_content, worked_example, exercise_prompt, exercise_template, test_cases, hints, estimated_minutes) VALUES
    ('train-sql-window', 'SQL Window Functions Mastery', 'SQL & Databases', 'intermediate',
     'Master SQL window functions including ROW_NUMBER, RANK, LAG, LEAD, and running aggregates.',
     'Window functions compute calculations across related table partitions while preserving individual rows. The OVER clause defines the partitioning and ordering.',
     'SELECT department_id, employee_name, salary, RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as rank FROM employees;',
     'Write a query to calculate the cumulative revenue per department using SUM() OVER (PARTITION BY dept_id ORDER BY order_date).',
     'SELECT dept_id, order_date, revenue, SUM(revenue) OVER (PARTITION BY dept_id ORDER BY order_date) as cumulative_revenue FROM orders;',
     '["SUM(revenue) OVER", "PARTITION BY", "ORDER BY"]',
     '["Use SUM(revenue) as the window function", "Partition by dept_id inside the OVER() clause", "Order by order_date to compute the running sum"]',
     30),
    ('train-python-pipeline', 'Python Data Pipeline Fundamentals', 'Python Programming', 'intermediate',
     'Build robust data pipelines using Python, pandas, and functional programming patterns.',
     'Data pipelines extract, transform, and load (ETL) data using efficient vectorized operations in pandas rather than row-by-row iteration.',
     'def clean_pipeline(df):\n    df = df.dropna(subset=[\"id\"])\n    df[\"normalized_val\"] = (df[\"val\"] - df[\"val\"].mean()) / df[\"val\"].std()\n    return df',
     'Implement a function process_records(df) that drops duplicates based on \"id\" and filters records where \"score\" >= 50.',
     'def process_records(df):\n    # Write data processing pipeline\n    clean_df = df.drop_duplicates(subset=[\"id\"])\n    result = clean_df[clean_df[\"score\"] >= 50]\n    return result',
     '["drop_duplicates", "score", "50"]',
     '["Call df.drop_duplicates(subset=[\'id\'])", "Apply boolean filter clean_df[clean_df[\'score\'] >= 50]", "Return the filtered DataFrame result"]',
     35)
    """)

    # Career Predictions
    cursor.execute("""
    INSERT INTO career_predictions (id, user_id, career_path, current_readiness, target_readiness, projected_readiness, timeline_months, confidence, weight_breakdown) VALUES
    ('pred-ananya-da', 'user-ananya', 'Senior Data Analyst', 68, 85, 88, 6, 0.88,
     '[{"skill":"SQL & Databases","weight":0.3,"userScore":58},{"skill":"Python Programming","weight":0.25,"userScore":72},{"skill":"Statistics & Probability","weight":0.2,"userScore":65},{"skill":"Data Quality & Governance","weight":0.15,"userScore":38},{"skill":"Data Modeling","weight":0.1,"userScore":45}]'),
    ('pred-ananya-ds', 'user-ananya', 'Data Scientist', 62, 90, 85, 8, 0.84,
     '[{"skill":"Statistics & Probability","weight":0.3,"userScore":65},{"skill":"Machine Learning","weight":0.25,"userScore":52},{"skill":"Python Programming","weight":0.25,"userScore":72},{"skill":"Data Modeling","weight":0.2,"userScore":45}]'),
    ('pred-ananya-ml', 'user-ananya', 'Machine Learning Engineer', 56, 85, 82, 10, 0.82,
     '[{"skill":"Python Programming","weight":0.35,"userScore":72},{"skill":"Machine Learning","weight":0.3,"userScore":52},{"skill":"Statistics & Probability","weight":0.2,"userScore":65},{"skill":"SQL & Databases","weight":0.15,"userScore":58}]')
    """)

    # Regional Telemetry for Indian States
    regional = [
        ('reg-dl', 'Delhi', 'DL', 'All Areas', 72, 'moderate', 4200, 12.4),
        ('reg-ka', 'Karnataka', 'KA', 'All Areas', 78, 'low', 8900, 15.2),
        ('reg-mh', 'Maharashtra', 'MH', 'All Areas', 74, 'moderate', 7600, 14.1),
        ('reg-tn', 'Tamil Nadu', 'TN', 'All Areas', 71, 'moderate', 6100, 11.8),
        ('reg-ts', 'Telangana', 'TS', 'All Areas', 69, 'moderate', 5200, 13.5),
        ('reg-up', 'Uttar Pradesh', 'UP', 'All Areas', 52, 'critical', 12400, 8.2),
        ('reg-br', 'Bihar', 'BR', 'All Areas', 48, 'critical', 9800, 6.9),
        ('reg-wb', 'West Bengal', 'WB', 'All Areas', 59, 'high', 5900, 9.4),
        ('reg-rj', 'Rajasthan', 'RJ', 'All Areas', 54, 'high', 4800, 7.8),
        ('reg-mp', 'Madhya Pradesh', 'MP', 'All Areas', 56, 'high', 6300, 8.9),
        ('reg-gj', 'Gujarat', 'GJ', 'All Areas', 67, 'moderate', 5100, 10.5),
        ('reg-kl', 'Kerala', 'KL', 'All Areas', 76, 'low', 3400, 13.9),
    ]
    cursor.executemany("INSERT INTO regional_skill_analytics (id, state_name, state_code, skill_area, avg_competency, gap_severity, learner_count, improvement_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", regional)

    # Initial Learning Sessions & History
    cursor.execute("""
    INSERT INTO learning_sessions (id, user_id, session_type, title, description, started_at, duration_minutes) VALUES
    ('sess-1', 'user-ananya', 'assessment', 'Python Core Diagnostic Attempt 1', 'Scored 72% in diagnostic evaluation', '2026-09-12 18:30:00', 15),
    ('sess-2', 'user-ananya', 'training', 'SQL Window Functions Lab', 'Completed worked example on analytical partitioning', '2026-09-12 17:15:00', 30),
    ('sess-3', 'user-ananya', 'rag_tutor', 'Consulted Guidelines for Data Quality', 'Reviewed National Data Quality Benchmark rules', '2026-09-12 16:00:00', 20)
    """)

    conn.commit()
    print("[DB Python] Seeding complete.")
