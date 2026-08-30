import { NavLink, useNavigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/receipts', label: 'Receipts', icon: '🧾' },
];

export default function AdminLayout({ children }) {
  const { admin, logout } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#f6f6fa] dark:bg-slate-950">
      <div className="ambient" aria-hidden="true" />
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-gray-200/70 bg-white/80 px-5 py-8 backdrop-blur lg:flex dark:border-slate-800 dark:bg-slate-900/70">
          <div className="mb-10 flex items-center gap-3 px-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg text-white shadow-lg shadow-indigo-600/30">
              ⚙️
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Admin Panel</p>
              <p className="text-xs text-gray-400 dark:text-slate-500">Loyalty Console</p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1.5">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`
                }
              >
                <span>{l.icon}</span>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-gray-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-semibold text-white">
                {(admin?.name || admin?.email || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{admin?.name || admin?.email}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Log out
            </button>
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-gray-100 bg-white/70 px-6 py-4 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-900/70">
            <span className="text-sm font-bold text-gray-900 dark:text-white">Admin Panel</span>
            <button onClick={handleLogout} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 dark:border-slate-700 dark:text-slate-300">
              Log out
            </button>
          </header>
          <main className="flex-1 px-4 py-10 sm:px-6 lg:px-12 lg:py-12">{children}</main>
        </div>
      </div>
    </div>
  );
}
