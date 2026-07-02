**🎯 CV Match AI — SaaS CV & Job Matching Platform**

Full-stack AI SaaS platform for automatic CV analysis and job matching using **Gemini 2.0 Flash**.

## Stack
- **Frontend**: React.js + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **AI/NLP**: Google Gemini 2.0 Flash
- **Auth**: JWT + bcrypt
- **DB**: PostgreSQL (users, jobs, applications) + MongoDB (CVs)

## Features
- 📄 CV upload (PDF/DOCX) with AI parsing via Gemini
- 🎯 AI-powered match scoring for each application
- 🌟 AI job recommendations personalized per CV
- 👤 Candidate & Recruiter roles
- 📊 Dashboard with application tracking
- 🔍 Job search with filters
- 📝 Job posting for recruiters

---

## 🚀 Setup

### 1. Prerequisites
- Node.js 18+
- PostgreSQL running locally
- MongoDB running locally
- Gemini API Key → https://aistudio.google.com/app/apikey

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Create PostgreSQL Database

```sql
CREATE DATABASE cv_matching_db;
```
> Tables are auto-created on first server start.

---

## 📁 Project Structure

```
saas-cv-matching/
├── backend/
│   └── src/
│       ├── config/         # PostgreSQL + MongoDB connections
│       ├── middleware/      # JWT auth + Multer upload
│       ├── models/          # CV (Mongoose)
│       ├── routes/          # auth, cv, jobs, match, dashboard
│       ├── services/        # geminiService (NLP)
│       └── server.js
└── frontend/
    └── src/
        ├── components/      # Navbar, JobCard, MatchScore
        ├── context/         # AuthContext
        ├── pages/           # Login, Register, Dashboard, Jobs, MyCv, PostJob
        ├── api.js           # Axios client
        └── App.jsx          # Router
```

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register (candidate/recruiter) |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| POST | /api/cv/upload | Upload + AI parse CV |
| GET | /api/cv/my | Get my active CV |
| GET | /api/jobs | Browse jobs (search/filter) |
| POST | /api/jobs | Create job (recruiter) |
| POST | /api/match/apply/:id | Apply with AI scoring |
| GET | /api/match/recommendations | AI job recommendations |
| GET | /api/match/my-applications | My applications |
| GET | /api/dashboard/stats | Dashboard stats |
