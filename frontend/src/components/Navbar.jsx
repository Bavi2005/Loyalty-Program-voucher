import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/upload-receipt', label: 'Upload' },
  { to: '/receipt-history', label: 'Receipts' },
  { to: '/vouchers', label: 'Vouchers' },
  { to: '/settings', label: 'Settings' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/60 bg-white/70 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/70">
      <div className="container-x flex h-[72px] items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-600/30">
            LP
          </div>
          <span className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white">LoyaltyPro</span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-gray-200/70 bg-white/60 p-1.5 shadow-sm md:flex dark:border-slate-800 dark:bg-slate-900/60">
          {navLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:text-gray-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            {dark ? '☀️' : '🌙'}
          </button>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold leading-tight text-gray-900 dark:text-white">{user?.name || user?.email}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500">Member</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-semibold text-white ring-2 ring-indigo-100 dark:ring-slate-800">
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <button
            onClick={handleLogout}
            className="hidden rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-500 shadow-sm transition hover:text-gray-900 sm:block dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
