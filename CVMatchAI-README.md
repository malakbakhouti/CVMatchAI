🎯 CVMatch AI – SaaS CV Analysis & Job Matching Platform

CVMatch AI is a full‑stack SaaS platform that centralizes CVs and job offers, and uses AI to automatically extract candidate skills and match them to the most relevant job listings.

This project was developed as a final-year academic project (PFE), based on a full SaaS specification covering candidate/company/admin roles, AI-powered CV parsing, cloud deployment and security requirements.

🚀 Main Features

🎓 Candidate
* Register and log in securely (JWT)
* Upload CV (PDF, DOCX) — parsed automatically by AI
* View upload history and manage CVs
* Browse job listings and apply
* View match score for each application
* Get personalized job recommendations based on parsed skills

🏢 Recruiter / Company
* Register and log in
* Full CRUD on job listings (create, edit, delete, view own listings)
* View candidates who applied to each job
* Dashboard with analytics (applications, top skills)

🛡️ Admin
* User management (candidates, companies)
* Platform-wide statistics
* Audit logs

🏗️ Architecture Overview

CVMatch AI uses a polyglot data architecture: PostgreSQL for structured/relational data, MongoDB for CV documents, and Google Gemini for AI-powered CV parsing.

| Layer | Technology | Role |
|---|---|---|
| Frontend | React (Vite) + Tailwind CSS | Login/signup, CV upload, job listings, dashboards |
| Backend | Node.js + Express | REST API, authentication, file handling, orchestration |
| Relational DB | PostgreSQL | Users, jobs, applications |
| Document DB | MongoDB | Parsed CV documents (raw text + structured AI output) |
| AI | Google Gemini 2.0 Flash | CV parsing: extracts skills, experience, education from raw text |
| Auth | JWT + bcryptjs | Secure authentication, password hashing |

🗄️ Databases – Usage Summary

**PostgreSQL**
* `users` — candidates, recruiters, admins
* `jobs` — job listings created by recruiters
* `applications` — candidate applications linking users to jobs
📁 `backend/src/config/postgres.js`

**MongoDB**
* `CV` — raw file buffer, extracted text, and AI-parsed structure (skills, experience, education, languages, certifications)
📁 `backend/src/models/CV.js`

**Gemini AI Service**
* Parses raw CV text into structured JSON (name, contact info, skills, experience, education)
📁 `backend/src/services/geminiService.js`

📁 Modules – Usage Summary

**`routes/auth.js`**
* `POST /register`, `POST /login`, `GET /me`

**`routes/cv.js`**
* `POST /upload` — upload + AI parsing (PDF/DOCX via pdf-parse & mammoth)
* `GET /my`, `GET /history`, `DELETE /:id`

**`routes/jobs.js`**
* `GET /`, `GET /:id` — public job listing browsing
* `POST /`, `PUT /:id`, `DELETE /:id`, `GET /my/listings` — recruiter-only CRUD

**`routes/match.js`**
* `POST /apply/:jobId` — apply with match scoring
* `GET /recommendations` — AI-based job recommendations
* `GET /my-applications`, `GET /job-applications/:jobId`

**`routes/dashboard.js`**
* `GET /stats` — analytics for recruiters

🔄 Key Usage Scenario — CV Upload & Matching
1. Candidate uploads a CV (PDF/DOCX)
2. Backend extracts raw text (pdf-parse / mammoth) and stores it in MongoDB
3. Gemini AI parses the text into structured data (skills, experience, education)
4. Candidate applies to a job → match score computed between parsed skills and job requirements
5. Recruiter views ranked candidates in their dashboard

▶️ Run the Project

**Requirements:** Node.js, PostgreSQL, MongoDB, a Google Gemini API key

**Backend**
```bash
cd backend
npm install
# Configure .env (PostgreSQL, MongoDB, JWT secret, Gemini API key)
npm run dev
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies `/api` requests to the backend on `http://localhost:5001`.

🔮 Future Improvements
* Advanced weighted matching score (skill rarity/importance)
* Cloud deployment (AWS/Azure) with Docker + CI/CD
* Real-time monitoring and audit logging
* Multi-language support
* In-app messaging between candidates and recruiters

🎤 Conclusion

CVMatch AI demonstrates a complete SaaS platform combining a React/Node.js full-stack architecture with a polyglot database design (PostgreSQL + MongoDB) and Google Gemini AI for automated CV parsing and candidate-job matching, with dedicated dashboards for candidates, recruiters and administrators.
