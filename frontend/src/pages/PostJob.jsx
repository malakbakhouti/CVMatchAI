import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Plus, X } from 'lucide-react';

export default function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', company: '', location: '', type: 'CDI',
    description: '', salary_range: '', min_experience: 0,
  });
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setSkillInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.company || !form.description) {
      return setError('Title, company and description are required');
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/jobs', { ...form, required_skills: skills });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Post a Job</h1>
      <p className="text-slate-500 mb-6">Fill in the details to attract the best candidates</p>

      <div className="card p-6">
        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4 border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Title *</label>
              <input className="input-field" placeholder="e.g. Full Stack Developer" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company *</label>
              <input className="input-field" placeholder="Company name" value={form.company} onChange={e => setForm({...form, company: e.target.value})} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input className="input-field" placeholder="Casablanca, Morocco" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select className="input-field" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                {['CDI', 'CDD', 'Stage', 'Freelance'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Min. Experience (years)</label>
              <input type="number" min="0" max="20" className="input-field" value={form.min_experience} onChange={e => setForm({...form, min_experience: parseInt(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Salary Range</label>
              <input className="input-field" placeholder="e.g. 8,000 - 12,000 MAD" value={form.salary_range} onChange={e => setForm({...form, salary_range: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Required Skills</label>
            <div className="flex gap-2 mb-2">
              <input
                className="input-field"
                placeholder="Add a skill and press Enter"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              />
              <button type="button" onClick={addSkill} className="btn-secondary px-3">
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map(s => (
                <span key={s} className="badge bg-primary-100 text-primary-700 flex items-center gap-1">
                  {s}
                  <button type="button" onClick={() => setSkills(skills.filter(x => x !== s))}><X size={12} /></button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Job Description *</label>
            <textarea
              className="input-field h-36 resize-none"
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </form>
      </div>
    </div>
  );
}
