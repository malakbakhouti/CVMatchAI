import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
});

export const initPostgres = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'candidate', -- candidate | recruiter
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        recruiter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        type VARCHAR(100), -- CDI, CDD, Stage, Freelance
        description TEXT NOT NULL,
        required_skills TEXT[], -- array of skills
        min_experience INTEGER DEFAULT 0,
        salary_range VARCHAR(100),
        status VARCHAR(50) DEFAULT 'active', -- active | closed
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        candidate_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
        cv_id VARCHAR(255), -- MongoDB ObjectId
        match_score FLOAT DEFAULT 0,
        status VARCHAR(100) DEFAULT 'pending', -- pending | reviewed | accepted | rejected
        cover_letter TEXT,
        applied_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(candidate_id, job_id)
      );
    `);
    console.log('✅ PostgreSQL tables initialized');
  } finally {
    client.release();
  }
};
