import { useState, useEffect } from 'react';
import api from '../api';
import JobCard from '../components/JobCard';
import { Search, Filter } from 'lucide-react';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: '', type: '', location: '' });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10, ...filters });
      const res = await api.get(`/jobs?${params}`);
      setJobs(res.data.jobs);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Browse Jobs</h1>
        <p className="text-slate-500 mt-1">{total} active job listings</p>
      </div>

      {/* Search & Filters */}
      <form onSubmit={handleSearch} className="card p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              className="input-field pl-9"
              placeholder="Job title, company, skills..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <select
            className="input-field w-auto"
            value={filters.type}
            onChange={e => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All types</option>
            {['CDI', 'CDD', 'Stage', 'Freelance'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input
            type="text"
            className="input-field w-40"
            placeholder="Location..."
            value={filters.location}
            onChange={e => setFilters({ ...filters, location: e.target.value })}
          />
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Filter size={16} /> Filter
          </button>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
          <Search size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium">No jobs found</p>
          <p className="text-sm mt-1">Try adjusting your search filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => <JobCard key={job.id} job={job} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-1.5 text-sm">←</button>
          <span className="px-4 py-1.5 text-sm text-slate-600">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary px-3 py-1.5 text-sm">→</button>
        </div>
      )}
    </div>
  );
}
