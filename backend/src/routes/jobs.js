import express from 'express';
import { pool } from '../config/postgres.js';
import { authMiddleware, recruiterOnly } from '../middleware/auth.js';

const router = express.Router();

// GET /api/jobs — browse all active jobs (public, with optional filters)
router.get('/', async (req, res) => {
  const { search, type, location, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let query = `SELECT j.*, u.name AS recruiter_name FROM jobs j
               JOIN users u ON u.id = j.recruiter_id
               WHERE j.status = 'active'`;
  const params = [];
  let i = 1;

  if (search) {
    query += ` AND (j.title ILIKE $${i} OR j.company ILIKE $${i} OR j.description ILIKE $${i})`;
    params.push(`%${search}%`);
    i++;
  }
  if (type) {
    query += ` AND j.type = $${i}`;
    params.push(type);
    i++;
  }
  if (location) {
    query += ` AND j.location ILIKE $${i}`;
    params.push(`%${location}%`);
    i++;
  }

  query += ` ORDER BY j.created_at DESC LIMIT $${i} OFFSET $${i + 1}`;
  params.push(limit, offset);

  try {
    const result = await pool.query(query, params);
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM jobs WHERE status = 'active'`
    );
    res.json({
      jobs: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/jobs/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT j.*, u.name AS recruiter_name FROM jobs j
       JOIN users u ON u.id = j.recruiter_id
       WHERE j.id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Job not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/jobs — create job (recruiter only)
router.post('/', authMiddleware, recruiterOnly, async (req, res) => {
  const { title, company, location, type, description, required_skills, min_experience, salary_range } = req.body;
  if (!title || !company || !description) {
    return res.status(400).json({ error: 'Title, company and description are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO jobs (recruiter_id, title, company, location, type, description, required_skills, min_experience, salary_range)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [req.user.id, title, company, location, type, description, required_skills || [], min_experience || 0, salary_range]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/jobs/:id
router.put('/:id', authMiddleware, recruiterOnly, async (req, res) => {
  const { title, company, location, type, description, required_skills, min_experience, salary_range, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE jobs SET title=$1, company=$2, location=$3, type=$4, description=$5,
       required_skills=$6, min_experience=$7, salary_range=$8, status=$9
       WHERE id=$10 AND recruiter_id=$11 RETURNING *`,
      [title, company, location, type, description, required_skills, min_experience, salary_range, status, req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Job not found or unauthorized' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/jobs/:id
router.delete('/:id', authMiddleware, recruiterOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM jobs WHERE id=$1 AND recruiter_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/jobs/my/listings — recruiter's own jobs
router.get('/my/listings', authMiddleware, recruiterOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT j.*, COUNT(a.id) AS application_count FROM jobs j
       LEFT JOIN applications a ON a.job_id = j.id
       WHERE j.recruiter_id = $1
       GROUP BY j.id ORDER BY j.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
