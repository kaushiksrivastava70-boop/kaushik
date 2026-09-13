const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./db');
const { seedDatabase } = require('./seed');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
const authRouter = require('./routes/auth');
const competencyRouter = require('./routes/competency');
const assessmentsRouter = require('./routes/assessments');
const ragRouter = require('./routes/rag');
const trainingRouter = require('./routes/training');
const predictionsRouter = require('./routes/predictions');
const geoRouter = require('./routes/geo');
const mentorRouter = require('./routes/mentor');
const adminRouter = require('./routes/admin');
const historyRouter = require('./routes/history');

app.use('/api/auth', authRouter);
app.use('/api/competency', competencyRouter);
app.use('/api/assessments', assessmentsRouter);
app.use('/api/rag', ragRouter);
app.use('/api/training', trainingRouter);
app.use('/api/predictions', predictionsRouter);
app.use('/api/geo', geoRouter);
app.use('/api/mentor', mentorRouter);
app.use('/api/admin', adminRouter);
app.use('/api/history', historyRouter);

// Root healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'SIH26101 AI-Driven Competency Intelligence & Adaptive Learning Platform',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static bundle
const distPath = path.join(__dirname, '../dist');
const clientDistPath = path.join(__dirname, '../client/dist');
const staticPath = require('fs').existsSync(distPath) ? distPath : clientDistPath;

app.use(express.static(staticPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(staticPath, 'index.html'));
});

async function startServer() {
  try {
    console.log('[Server] Initializing database...');
    await initializeDatabase();
    console.log('[Server] Checking and running seed data...');
    seedDatabase();
    
    app.listen(PORT, () => {
      console.log(`[Server] SIH26101 Backend API successfully running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[Server] Failed to initialize backend:', err);
    process.exit(1);
  }
}

startServer();
