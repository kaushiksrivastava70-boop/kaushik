const { getDb, saveDb, queryAll, queryOne, runSql } = require('./db');
const { v4: uuidv4 } = require('uuid');

function seedDatabase() {
  const db = getDb();

  // Check if already seeded
  const existing = queryAll('SELECT COUNT(*) as c FROM users');
  if (existing.length > 0 && existing[0].c > 0) {
    console.log('[Seed] Database already has data, skipping seed.');
    return;
  }

  console.log('[Seed] Seeding database with sample data...');

  // ── Users ──
  const users = [
    ['user-ananya', 'Ananya Sharma', 'ananya.sharma@gov.in', 'learner', '', 'Data Analytics Division', 'Delhi', 'Junior Data Analyst'],
    ['user-rajesh', 'Rajesh Kumar', 'rajesh.kumar@gov.in', 'learner', '', 'AI & ML Wing', 'Karnataka', 'ML Research Associate'],
    ['user-priya', 'Priya Menon', 'priya.menon@gov.in', 'learner', '', 'Statistical Bureau', 'Kerala', 'Statistical Officer'],
    ['user-trainer', 'Dr. Vikram Singh', 'vikram.singh@gov.in', 'trainer', '', 'Training Academy', 'Maharashtra', 'Senior Training Officer'],
    ['user-admin', 'Sunita Deshmukh', 'sunita.deshmukh@gov.in', 'admin', '', 'National Digital Skills Authority', 'Delhi', 'Program Director'],
  ];

  for (const u of users) {
    runSql('INSERT INTO users (id, name, email, role, avatar_url, department, region, designation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', u);
  }

  // ── Competency Scores ──
  function insertScore(userId, skill, score, target, confidence, evidence, date) {
    runSql('INSERT INTO competency_scores (id, user_id, skill, score, target_score, confidence, evidence_source, assessed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [uuidv4(), userId, skill, score, target, confidence, evidence, date]);
  }

  // Ananya - current
  insertScore('user-ananya', 'Python Programming', 72, 90, 0.85, 'Assessment + Training', '2026-09-12T18:00:00');
  insertScore('user-ananya', 'SQL & Databases', 58, 85, 0.78, 'Assessment', '2026-09-12T18:00:00');
  insertScore('user-ananya', 'Statistics & Probability', 65, 80, 0.72, 'Assessment', '2026-09-12T18:00:00');
  insertScore('user-ananya', 'Data Modeling', 45, 85, 0.65, 'Assessment', '2026-09-12T18:00:00');
  insertScore('user-ananya', 'Data Quality & Governance', 38, 75, 0.55, 'Self-assessment', '2026-09-12T18:00:00');
  insertScore('user-ananya', 'Machine Learning', 52, 80, 0.68, 'Assessment + Practice', '2026-09-12T18:00:00');

  // Ananya - 2 months ago
  insertScore('user-ananya', 'Python Programming', 55, 85, 0.5, 'Initial Assessment', '2026-07-15T10:00:00');
  insertScore('user-ananya', 'SQL & Databases', 40, 85, 0.5, 'Initial Assessment', '2026-07-15T10:00:00');
  insertScore('user-ananya', 'Statistics & Probability', 50, 85, 0.5, 'Initial Assessment', '2026-07-15T10:00:00');
  insertScore('user-ananya', 'Data Modeling', 30, 85, 0.5, 'Initial Assessment', '2026-07-15T10:00:00');
  insertScore('user-ananya', 'Data Quality & Governance', 25, 85, 0.5, 'Initial Assessment', '2026-07-15T10:00:00');
  insertScore('user-ananya', 'Machine Learning', 35, 85, 0.5, 'Initial Assessment', '2026-07-15T10:00:00');

  // Ananya - 1 month ago
  insertScore('user-ananya', 'Python Programming', 63, 85, 0.6, 'Mid-term Assessment', '2026-08-15T10:00:00');
  insertScore('user-ananya', 'SQL & Databases', 48, 85, 0.6, 'Mid-term Assessment', '2026-08-15T10:00:00');
  insertScore('user-ananya', 'Statistics & Probability', 58, 85, 0.6, 'Mid-term Assessment', '2026-08-15T10:00:00');
  insertScore('user-ananya', 'Data Modeling', 38, 85, 0.6, 'Mid-term Assessment', '2026-08-15T10:00:00');
  insertScore('user-ananya', 'Data Quality & Governance', 32, 85, 0.6, 'Mid-term Assessment', '2026-08-15T10:00:00');
  insertScore('user-ananya', 'Machine Learning', 44, 85, 0.6, 'Mid-term Assessment', '2026-08-15T10:00:00');

  // Rajesh
  insertScore('user-rajesh', 'Python Programming', 85, 95, 0.9, 'Assessment + Projects', '2026-09-10T14:00:00');
  insertScore('user-rajesh', 'SQL & Databases', 70, 85, 0.8, 'Assessment', '2026-09-10T14:00:00');
  insertScore('user-rajesh', 'Statistics & Probability', 78, 90, 0.82, 'Assessment', '2026-09-10T14:00:00');
  insertScore('user-rajesh', 'Data Modeling', 68, 90, 0.75, 'Assessment', '2026-09-10T14:00:00');
  insertScore('user-rajesh', 'Data Quality & Governance', 55, 75, 0.65, 'Assessment', '2026-09-10T14:00:00');
  insertScore('user-rajesh', 'Machine Learning', 82, 95, 0.88, 'Assessment + Research', '2026-09-10T14:00:00');

  // Priya
  insertScore('user-priya', 'Python Programming', 60, 80, 0.7, 'Assessment', '2026-09-11T11:00:00');
  insertScore('user-priya', 'SQL & Databases', 75, 85, 0.82, 'Assessment + Practice', '2026-09-11T11:00:00');
  insertScore('user-priya', 'Statistics & Probability', 88, 90, 0.92, 'Assessment + Publications', '2026-09-11T11:00:00');
  insertScore('user-priya', 'Data Modeling', 70, 85, 0.78, 'Assessment', '2026-09-11T11:00:00');
  insertScore('user-priya', 'Data Quality & Governance', 65, 80, 0.72, 'Assessment', '2026-09-11T11:00:00');
  insertScore('user-priya', 'Machine Learning', 45, 75, 0.6, 'Self-assessment', '2026-09-11T11:00:00');

  // ── Skill Gaps ──
  runSql('INSERT INTO skill_gaps (id, user_id, skill, gap_severity, recommended_action, priority) VALUES (?, ?, ?, ?, ?, ?)',
    [uuidv4(), 'user-ananya', 'Data Quality & Governance', 'critical', 'Complete Data Quality Fundamentals course + practice assessment', 1]);
  runSql('INSERT INTO skill_gaps (id, user_id, skill, gap_severity, recommended_action, priority) VALUES (?, ?, ?, ?, ?, ?)',
    [uuidv4(), 'user-ananya', 'Data Modeling', 'high', 'Start ER Modeling workshop and complete training module', 2]);
  runSql('INSERT INTO skill_gaps (id, user_id, skill, gap_severity, recommended_action, priority) VALUES (?, ?, ?, ?, ?, ?)',
    [uuidv4(), 'user-ananya', 'SQL & Databases', 'moderate', 'Practice advanced SQL queries - window functions and CTEs', 3]);
  runSql('INSERT INTO skill_gaps (id, user_id, skill, gap_severity, recommended_action, priority) VALUES (?, ?, ?, ?, ?, ?)',
    [uuidv4(), 'user-ananya', 'Machine Learning', 'moderate', 'Review supervised learning concepts and complete exercises', 4]);

  // ── Documents & Chunks ──
  runSql('INSERT INTO documents (id, title, description, file_type, total_pages, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
    ['doc-python', 'Python Data Engineering Essentials', 'Comprehensive guide to data engineering with Python covering pandas, NumPy, data pipelines, and ETL processes.', 'pdf', 45, 'user-trainer']);

  const pythonChunks = [
    [1, 'Introduction to Data Engineering', 'Data engineering is the practice of designing and building systems for collecting, storing, and analyzing data at scale. Python has emerged as the dominant language in data engineering due to its rich ecosystem of libraries including pandas, NumPy, Apache Airflow, and PySpark. A data engineer must understand data modeling, ETL pipelines, data warehousing, and data quality assurance.', 'data engineering,python,pandas,numpy,etl'],
    [3, 'Pandas DataFrame Operations', 'The pandas DataFrame is the fundamental data structure for data manipulation in Python. Key operations include: df.groupby() for aggregation, df.merge() for joins, df.pivot_table() for reshaping, and df.apply() for custom transformations. Method chaining allows for readable data pipelines: df.dropna().groupby("category").agg({"value": "mean"}).reset_index().sort_values("value", ascending=False).', 'pandas,dataframe,groupby,merge,pivot'],
    [5, 'NumPy for Numerical Computing', 'NumPy provides the foundation for numerical computing in Python. Key concepts include: ndarray for multi-dimensional arrays, broadcasting for element-wise operations, vectorized operations for performance, and linear algebra functions. Example: np.dot(A, B) computes matrix multiplication, while np.linalg.inv(A) computes the matrix inverse.', 'numpy,arrays,broadcasting,vectorization,linear algebra'],
    [8, 'ETL Pipeline Design', 'ETL (Extract, Transform, Load) pipelines are the backbone of data engineering. Best practices include: (1) Idempotent operations that can be safely re-run, (2) Schema validation at ingestion using libraries like Pydantic or Great Expectations, (3) Incremental loading to avoid full table scans, (4) Error handling with dead-letter queues, (5) Monitoring and alerting using structured logging.', 'etl,pipeline,extract,transform,load,idempotent'],
    [12, 'Data Quality Frameworks', 'Data quality is measured across six dimensions: Completeness (no missing values), Accuracy (correct values), Consistency (uniform formats), Timeliness (up-to-date), Validity (conforms to rules), and Uniqueness (no duplicates). Python tools for data quality include Great Expectations for validation rules, pandas-profiling for automated EDA, and custom assertion frameworks.', 'data quality,completeness,accuracy,consistency,validation'],
    [15, 'Window Functions in SQL', 'Window functions perform calculations across a set of table rows related to the current row. Common patterns: ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) assigns rank within each department. LAG() and LEAD() access previous/next row values. Running totals: SUM(amount) OVER (ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW). Window functions do not collapse rows like GROUP BY.', 'sql,window functions,row_number,partition,lag,lead'],
    [20, 'Machine Learning Pipeline Integration', 'Integrating ML models into data pipelines requires: (1) Feature engineering as reproducible transformations, (2) Model versioning using MLflow or DVC, (3) A/B testing infrastructure, (4) Model monitoring for data drift using statistical tests like KS-test or PSI. Python libraries: scikit-learn for classical ML, XGBoost for gradient boosting, and SHAP for model explainability.', 'machine learning,pipeline,feature engineering,mlflow,model monitoring'],
  ];

  pythonChunks.forEach((c, i) => {
    runSql('INSERT INTO document_chunks (id, document_id, chunk_index, page_number, section_title, content, keywords) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [uuidv4(), 'doc-python', i, c[0], c[1], c[2], c[3]]);
  });

  runSql('INSERT INTO documents (id, title, description, file_type, total_pages, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
    ['doc-guidelines', 'National Data Analytics Guidelines 2026', 'Official government guidelines for data analytics competency development, assessment standards, and career frameworks.', 'pdf', 62, 'user-admin']);

  const guidelinesChunks = [
    [1, 'Vision & Objectives', 'The National Data Analytics Guidelines establish a standardized competency framework for government employees working in data-intensive roles. The framework defines six core competency areas: Programming (Python/R), Database Management (SQL), Statistical Analysis, Data Modeling & Architecture, Data Quality & Governance, and Machine Learning & AI. Each competency is assessed on a scale of 0-100 with defined proficiency bands.', 'competency framework,government,data analytics,guidelines'],
    [5, 'Proficiency Bands', 'Proficiency is categorized into five bands: Foundational (0-30): Basic awareness of concepts. Developing (31-50): Can perform simple tasks with guidance. Competent (51-70): Can work independently on standard tasks. Proficient (71-85): Can handle complex problems and mentor others. Expert (86-100): Thought leader, can innovate and set standards. Promotion eligibility requires Competent level in at least 4 of 6 core areas.', 'proficiency bands,foundational,developing,competent,proficient,expert'],
    [10, 'Assessment Methodology', 'Assessments must be adaptive, adjusting difficulty based on learner performance. The recommended approach uses Item Response Theory (IRT) with a 3-parameter logistic model. Questions are tagged with difficulty, discrimination, and guessing parameters. Adaptive selection maximizes Fisher information at the current ability estimate. Minimum 15 questions per assessment with convergence criterion.', 'adaptive assessment,IRT,item response theory,difficulty,assessment methodology'],
    [15, 'Career Pathways', 'Five primary career pathways are defined: (1) Data Analyst - focuses on descriptive analytics and visualization, (2) Data Scientist - emphasizes statistical modeling and ML, (3) ML Engineer - specializes in model deployment and MLOps, (4) AI Engineer - focuses on deep learning and NLP applications, (5) Statistical Officer - emphasizes survey design and official statistics.', 'career pathways,data analyst,data scientist,ml engineer,ai engineer,statistical officer'],
    [22, 'Competency Digital Twin', 'Each learner maintains a Competency Digital Twin - a real-time digital representation of their skills, knowledge gaps, and learning trajectory. The twin is updated after every assessment, training completion, and project evaluation. It serves as the basis for personalized learning recommendations and career readiness predictions.', 'digital twin,competency,real-time,learning trajectory,personalized'],
    [30, 'Regional Skill Development Strategy', 'India is divided into six skill development zones: North (Delhi, UP, Haryana, Punjab, Rajasthan), South (Karnataka, Tamil Nadu, Kerala, AP, Telangana), East (West Bengal, Bihar, Odisha, Jharkhand), West (Maharashtra, Gujarat, Goa, MP), Northeast (Assam, Meghalaya, Tripura, Manipur, Mizoram, Nagaland, Arunachal Pradesh, Sikkim), and Central (Chhattisgarh, Uttarakhand, HP).', 'regional,skill development,zones,india,states'],
  ];

  guidelinesChunks.forEach((c, i) => {
    runSql('INSERT INTO document_chunks (id, document_id, chunk_index, page_number, section_title, content, keywords) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [uuidv4(), 'doc-guidelines', i, c[0], c[1], c[2], c[3]]);
  });

  // ── Assessments & Questions ──
  runSql('INSERT INTO assessments (id, title, skill_area, description, total_questions, time_limit_minutes) VALUES (?, ?, ?, ?, ?, ?)',
    ['assess-python', 'Python Programming Proficiency', 'Python Programming', 'Adaptive assessment covering Python fundamentals, data structures, pandas, and data engineering concepts.', 20, 30]);

  const pythonQuestions = [
    ['What is the output of: list(range(2, 10, 3))?', 'easy', 'Python Basics', JSON.stringify(['[2, 5, 8]', '[2, 4, 6, 8]', '[2, 5, 8, 11]', '[3, 6, 9]']), '[2, 5, 8]', 'range(2, 10, 3) generates numbers starting at 2, up to (not including) 10, stepping by 3: 2, 5, 8.', JSON.stringify({'[2, 4, 6, 8]': 'Confuses step=3 with step=2', '[2, 5, 8, 11]': 'Forgets range stops before end value', '[3, 6, 9]': 'Uses step as start value'})],
    ['Which pandas method is used to combine DataFrames based on a common column?', 'easy', 'Pandas', JSON.stringify(['df.merge()', 'df.concat()', 'df.append()', 'df.join_column()']), 'df.merge()', 'df.merge() performs SQL-style joins on common columns.', JSON.stringify({'df.concat()': 'concat stacks along an axis', 'df.append()': 'append adds rows, deprecated', 'df.join_column()': 'Does not exist'})],
    ['What is a Python decorator?', 'medium', 'Python Advanced', JSON.stringify(["A function that modifies another function's behavior", 'A class inheritance mechanism', 'A way to declare variables', 'A type of loop construct']), "A function that modifies another function's behavior", 'Decorators are functions that take another function and extend its behavior using @decorator syntax.', JSON.stringify({'A class inheritance mechanism': 'Uses class keyword', 'A way to declare variables': 'Variables use assignment', 'A type of loop construct': 'Loops use for/while'})],
    ['What does df.groupby("category").agg({"value": ["mean", "std"]}) return?', 'medium', 'Pandas', JSON.stringify(['A DataFrame with multi-level columns showing mean and std per category', 'A single number', 'An error', 'A Series with category as values']), 'A DataFrame with multi-level columns showing mean and std per category', 'Passing a dictionary with list of functions creates a MultiIndex column DataFrame.', JSON.stringify({'A single number': 'groupby preserves groups', 'An error': 'Valid pandas syntax', 'A Series': 'Multiple aggregations produce DataFrame'})],
    ['In NumPy, what is broadcasting?', 'medium', 'NumPy', JSON.stringify(['Automatically expanding array dimensions for element-wise operations', 'Sending arrays across a network', 'A method for parallel computing', 'Converting arrays to different types']), 'Automatically expanding array dimensions for element-wise operations', 'Broadcasting allows element-wise operations on arrays of different shapes by virtually expanding the smaller array.', JSON.stringify({'Sending arrays': 'Mathematical concept, not networking', 'Parallel computing': 'Different mechanisms', 'Converting arrays': 'Uses astype()'})],
    ['What is the time complexity of Python dictionary lookup?', 'hard', 'Python Advanced', JSON.stringify(['O(1) average case', 'O(n)', 'O(log n)', 'O(n²)']), 'O(1) average case', 'Python dictionaries use hash tables for O(1) average-case lookup.', JSON.stringify({'O(n)': 'Only worst case with many collisions', 'O(log n)': 'For balanced trees', 'O(n²)': 'No standard structure has this'})],
    ['What is the difference between __init__ and __new__?', 'hard', 'Python OOP', JSON.stringify(['__new__ creates the instance, __init__ initializes it', '__init__ creates, __new__ initializes', 'They are aliases', '__new__ is only for metaclasses']), '__new__ creates the instance, __init__ initializes it', '__new__ is a static method that creates and returns a new instance, __init__ initializes attributes.', JSON.stringify({'Reversed': 'Common misconception', 'Aliases': 'Different methods', 'Only metaclasses': 'Can be used in any class'})],
    ['What is the GIL in Python?', 'expert', 'Python Internals', JSON.stringify(['A mutex preventing true parallel execution of Python bytecode in CPython', 'A garbage collection mechanism', 'A global import lock', 'A debugging interface']), 'A mutex preventing true parallel execution of Python bytecode in CPython', 'The GIL ensures only one thread executes Python bytecode at a time in CPython.', JSON.stringify({'Garbage collection': 'GC is separate', 'Import lock': 'Different from GIL', 'Debugging': 'Uses pdb/sys.settrace'})],
  ];

  for (const q of pythonQuestions) {
    runSql('INSERT INTO assessment_questions (id, assessment_id, question_text, difficulty, skill_tag, options, correct_answer, explanation, distractor_analysis) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [uuidv4(), 'assess-python', ...q]);
  }

  // SQL Assessment
  runSql('INSERT INTO assessments (id, title, skill_area, description, total_questions, time_limit_minutes) VALUES (?, ?, ?, ?, ?, ?)',
    ['assess-sql', 'SQL & Database Management', 'SQL & Databases', 'Adaptive assessment covering SQL queries, joins, window functions, and database design.', 20, 30]);

  const sqlQuestions = [
    ['What is the difference between WHERE and HAVING?', 'easy', 'SQL Basics', JSON.stringify(['WHERE filters before grouping, HAVING filters after', 'They are interchangeable', 'WHERE for SELECT, HAVING for INSERT', 'HAVING is deprecated']), 'WHERE filters before grouping, HAVING filters after', 'WHERE filters individual rows before GROUP BY. HAVING filters groups after aggregation.', JSON.stringify({'Interchangeable': 'Different stages', 'SELECT vs INSERT': 'Both for SELECT', 'Deprecated': 'Still standard SQL'})],
    ['What does ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) do?', 'medium', 'Window Functions', JSON.stringify(['Assigns sequential numbers within each department', 'Counts total rows', 'Calculates running total', 'Deletes duplicates']), 'Assigns sequential numbers within each department', 'ROW_NUMBER() assigns a unique sequential integer within a partition.', JSON.stringify({'Counts': 'COUNT() counts', 'Running total': 'SUM() OVER does that', 'Deletes': 'Window functions dont modify data'})],
    ['What is a CTE and when to use one?', 'hard', 'Advanced SQL', JSON.stringify(['A named temporary result set with WITH clause', 'A permanent caching table', 'A stored procedure', 'An index type']), 'A named temporary result set with WITH clause', 'CTEs define named temporary result sets for readability and recursion.', JSON.stringify({'Permanent table': 'Exists only during query', 'Stored procedure': 'Part of a query', 'Index': 'Physical vs logical'})],
    ['Explain INNER JOIN, LEFT JOIN, and CROSS JOIN.', 'medium', 'SQL Joins', JSON.stringify(['INNER=matching, LEFT=all left+matching right, CROSS=cartesian', 'All return same results', 'LEFT is faster than INNER', 'CROSS requires join condition']), 'INNER=matching, LEFT=all left+matching right, CROSS=cartesian', 'INNER JOIN returns matched rows. LEFT JOIN all left with NULLs for unmatched right. CROSS JOIN is cartesian product.', JSON.stringify({'Same results': 'Different result sets', 'LEFT faster': 'Depends on data', 'CROSS needs condition': 'Intentionally no condition'})],
  ];

  for (const q of sqlQuestions) {
    runSql('INSERT INTO assessment_questions (id, assessment_id, question_text, difficulty, skill_tag, options, correct_answer, explanation, distractor_analysis) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [uuidv4(), 'assess-sql', ...q]);
  }

  // ── Assessment Attempts ──
  runSql('INSERT INTO assessment_attempts (id, user_id, assessment_id, score, total_questions, correct_count, difficulty_progression, time_taken_seconds, started_at, completed_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ['attempt-a1', 'user-ananya', 'assess-python', 65, 8, 5, JSON.stringify(['easy','easy','medium','medium','hard','medium','medium','hard']), 1200, '2026-08-20T10:00:00', '2026-08-20T10:20:00', 'completed']);
  runSql('INSERT INTO assessment_attempts (id, user_id, assessment_id, score, total_questions, correct_count, difficulty_progression, time_taken_seconds, started_at, completed_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ['attempt-a2', 'user-ananya', 'assess-python', 72, 8, 6, JSON.stringify(['easy','medium','medium','hard','medium','hard','hard','expert']), 1080, '2026-09-05T14:00:00', '2026-09-05T14:18:00', 'completed']);
  runSql('INSERT INTO assessment_attempts (id, user_id, assessment_id, score, total_questions, correct_count, difficulty_progression, time_taken_seconds, started_at, completed_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ['attempt-a3', 'user-ananya', 'assess-sql', 55, 8, 4, JSON.stringify(['easy','easy','medium','medium','hard','medium','easy','medium']), 1350, '2026-09-01T11:00:00', '2026-09-01T11:22:00', 'completed']);

  // ── Training Modules ──
  runSql(`INSERT INTO training_modules (id, title, skill_area, difficulty, description, lesson_content, worked_example, exercise_prompt, exercise_template, test_cases, hints, estimated_minutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['train-sql-window', 'SQL Window Functions Mastery', 'SQL & Databases', 'intermediate',
    'Master SQL window functions including ROW_NUMBER, RANK, LAG, LEAD, and running aggregates.',
    '# SQL Window Functions\n\nWindow functions perform calculations across a set of table rows related to the current row.\n\n## Key Concepts\n1. **OVER clause**: Defines the window\n2. **PARTITION BY**: Divides rows into groups\n3. **ORDER BY**: Defines order within partition\n4. **Frame specification**: Defines which rows to include\n\n## Common Functions\n- ROW_NUMBER(): Sequential number\n- RANK(): Rank with gaps\n- DENSE_RANK(): Rank without gaps\n- LAG(col, n): Previous row value\n- LEAD(col, n): Next row value\n- SUM/AVG/COUNT() OVER: Running aggregates',
    '-- Top 2 paid employees per department\nSELECT name, department, salary,\n  ROW_NUMBER() OVER (\n    PARTITION BY department\n    ORDER BY salary DESC\n  ) as rank_in_dept\nFROM employees\nWHERE rank_in_dept <= 2;',
    'Write a SQL query that calculates the running average salary within each department, ordered by hire_date.',
    'SELECT name, department, salary, hire_date,\n  _______ as running_avg_salary,\n  _______ as salary_diff_from_prev\nFROM employees\nORDER BY department, hire_date;',
    JSON.stringify([{input: '3 departments, 3 employees each', expected: 'Running averages calculated correctly'}, {input: 'Single employee department', expected: 'Average equals own salary'}]),
    JSON.stringify(['Use AVG(salary) OVER with PARTITION BY department', 'Add ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW', 'Use LAG(salary, 1) OVER (PARTITION BY department ORDER BY hire_date)']),
    30]);

  runSql(`INSERT INTO training_modules (id, title, skill_area, difficulty, description, lesson_content, worked_example, exercise_prompt, exercise_template, test_cases, hints, estimated_minutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['train-python-pipeline', 'Python Data Pipeline Fundamentals', 'Python Programming', 'intermediate',
    'Build robust data pipelines using Python, pandas, and functional programming patterns.',
    '# Python Data Pipelines\n\nData pipelines transform raw data into clean, analysis-ready datasets.\n\n## Principles\n1. **Idempotency**: Same result on re-run\n2. **Modularity**: Separate, testable functions\n3. **Error Handling**: Graceful failure\n4. **Logging**: Track what happened',
    'import pandas as pd\n\ndef remove_duplicates(df):\n    return df.drop_duplicates(subset=["employee_id"])\n\ndef fill_missing_salaries(df):\n    median = df.groupby("department")["salary"].transform("median")\n    df["salary"] = df["salary"].fillna(median)\n    return df',
    'Create a pipeline: remove negatives, add quarter column, cumulative sales per region, flag outliers.',
    'def remove_negative_amounts(df):\n    # Your code\n    pass\n\ndef add_quarter(df):\n    # Your code\n    pass',
    JSON.stringify([{input: '100 rows, 5 negative', expected: '95 rows after cleaning'}, {input: 'Dates spanning full year', expected: 'Q1-Q4 assigned correctly'}]),
    JSON.stringify(['Use df[df["amount"] >= 0]', 'Use pd.to_datetime(df["date"]).dt.quarter', 'Use df.groupby("region")["amount"].cumsum()']),
    35]);

  // ── Training Attempts ──
  runSql('INSERT INTO training_attempts (id, user_id, module_id, current_step, hints_used, status, started_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['ta-1', 'user-ananya', 'train-sql-window', 3, 1, 'in_progress', '2026-09-10T16:00:00']);

  // ── Career Predictions ──
  const predictions = [
    ['pred-da', 'user-ananya', 'Data Analyst', 62, 85, 78, 6, 0.82, JSON.stringify({python:0.25,sql:0.25,statistics:0.2,data_modeling:0.15,data_quality:0.1,ml:0.05})],
    ['pred-ds', 'user-ananya', 'Data Scientist', 55, 90, 68, 12, 0.72, JSON.stringify({python:0.2,sql:0.1,statistics:0.25,data_modeling:0.15,data_quality:0.05,ml:0.25})],
    ['pred-ml', 'user-ananya', 'ML Engineer', 48, 90, 62, 18, 0.65, JSON.stringify({python:0.3,sql:0.1,statistics:0.15,data_modeling:0.15,data_quality:0.05,ml:0.25})],
    ['pred-ai', 'user-ananya', 'AI Engineer', 40, 95, 55, 24, 0.55, JSON.stringify({python:0.3,sql:0.05,statistics:0.15,data_modeling:0.1,data_quality:0.05,ml:0.35})],
    ['pred-stat', 'user-ananya', 'Statistical Officer', 58, 85, 72, 8, 0.75, JSON.stringify({python:0.15,sql:0.15,statistics:0.35,data_modeling:0.15,data_quality:0.15,ml:0.05})],
  ];

  for (const p of predictions) {
    runSql('INSERT INTO career_predictions (id, user_id, career_path, current_readiness, target_readiness, projected_readiness, timeline_months, confidence, weight_breakdown) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', p);
  }

  const scenarios = [
    ['pred-da', 'Current Pace', 0, 78, 6, 'Continuing at ~8 hrs/week'],
    ['pred-da', 'Increased Learning', 5, 88, 5, 'Increasing to ~13 hrs/week'],
    ['pred-da', 'Reduced Learning', -4, 70, 9, 'Reducing to ~4 hrs/week'],
    ['pred-ds', 'Current Pace', 0, 68, 12, 'Continuing at current rate'],
    ['pred-ds', 'Increased Learning', 5, 79, 9, 'Increasing by 5 hrs/week'],
    ['pred-ds', 'Reduced Learning', -4, 60, 18, 'Reducing by 50%'],
    ['pred-ml', 'Current Pace', 0, 62, 18, 'Continuing at current rate'],
    ['pred-ml', 'Increased Learning', 5, 75, 12, 'Increasing by 5 hrs/week'],
    ['pred-ml', 'Reduced Learning', -4, 54, 24, 'Reducing by 50%'],
    ['pred-ai', 'Current Pace', 0, 55, 24, 'Continuing at current rate'],
    ['pred-ai', 'Increased Learning', 5, 70, 18, 'Increasing by 5 hrs/week'],
    ['pred-ai', 'Reduced Learning', -4, 46, 30, 'Reducing by 50%'],
    ['pred-stat', 'Current Pace', 0, 72, 8, 'Continuing at current rate'],
    ['pred-stat', 'Increased Learning', 5, 83, 6, 'Increasing by 5 hrs/week'],
    ['pred-stat', 'Reduced Learning', -4, 64, 12, 'Reducing by 50%'],
  ];

  for (const s of scenarios) {
    runSql('INSERT INTO prediction_scenarios (id, prediction_id, scenario_name, weekly_hours_change, projected_score, timeline_months, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [uuidv4(), ...s]);
  }

  // ── Regional Analytics (seeded deterministically) ──
  const states = [
    ['Delhi', 'DL', 68], ['Karnataka', 'KA', 75], ['Maharashtra', 'MH', 72],
    ['Tamil Nadu', 'TN', 70], ['Kerala', 'KL', 74], ['Telangana', 'TS', 71],
    ['Uttar Pradesh', 'UP', 45], ['Bihar', 'BR', 38], ['West Bengal', 'WB', 55],
    ['Rajasthan', 'RJ', 48], ['Gujarat', 'GJ', 62], ['Madhya Pradesh', 'MP', 42],
    ['Andhra Pradesh', 'AP', 58], ['Punjab', 'PB', 56], ['Haryana', 'HR', 60],
    ['Odisha', 'OD', 40], ['Chhattisgarh', 'CG', 36], ['Jharkhand', 'JH', 39],
    ['Assam', 'AS', 43], ['Uttarakhand', 'UK', 52], ['Himachal Pradesh', 'HP', 54],
    ['Goa', 'GA', 70], ['Tripura', 'TR', 35], ['Meghalaya', 'ML', 37],
    ['Manipur', 'MN', 34], ['Mizoram', 'MZ', 36], ['Nagaland', 'NL', 33],
    ['Arunachal Pradesh', 'AR', 30], ['Sikkim', 'SK', 44],
    ['Jammu & Kashmir', 'JK', 47], ['Ladakh', 'LA', 32],
  ];

  const skills = ['Python Programming', 'SQL & Databases', 'Statistics & Probability', 'Data Modeling', 'Data Quality & Governance', 'Machine Learning'];
  const skillOffsets = { 'Python Programming': 3, 'SQL & Databases': -2, 'Statistics & Probability': 5, 'Data Modeling': -5, 'Data Quality & Governance': -8, 'Machine Learning': 1 };

  let seedIdx = 0;
  for (const [stateName, stateCode, baseComp] of states) {
    for (const skill of skills) {
      seedIdx++;
      const offset = skillOffsets[skill] || 0;
      const variation = ((seedIdx * 7 + 13) % 20) - 10; // deterministic pseudo-random
      const comp = Math.max(15, Math.min(95, baseComp + offset + variation));
      let gap = 'low';
      if (comp < 40) gap = 'critical';
      else if (comp < 55) gap = 'high';
      else if (comp < 70) gap = 'moderate';
      const learnerCount = Math.floor(100 + baseComp * 30 + (seedIdx % 50) * 10);
      const improvementRate = Math.round((comp * 0.2 + (seedIdx % 10)) * 10) / 10;

      runSql('INSERT INTO regional_skill_analytics (id, state_name, state_code, skill_area, avg_competency, gap_severity, learner_count, improvement_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), stateName, stateCode, skill, comp, gap, learnerCount, improvementRate]);
    }
  }

  // ── Learning Sessions ──
  const sessions = [
    ['user-ananya', 'assessment', 'Python Programming Assessment', 'Completed adaptive assessment with score 72%', '2026-09-05T14:00:00', '2026-09-05T14:18:00', 18],
    ['user-ananya', 'training', 'SQL Window Functions Module', 'Started training - completed through step 3', '2026-09-10T16:00:00', '2026-09-10T16:45:00', 45],
    ['user-ananya', 'rag_query', 'Python Data Engineering Study', 'Explored ETL pipeline design concepts', '2026-09-11T10:00:00', '2026-09-11T10:30:00', 30],
    ['user-ananya', 'mentor_chat', 'Career Guidance Session', 'Discussed career paths with AI Mentor', '2026-09-12T09:00:00', '2026-09-12T09:15:00', 15],
    ['user-ananya', 'assessment', 'SQL Assessment', 'Completed SQL assessment with score 55%', '2026-09-01T11:00:00', '2026-09-01T11:22:00', 22],
  ];

  for (const s of sessions) {
    runSql('INSERT INTO learning_sessions (id, user_id, session_type, title, description, started_at, ended_at, duration_minutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [uuidv4(), ...s]);
  }

  // ── Audit Logs ──
  const audits = [
    ['user-ananya', 'assessment_completed', 'assessment', 'assess-python', 'Score: 72%, Questions: 8', '2026-09-05T14:18:00'],
    ['user-ananya', 'training_started', 'training', 'train-sql-window', 'Started SQL Window Functions module', '2026-09-10T16:00:00'],
    ['user-ananya', 'document_queried', 'document', 'doc-python', 'Query: ETL pipeline design patterns', '2026-09-11T10:15:00'],
    ['user-admin', 'document_uploaded', 'document', 'doc-guidelines', 'Uploaded National Data Analytics Guidelines', '2026-09-01T09:00:00'],
    ['user-trainer', 'module_created', 'training', 'train-sql-window', 'Created SQL Window Functions training module', '2026-09-08T14:00:00'],
  ];

  for (const a of audits) {
    runSql('INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [uuidv4(), ...a]);
  }

  // ── Notifications ──
  runSql('INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, ?)',
    [uuidv4(), 'user-ananya', 'Assessment Score Updated', 'Your Python assessment score improved to 72%!', 'success', 0]);
  runSql('INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, ?)',
    [uuidv4(), 'user-ananya', 'Skill Gap Alert', 'Data Quality & Governance is below target. Consider the recommended course.', 'warning', 0]);
  runSql('INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, ?)',
    [uuidv4(), 'user-ananya', 'New Training Available', 'Python Data Pipeline Fundamentals is now available.', 'info', 1]);

  saveDb();
  console.log('[Seed] Database seeded successfully.');
}

module.exports = { seedDatabase };
