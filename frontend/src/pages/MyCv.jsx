import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { Upload, CheckCircle, FileText, RefreshCw, Tag, Briefcase, GraduationCap, Award, Globe } from 'lucide-react';

export default function MyCv() {
  const [cv, setCv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    api.get('/cv/my')
      .then(res => setCv(res.data))
      .catch(() => setCv(null))
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('cv', file);

    try {
      const res = await api.post('/cv/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCv({ parsed: res.data.parsed, uploadedAt: new Date(), originalName: file.name });
      setSuccess('CV uploaded and parsed by AI successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My CV</h1>
          <p className="text-slate-500 mt-1">Upload your CV and let AI parse it</p>
        </div>
        <button onClick={() => fileRef.current.click()} className="btn-primary flex items-center gap-2">
          <RefreshCw size={16} />
          {cv ? 'Replace CV' : 'Upload CV'}
        </button>
        <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleUpload} />
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4 border border-red-200">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mb-4 border border-green-200 flex items-center gap-2"><CheckCircle size={16}/>{success}</div>}

      {uploading && (
        <div className="card p-8 text-center mb-6">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent mx-auto mb-3" />
          <p className="font-medium text-slate-700">AI is parsing your CV...</p>
          <p className="text-sm text-slate-500 mt-1">This may take a few seconds</p>
        </div>
      )}

      {!cv && !uploading && (
        <div
          className="card p-12 text-center border-dashed border-2 border-slate-300 hover:border-primary-400 transition-colors cursor-pointer"
          onClick={() => fileRef.current.click()}
        >
          <Upload size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-600">Drop your CV here or click to upload</p>
          <p className="text-sm text-slate-400 mt-1">PDF or DOCX, max 5MB</p>
        </div>
      )}

      {cv && !uploading && (
        <div className="space-y-5">
          {/* Header */}
          <div className="card p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{cv.parsed?.fullName || 'Your Name'}</h2>
                <div className="flex flex-wrap gap-3 text-sm text-slate-500 mt-1">
                  {cv.parsed?.email && <span>{cv.parsed.email}</span>}
                  {cv.parsed?.phone && <span>{cv.parsed.phone}</span>}
                  {cv.parsed?.location && <span>{cv.parsed.location}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <FileText size={14} />
                {cv.originalName}
              </div>
            </div>
            {cv.parsed?.summary && (
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">{cv.parsed.summary}</p>
            )}
          </div>

          {/* Skills */}
          {cv.parsed?.skills?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2"><Tag size={16} className="text-primary-500"/>Skills</h3>
              <div className="flex flex-wrap gap-2">
                {cv.parsed.skills.map(s => (
                  <span key={s} className="badge bg-primary-50 text-primary-700">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {cv.parsed?.experience?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Briefcase size={16} className="text-primary-500"/>Experience ({cv.parsed.totalExperienceYears} yrs)</h3>
              <div className="space-y-4">
                {cv.parsed.experience.map((exp, i) => (
                  <div key={i} className="pl-4 border-l-2 border-primary-100">
                    <p className="font-medium text-slate-800">{exp.title}</p>
                    <p className="text-sm text-primary-600">{exp.company}</p>
                    <p className="text-xs text-slate-400 mb-1">{exp.duration}</p>
                    {exp.description && <p className="text-sm text-slate-500">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {cv.parsed?.education?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><GraduationCap size={16} className="text-primary-500"/>Education</h3>
              <div className="space-y-3">
                {cv.parsed.education.map((edu, i) => (
                  <div key={i} className="pl-4 border-l-2 border-green-100">
                    <p className="font-medium text-slate-800">{edu.degree}</p>
                    <p className="text-sm text-green-600">{edu.institution}</p>
                    {edu.year && <p className="text-xs text-slate-400">{edu.year}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-5">
            {/* Languages */}
            {cv.parsed?.languages?.length > 0 && (
              <div className="card p-5">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2"><Globe size={16} className="text-primary-500"/>Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {cv.parsed.languages.map(l => <span key={l} className="badge bg-slate-100 text-slate-600">{l}</span>)}
                </div>
              </div>
            )}

            {/* Certifications */}
            {cv.parsed?.certifications?.length > 0 && (
              <div className="card p-5">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2"><Award size={16} className="text-primary-500"/>Certifications</h3>
                <ul className="space-y-1">
                  {cv.parsed.certifications.map(c => (
                    <li key={c} className="text-sm text-slate-600 flex items-center gap-2">
                      <CheckCircle size={12} className="text-green-500 flex-shrink-0" />{c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
