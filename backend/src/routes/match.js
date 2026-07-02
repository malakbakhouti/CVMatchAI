import express from 'express';
import { pool } from '../config/postgres.js';
import CV from '../models/CV.js';
import { authMiddleware } from '../middleware/auth.js';
import { calculateMatchScore, getJobRecommendations } from '../services/geminiService.js';

const router = express.Router();

// POST /api/match/apply/:jobId — apply to a job with AI scoring
router.post('/apply/:jobId', authMiddleware, async (req, res) => {
  if (req.user.role !== 'candidate') {
    return res.status(403).json({ error: 'Only candidates can apply' });
  }

  try {
    // Get active CV
    const cv = await CV.findOne({ userId: req.user.id, isActive: true });
    if (!cv) return res.status(404).json({ error: 'Please upload a CV first' });

    // Get job
    const jobResult = await pool.query('SELECT * FROM jobs WHERE id = $1 AND status = $2', [req.params.jobId, 'active']);
    if (!jobResult.rows[0]) return res.status(404).json({ error: 'Job not found or closed' });
    const job = jobResult.rows[0];

    // Check duplicate
    const existing = await pool.query(
      'SELECT id FROM applications WHERE candidate_id=$1 AND job_id=$2',
      [req.user.id, req.params.jobId]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'You already applied to this job' });
    }

    // AI match score
    const matchResult = await calculateMatchScore(cv.parsed, job);

    // Save application
    const result = await pool.query(
      `INSERT INTO applications (candidate_id, job_id, cv_id, match_score, cover_letter)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.user.id, job.id, cv._id.toString(), matchResult.score, req.body.coverLetter || null]
    );

    res.status(201).json({
      application: result.rows[0],
      matchAnalysis: matchResult,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/match/recommendations — AI job recommendations for candidate
router.get('/recommendations', authMiddleware, async (req, res) => {
  if (req.user.role !== 'candidate') {
    return res.status(403).json({ error: 'Candidates only' });
  }
  try {
    const cv = await CV.findOne({ userId: req.user.id, isActive: true });
    if (!cv) return res.status(404).json({ error: 'Upload a CV to get recommendations' });

    const jobsResult = await pool.query(`SELECT * FROM jobs WHERE status = 'active' LIMIT 20`);
    if (!jobsResult.rows.length) return res.json([]);

    const recommendations = await getJobRecommendations(cv.parsed, jobsResult.rows);
    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/match/my-applications — candidate's applications
router.get('/my-applications', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, j.title, j.company, j.location, j.type, j.salary_range
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       WHERE a.candidate_id = $1
       ORDER BY a.applied_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/match/job-applications/:jobId — recruiter sees applicants
router.get('/job-applications/:jobId', authMiddleware, async (req, res) => {
  if (req.user.role !== 'recruiter') {
    return res.status(403).json({ error: 'Recruiters only' });
  }
  try {
    const result = await pool.query(
      `SELECT a.*, u.name AS candidate_name, u.email AS candidate_email
       FROM applications a
       JOIN users u ON u.id = a.candidate_id
       WHERE a.job_id = $1
       ORDER BY a.match_score DESC`,
      [req.params.jobId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/match/application/:id/status — recruiter updates status
router.patch('/application/:id/status', authMiddleware, async (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ error: 'Recruiters only' });
  const { status } = req.body;
  const allowed = ['pending', 'reviewed', 'accepted', 'rejected'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  try {
    const result = await pool.query(
      `UPDATE applications SET status=$1 WHERE id=$2 RETURNING *`,
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
