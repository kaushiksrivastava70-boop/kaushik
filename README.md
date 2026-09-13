# SkillMatrix AI - Competency Intelligence & Adaptive Learning Platform

An enterprise-grade government talent assessment & learning acceleration platform designed for public sector data analysts, statisticians, and engineers.

🌐 **Live Deployed URL**: [https://skill-matrix-ai.vercel.app](https://skill-matrix-ai.vercel.app)

## 🚀 Key Features

1. **Competency Digital Twin**
   - Real-time Spider/Radar visualization of 6 competency pillars (Python, SQL, Statistics, Data Modeling, Data Quality & Governance, Machine Learning).
   - Historical trajectory tracking and granular intervention gap breakdowns.

2. **Adaptive IRT Assessment Engine**
   - Item Response Theory calibrated questions that adjust difficulty in real-time (Easy → Medium → Hard → Expert).
   - Instant diagnostic feedback with distractor analysis.

3. **Interactive PDF-to-Quiz AI Generator**
   - Drop in any official government guideline or technical policy PDF (powered by `pypdf`).
   - Dynamically extracts curriculum topics and generates multi-tier MCQs with pedagogical explanations.

4. **Geographical Skill-Gap Heat Map & Quadrant Intelligence**
   - Interactive high-fidelity SVG mapping of India's national competency distribution across states.
   - 4-quadrant strategic intervention analysis (Critical, Rapidly Improving, Steady Monitoring, Benchmark Leaders).

5. **AI Mentor & Remediation Chatbot**
   - Personalized coaching anchored to learner's active skill gaps and competency score delta.

6. **Interactive Training Sandbox**
   - Live code editor with real-time test execution and hint-assisted learning paths.

7. **Multilingual Architecture (6 Indian Languages)**
   - Instant UI switching: English, हिन्दी (Hindi), தமிழ் (Tamil), తెలుగు (Telugu), বাংলা (Bengali), मराठी (Marathi).

8. **Google-Style Authentication & Access Control**
   - Role-based access control with one-click demo personas (Learners, Trainers, Program Directors).

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 19, Vite 8, Vanilla CSS Design System, Lucide Icons
- **Backend**: Python 3.12, FastAPI, Uvicorn, SQLite3 persistent storage
- **Legacy Server**: Node.js Express (for backwards compatibility)

---

## ⚡ Quick Start

### 1. Backend Setup
```bash
# Python FastAPI Backend
pip install fastapi uvicorn pydantic pypdf
python backend_python/main.py
```
The FastAPI backend runs on `http://localhost:8000`.

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
The frontend dev server runs on `http://localhost:5173`.

### 3. Production Build
```bash
cd client
npm run build
```
FastAPI automatically serves the production single-page application from `client/dist`.

---

## 👥 Demo Personas

| Name | Role | Region | Department |
| :--- | :--- | :--- | :--- |
| **Ananya Sharma** | Junior Data Analyst | Delhi | Data Analytics Division |
| **Rajesh Kumar** | ML Research Associate | Karnataka | AI & ML Wing |
| **Priya Menon** | Statistical Officer | Kerala | Statistical Bureau |
| **Dr. Vikram Singh** | Senior Training Officer | Maharashtra | Training Academy |
| **Sunita Deshmukh** | Program Director (Admin) | Delhi | National Digital Skills Authority |
