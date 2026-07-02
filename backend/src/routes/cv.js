import express from 'express';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';
import CV from '../models/CV.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { parseCV } from '../services/geminiService.js';

const router = express.Router();

// POST /api/cv/upload — upload + auto-parse with Gemini
router.post('/upload', authMiddleware, upload.single('cv'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    // Extract raw text
    let rawText = '';
    if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(req.file.buffer);
      rawText = data.text;
    } else {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      rawText = result.value;
    }

    if (!rawText.trim()) {
      return res.status(422).json({ error: 'Could not extract text from the file' });
    }

    // Parse with Gemini
    const parsed = await parseCV(rawText);

    // Deactivate old CVs
    await CV.updateMany({ userId: req.user.id }, { isActive: false });

    // Save to MongoDB
    const cv = await CV.create({
      userId: req.user.id,
      originalName: req.file.originalname,
      fileBuffer: req.file.buffer,
      rawText,
      parsed,
      isActive: true,
    });

    res.status(201).json({
      message: 'CV uploaded and parsed successfully',
      cvId: cv._id,
      parsed,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cv/my — get my active CV
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const cv = await CV.findOne({ userId: req.user.id, isActive: true }).select('-fileBuffer');
    if (!cv) return res.status(404).json({ error: 'No CV found' });
    res.json(cv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cv/history — all CVs for user
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const cvs = await CV.find({ userId: req.user.id })
      .select('-fileBuffer -rawText')
      .sort({ uploadedAt: -1 });
    res.json(cvs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cv/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const cv = await CV.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!cv) return res.status(404).json({ error: 'CV not found' });
    res.json({ message: 'CV deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
