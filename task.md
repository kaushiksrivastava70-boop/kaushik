# SIH26101 Implementation Tasks

## Phase 1: Project Setup
- [x] Initialize monorepo with `server/`, `backend_python/`, and `client/` directories
- [x] Setup Python FastAPI backend with sqlite3, uvicorn, and pypdf
- [x] Setup React + Vite frontend

## Phase 2: Python Backend - Database & APIs
- [x] Create SQLite schema and seed data in Python (`backend_python/database.py`)
- [x] Auth & Profile APIs (`/api/auth/users`, `/api/auth/login`, `/api/auth/switch`)
- [x] Competency Twin APIs (`/api/competency/scores`, `/api/competency/summary`, `/api/competency/update`)
- [x] Adaptive Assessment APIs (`/api/assessments`, `/api/assessments/start`, `/api/assessments/answer`, `/api/assessments/complete`)
- [x] RAG Document & Search APIs (`/api/rag/documents`, `/api/rag/search`)
- [x] Practical Training Mode APIs (`/api/training`, `/api/training/run-tests`, `/api/training/submit`)
- [x] Career Prediction APIs (`/api/predictions`)
- [x] Geo Heat Map APIs (`/api/geo`)
- [x] AI Mentor APIs (`/api/mentor/chat`, `/api/mentor/history`)
- [x] Admin Command Center APIs (`/api/admin/kpis`, `/api/admin/interventions`, `/api/admin/training-review`)
- [x] Learning Timeline & History APIs (`/api/history`)
- [x] **PDF to Quiz AI Generator APIs (`/api/pdf/upload-and-generate-quiz`, `/api/pdf/generate-quiz-from-text`)**

## Phase 3: Frontend - Authentication & Multilingual Core Shell
- [x] Google-Style Sign-In page (`LoginPage.jsx`) gating access prior to home view
- [x] 6-Language Indian Multilingual Support (`i18n.js`: English, Hindi, Tamil, Telugu, Bengali, Marathi)
- [x] Top header with language switcher, persona switcher, and Sign Out action (`Header.jsx`)
- [x] Dashboard page with multilingual labels and instant action triggers (`Dashboard.jsx`)
- [x] Three-dot menu drawer and timeline history (`ThreeDotMenu.jsx`, `HistoryDrawer.jsx`)

## Phase 4: Frontend - Feature Modules
- [x] Competency Digital Twin (dynamic SVG radar chart, historical milestones, categorized skill bars)
- [x] Adaptive Assessment (dynamic difficulty progression, real-time timer, distractor analysis)
- [x] PDF to Quiz Generator section (`PdfQuizGenerator.jsx`: upload PDF, extract with pypdf, solve interactive quiz)
- [x] RAG AI Tutor (curricula viewer, chunk inspector, grounded Q&A with citations)
- [x] Training Mode (structured 4-step pipeline, hints system, code editor & test runner)
- [x] Future Career Predictor (scenarios simulation, readiness cards, explainable math drawer)
- [x] Geographical Heat Map (interactive SVG India map, state hover cards, quadrant analysis)
- [x] AI Mentor Chatbot (context-aware assistant referencing learner's Competency Twin)
- [x] Admin Command Center (executive KPIs, regional intervention dispatcher, trainer review portal)

## Phase 5: Verification
- [x] Python backend API integration test (All endpoints responding 200 OK on port 8000)
- [x] Frontend build check (`npm run build` succeeded in 3.36s with zero errors)
- [x] Live servers running (Python FastAPI: `http://localhost:8000`, Frontend: `http://localhost:5173`)
- [x] Verified full auth gate, PDF-to-quiz generation, and multilingual switcher
