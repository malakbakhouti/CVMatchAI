import express from 'express';
import { pool } from '../config/postgres.js';
import CV from '../models/CV.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'candidate') {
      const [appResult, cvResult] = await Promise.all([
        pool.query(
          `SELECT
            COUNT(*) AS total_applications,
            COUNT(*) FILTER (WHERE status='pending') AS pending,
            COUNT(*) FILTER (WHERE status='reviewed') AS reviewed,
            COUNT(*) FILTER (WHERE status='accepted') AS accepted,
            COUNT(*) FILTER (WHERE status='rejected') AS rejected,
            ROUND(AVG(match_score)::numeric, 1) AS avg_match_score
           FROM applications WHERE candidate_id=$1`,
          [req.user.id]
        ),
        CV.findOne({ userId: req.user.id, isActive: true }).select('parsed.skills parsed.totalExperienceYears uploadedAt'),
      ]);

      const recentApps = await pool.query(
        `SELECT a.*, j.title, j.company FROM applications a
         JOIN jobs j ON j.id = a.job_id
         WHERE a.candidate_id=$1 ORDER BY a.applied_at DESC LIMIT 5`,
        [req.user.id]
      );

      res.json({
        role: 'candidate',
        stats: appResult.rows[0],
        cv: cvResult,
        recentApplications: recentApps.rows,
      });
    } else {
      const statsResult = await pool.query(
        `SELECT
          COUNT(DISTINCT j.id) AS total_jobs,
          COUNT(DISTINCT j.id) FILTER (WHERE j.status='active') AS active_jobs,
          COUNT(a.id) AS total_applications,
          COUNT(a.id) FILTER (WHERE a.status='pending') AS pending_reviews,
          ROUND(AVG(a.match_score)::numeric, 1) AS avg_match_score
         FROM jobs j
         LEFT JOIN applications a ON a.job_id = j.id
         WHERE j.recruiter_id=$1`,
        [req.user.id]
      );

      const topApplicants = await pool.query(
        `SELECT a.*, u.name AS candidate_name, u.email AS candidate_email, j.title AS job_title
         FROM applications a
         JOIN users u ON u.id = a.candidate_id
         JOIN jobs j ON j.id = a.job_id
         WHERE j.recruiter_id=$1
         ORDER BY a.match_score DESC LIMIT 5`,
        [req.user.id]
      );

      res.json({
        role: 'recruiter',
        stats: statsResult.rows[0],
        topApplicants: topApplicants.rows,
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
