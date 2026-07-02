import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

/**
 * Parse raw CV text into structured JSON using Gemini
 */
export const parseCV = async (rawText) => {
  const prompt = `
You are an expert CV parser. Extract structured information from the following CV text.
Return ONLY valid JSON, no markdown, no explanation.

CV Text:
"""
${rawText}
"""

Return this exact JSON structure:
{
  "fullName": "string",
  "email": "string or null",
  "phone": "string or null",
  "location": "string or null",
  "summary": "string or null",
  "skills": ["skill1", "skill2", ...],
  "languages": ["French", "English", ...],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Jan 2022 - Jun 2024",
      "description": "brief description"
    }
  ],
  "education": [
    {
      "degree": "Master in Computer Science",
      "institution": "University Name",
      "year": "2024"
    }
  ],
  "certifications": ["cert1", "cert2"],
  "totalExperienceYears": 3
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Clean potential markdown fences
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

/**
 * Calculate match score between a parsed CV and a job description
 */
export const calculateMatchScore = async (parsedCV, job) => {
  const prompt = `
You are a recruitment AI. Analyze how well this candidate matches the job offer.
Return ONLY valid JSON, no markdown.

CANDIDATE PROFILE:
- Skills: ${parsedCV.skills?.join(', ') || 'N/A'}
- Experience: ${parsedCV.totalExperienceYears || 0} years
- Education: ${parsedCV.education?.map(e => e.degree).join(', ') || 'N/A'}
- Languages: ${parsedCV.languages?.join(', ') || 'N/A'}
- Summary: ${parsedCV.summary || 'N/A'}

JOB OFFER:
- Title: ${job.title}
- Company: ${job.company}
- Required Skills: ${job.required_skills?.join(', ') || 'N/A'}
- Min Experience: ${job.min_experience || 0} years
- Description: ${job.description?.substring(0, 500)}

Return:
{
  "score": 85,
  "matchedSkills": ["React", "Node.js"],
  "missingSkills": ["AWS", "Docker"],
  "strengths": ["Strong frontend experience", "Good communication skills"],
  "weaknesses": ["Lacks cloud experience"],
  "recommendation": "Strong candidate — recommend for interview"
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

/**
 * Get top job recommendations for a candidate
 */
export const getJobRecommendations = async (parsedCV, jobs) => {
  if (!jobs.length) return [];

  const jobsText = jobs.map((j, i) =>
    `[${i}] ${j.title} at ${j.company} — Skills: ${j.required_skills?.join(', ')} — Min exp: ${j.min_experience}y`
  ).join('\n');

  const prompt = `
You are a job matching AI. Given this candidate's profile, rank the jobs by relevance.
Return ONLY valid JSON array, no markdown.

CANDIDATE SKILLS: ${parsedCV.skills?.join(', ')}
CANDIDATE EXPERIENCE: ${parsedCV.totalExperienceYears} years
CANDIDATE EDUCATION: ${parsedCV.education?.map(e => e.degree).join(', ')}

JOBS:
${jobsText}

Return an array of objects sorted by match score (highest first):
[
  { "jobIndex": 0, "score": 92, "reason": "Perfect match on skills and experience level" },
  { "jobIndex": 2, "score": 78, "reason": "Good skill overlap, slightly over-qualified" }
]
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const clean = text.replace(/```json|```/g, '').trim();
  const ranked = JSON.parse(clean);

  return ranked.map(r => ({
    ...jobs[r.jobIndex],
    matchScore: r.score,
    matchReason: r.reason,
  }));
};
