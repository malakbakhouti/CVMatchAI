import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import MatchScore from '../components/MatchScore';
import { MapPin, Briefcase, DollarSign, Clock, CheckCircle, XCircle, Sparkles } from 'lucide-react';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    api.get(`/jobs/${id}`)
      .then(res => setJob(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    setError('');
    try {
      const res = await api.post(`/match/apply/${id}`, { coverLetter });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Application failed');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" /></div>;
  if (!job) return <div className="text-center py-20 text-slate-500">Job not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
                <p className="text-primary-600 font-medium mt-1">{job.company}</p>
              </div>
              {job.type && <span className="badge bg-primary-100 text-primary-700 text-sm">{job.type}</span>}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-5">
              {job.location && <span className="flex items-center gap-1.5"><MapPin size={14} />{job.location}</span>}
              {job.min_experience > 0 && <span className="flex items-center gap-1.5"><Briefcase size={14} />{job.min_experience}+ years</span>}
              {job.salary_range && <span className="flex items-center gap-1.5"><DollarSign size={14} />{job.salary_range}</span>}
              <span className="flex items-center gap-1.5"><Clock size={14} />{new Date(job.created_at).toLocaleDateString()}</span>
            </div>

            {job.required_skills?.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-medium text-slate-700 mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {job.required_skills.map(s => <span key={s} className="badge bg-slate-100 text-slate-600">{s}</span>)}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Job Description</p>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>
          </div>
        </div>

        {/* Sidebar — Apply */}
        <div className="space-y-4">
          {user?.role === 'candidate' && !result && (
            <div className="card p-5">
              <h3 className="font-semibold text-slate-900 mb-3">Apply for this job</h3>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-3 border border-red-200">{error}</div>
              )}

              <textarea
                className="input-field h-28 resize-none mb-3 text-sm"
                placeholder="Cover letter (optional) — tell them why you're a great fit..."
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
              />

              <button
                onClick={handleApply}
                disabled={applying}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {applying ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> AI scoring...</>
                ) : (
                  <><Sparkles size={16} /> Apply with AI Match</>
                )}
              </button>
              <p className="text-xs text-slate-400 text-center mt-2">Your CV will be analyzed by Gemini AI</p>
            </div>
          )}

          {/* Match result */}
          {result && (
            <div className="card p-5 space-y-4">
              <div className="text-center">
                <p className="text-sm font-medium text-slate-500 mb-2">Your Match Score</p>
                <MatchScore score={result.matchAnalysis.score} size="lg" />
              </div>

              <p className="text-sm text-slate-600 text-center">{result.matchAnalysis.recommendation}</p>

              {result.matchAnalysis.matchedSkills?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-green-700 mb-1.5">✓ Matched Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.matchAnalysis.matchedSkills.map(s => (
                      <span key={s} className="badge bg-green-100 text-green-700">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.matchAnalysis.missingSkills?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-red-600 mb-1.5">✗ Missing Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.matchAnalysis.missingSkills.map(s => (
                      <span key={s} className="badge bg-red-100 text-red-600">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center pt-2">
                <CheckCircle size={20} className="text-green-500 mx-auto mb-1" />
                <p className="text-xs text-green-600 font-medium">Application submitted!</p>
              </div>
            </div>
          )}

          {user?.role !== 'candidate' && (
            <div className="card p-5 text-center text-slate-500 text-sm">
              <p>Log in as a candidate to apply</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
