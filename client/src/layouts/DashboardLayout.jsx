import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', roles: ['Admin', 'Manager', 'Support Agent'] },
  { label: 'Tickets', to: '/tickets' },
  { label: 'Users', to: '/users', roles: ['Admin', 'Manager', 'Support Agent'] },
];

const DashboardLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const visibleNavItems = navItems.filter((item) => !item.roles || item.roles.includes(user?.role));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="theme-page min-h-screen text-slate-900 transition-colors dark:bg-[#08080d] dark:text-slate-100">
      <aside className="theme-surface fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-5 py-6 transition-colors dark:border-slate-800 dark:bg-[#0f1020] lg:block">
        <div className="rounded-xl bg-gradient-to-br from-[#0A0A0F] to-[#4A1992] p-4 text-white shadow-soft">
          <div className="text-xl font-bold">TicketDesk Pro</div>
          <p className="mt-1 text-xs font-medium text-violet-100/90">Service operations suite</p>
        </div>
        <nav className="mt-8 space-y-1">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-brand-50 text-brand-700 shadow-sm dark:bg-violet-500/15 dark:text-violet-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="theme-surface sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur transition-colors dark:border-slate-800 dark:bg-[#0f1020]/90 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back</p>
              <h2 className="text-lg font-semibold text-ink dark:text-white">{user?.name}</h2>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200 sm:inline">
                {user?.role}
              </span>
              <button type="button" className="btn-secondary" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `shrink-0 rounded-lg px-3 py-2 text-sm font-semibold ${
                    isActive ? 'bg-brand-50 text-brand-700 dark:bg-violet-500/15 dark:text-violet-100' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="px-5 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
