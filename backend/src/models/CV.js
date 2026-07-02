import mongoose from 'mongoose';

const cvSchema = new mongoose.Schema({
  userId: { type: Number, required: true }, // PostgreSQL user id
  originalName: { type: String, required: true },
  fileBuffer: { type: Buffer }, // raw file
  rawText: { type: String }, // extracted text
  parsed: {
    fullName: String,
    email: String,
    phone: String,
    location: String,
    summary: String,
    skills: [String],
    languages: [String],
    experience: [{
      title: String,
      company: String,
      duration: String,
      description: String,
    }],
    education: [{
      degree: String,
      institution: String,
      year: String,
    }],
    certifications: [String],
    totalExperienceYears: Number,
  },
  isActive: { type: Boolean, default: true },
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model('CV', cvSchema);
