import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, LayoutDashboard, FileText, Search, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLink = (to, label, Icon) => (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive(to)
          ? 'bg-primary-50 text-primary-700'
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <Icon size={16} />
      {label}
    </Link>
  );

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Briefcase size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-900">CV Match AI</span>
          </Link>

          {/* Nav links */}
          {user && (
            <div className="flex items-center gap-1">
              {navLink('/dashboard', 'Dashboard', LayoutDashboard)}
              {navLink('/jobs', 'Jobs', Search)}
              {user.role === 'candidate' && navLink('/my-cv', 'My CV', FileText)}
              {user.role === 'recruiter' && navLink('/post-job', 'Post a Job', Briefcase)}
            </div>
          )}

          {/* User menu */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
                  <User size={14} className="text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">{user.name}</span>
                  <span className={`badge ${user.role === 'recruiter' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {user.role}
                  </span>
                </div>
                <button onClick={handleLogout} className="btn-secondary flex items-center gap-2 text-sm py-1.5">
                  <LogOut size={14} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm py-1.5">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-1.5">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
