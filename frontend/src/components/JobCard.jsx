import { MapPin, Clock, DollarSign, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import MatchScore from './MatchScore';

export default function JobCard({ job, showMatchScore = false }) {
  const typeColors = {
    'CDI': 'bg-green-100 text-green-700',
    'CDD': 'bg-blue-100 text-blue-700',
    'Stage': 'bg-purple-100 text-purple-700',
    'Freelance': 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900 truncate">{job.title}</h3>
            {job.type && (
              <span className={`badge ${typeColors[job.type] || 'bg-slate-100 text-slate-600'} flex-shrink-0`}>
                {job.type}
              </span>
            )}
          </div>

          <p className="text-sm font-medium text-primary-600 mb-3">{job.company}</p>

          <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {job.location}
              </span>
            )}
            {job.min_experience > 0 && (
              <span className="flex items-center gap-1">
                <Briefcase size={12} /> {job.min_experience}+ yrs
              </span>
            )}
            {job.salary_range && (
              <span className="flex items-center gap-1">
                <DollarSign size={12} /> {job.salary_range}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={12} /> {new Date(job.created_at).toLocaleDateString()}
            </span>
          </div>

          {job.required_skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {job.required_skills.slice(0, 5).map(skill => (
                <span key={skill} className="badge bg-slate-100 text-slate-600">{skill}</span>
              ))}
              {job.required_skills.length > 5 && (
                <span className="badge bg-slate-100 text-slate-500">+{job.required_skills.length - 5}</span>
              )}
            </div>
          )}

          {job.matchReason && (
            <p className="mt-2 text-xs text-slate-500 italic">{job.matchReason}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          {showMatchScore && job.matchScore !== undefined && (
            <MatchScore score={job.matchScore} size="sm" />
          )}
          <Link to={`/jobs/${job.id}`} className="btn-primary text-sm py-1.5 px-3 whitespace-nowrap">
            View Job
          </Link>
        </div>
      </div>
    </div>
  );
}
