import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import JobCard from '../components/JobCard';
import MatchScore from '../components/MatchScore';
import { TrendingUp, Briefcase, FileText, CheckCircle, Clock, XCircle, Star } from 'lucide-react';

const StatCard = ({ label, value, Icon, color }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm text-slate-500">{label}</p>
      <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
        <Icon size={16} className="text-white" />
      </div>
    </div>
    <p className="text-2xl font-bold text-slate-900">{value ?? '—'}</p>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await api.get('/dashboard/stats');
        setData(statsRes.data);

        if (user.role === 'candidate') {
          const recRes = await api.get('/match/recommendations').catch(() => ({ data: [] }));
          setRecommendations(recRes.data.slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user.name.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1">
          {user.role === 'candidate'
            ? 'Here\'s your job search overview'
            : 'Here\'s your recruitment overview'}
        </p>
      </div>

      {/* Stats */}
      {user.role === 'candidate' ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Applications" value={stats.total_applications} Icon={Briefcase} color="bg-primary-500" />
          <StatCard label="Pending" value={stats.pending} Icon={Clock} color="bg-yellow-500" />
          <StatCard label="Accepted" value={stats.accepted} Icon={CheckCircle} color="bg-green-500" />
          <StatCard label="Avg. Match" value={stats.avg_match_score ? `${stats.avg_match_score}%` : null} Icon={TrendingUp} color="bg-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Active Jobs" value={stats.active_jobs} Icon={Briefcase} color="bg-primary-500" />
          <StatCard label="Total Applications" value={stats.total_applications} Icon={FileText} color="bg-blue-500" />
          <StatCard label="Pending Reviews" value={stats.pending_reviews} Icon={Clock} color="bg-yellow-500" />
          <StatCard label="Avg. Match" value={stats.avg_match_score ? `${stats.avg_match_score}%` : null} Icon={TrendingUp} color="bg-green-500" />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* AI Recommendations (candidate) */}
        {user.role === 'candidate' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Star size={16} className="text-yellow-500" /> AI Recommendations
              </h2>
              <Link to="/jobs" className="text-sm text-primary-600 hover:underline">View all</Link>
            </div>
            {recommendations.length === 0 ? (
              <div className="card p-8 text-center text-slate-500">
                <FileText size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="font-medium">Upload your CV to get AI job recommendations</p>
                <Link to="/my-cv" className="btn-primary mt-3 inline-block text-sm">Upload CV</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.map(job => (
                  <JobCard key={job.id} job={job} showMatchScore />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent Activity */}
        <div>
          <h2 className="font-semibold text-slate-900 mb-4">
            {user.role === 'candidate' ? 'Recent Applications' : 'Top Applicants'}
          </h2>

          {user.role === 'candidate' ? (
            <div className="space-y-3">
              {data?.recentApplications?.length === 0 ? (
                <div className="card p-8 text-center text-slate-500">
                  <p>No applications yet. <Link to="/jobs" className="text-primary-600 hover:underline">Browse jobs</Link></p>
                </div>
              ) : (
                data?.recentApplications?.map(app => (
                  <div key={app.id} className="card p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{app.title}</p>
                      <p className="text-xs text-slate-500">{app.company}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <MatchScore score={app.match_score} size="sm" />
                      <span className={`badge ${
                        app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        app.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{app.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {data?.topApplicants?.map(app => (
                <div key={app.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{app.candidate_name}</p>
                    <p className="text-xs text-slate-500">{app.job_title}</p>
                    <p className="text-xs text-slate-400">{app.candidate_email}</p>
                  </div>
                  <MatchScore score={app.match_score} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
