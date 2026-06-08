import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import MetricCard from '../../components/ui/MetricCard.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import { dashboardService } from '../../services/dashboardService.js';
import Badge from '../../components/ui/Badge.jsx';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext.jsx';

const priorityColors = {
  Low: '#14b8a6',
  Medium: '#1976d2',
  High: '#f97316',
  Critical: '#e11d48',
};

const resolutionColors = {
  Active: '#1976d2',
  'Resolved/Closed': '#10b981',
};

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : 'No due date');

const DashboardPage = () => {
  const { isDark } = useTheme();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: dashboardService.getAnalytics,
  });

  if (isLoading) return <LoadingState label="Loading dashboard..." />;

  const totals = data?.totals || {};
  const statusData = data?.statusBreakdown || [];
  const priorityData = data?.priorityBreakdown || [];
  const assigneeData = data?.assigneeBreakdown || [];
  const departmentData = data?.departmentBreakdown || [];
  const resolutionData = data?.resolutionOverview || [];
  const axisColor = isDark ? '#cbd5e1' : '#475569';
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A0A0F] to-[#4A1992] p-6 text-white shadow-soft">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-100/85">Live service overview</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">A colorful command center for support work.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-50/90">
              Track workload, urgency, assignment pressure, and operational follow-through from one dashboard.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-white/12 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
              <p className="text-2xl font-bold">{totals.completionRate || 0}%</p>
              <p className="text-xs font-semibold text-violet-100/85">Completion</p>
            </div>
            <div className="rounded-xl bg-white/12 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
              <p className="text-2xl font-bold">{totals.overdueTickets || 0}</p>
              <p className="text-xs font-semibold text-violet-100/85">Overdue</p>
            </div>
            <div className="rounded-xl bg-white/12 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
              <p className="text-2xl font-bold">{totals.unassignedTickets || 0}</p>
              <p className="text-xs font-semibold text-violet-100/85">Unassigned</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total tickets" value={totals.totalTickets || 0} helper="All requests" />
        <MetricCard label="Open tickets" value={totals.openTickets || 0} helper="Needs triage" />
        <MetricCard label="Due soon" value={totals.dueSoonTickets || 0} helper="Next 7 days" />
        <MetricCard label="Critical tickets" value={totals.criticalTickets || 0} helper="Highest urgency" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <div className="theme-surface rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0f1020]">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-ink dark:text-white">Ticket status</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Current workload grouped by status.</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: axisColor }} />
                <YAxis allowDecimals={false} tick={{ fill: axisColor }} />
                <Tooltip />
                <Bar dataKey="tickets" fill="#1976d2" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="theme-surface rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0f1020]">
          <h2 className="text-lg font-semibold text-ink dark:text-white">Resolution mix</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Active tickets compared with resolved work.</p>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={resolutionData} dataKey="tickets" nameKey="name" innerRadius={58} outerRadius={96} paddingAngle={4}>
                  {resolutionData.map((entry) => (
                    <Cell key={entry.name} fill={resolutionColors[entry.name] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="theme-surface rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0f1020]">
          <h2 className="text-lg font-semibold text-ink dark:text-white">Priority mix</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Distribution by urgency.</p>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={priorityData} dataKey="tickets" nameKey="name" innerRadius={58} outerRadius={96} paddingAngle={4}>
                  {priorityData.map((entry) => (
                    <Cell key={entry.name} fill={priorityColors[entry.name] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="theme-surface rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0f1020]">
          <h2 className="text-lg font-semibold text-ink dark:text-white">Assignee workload</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tickets currently distributed across the team.</p>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assigneeData} layout="vertical" margin={{ left: 18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fill: axisColor }} />
                <YAxis type="category" dataKey="name" width={96} tick={{ fill: axisColor }} />
                <Tooltip />
                <Bar dataKey="tickets" fill="#06b6d4" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="theme-surface rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0f1020]">
          <h2 className="text-lg font-semibold text-ink dark:text-white">Recent tickets</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Most recently updated tickets.</p>
          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {(data?.recentTickets || []).map((ticket) => (
              <Link key={ticket.id} className="block py-3 transition hover:bg-slate-50 dark:hover:bg-slate-900" to={`/tickets/${ticket.id}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{ticket.title}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {ticket.assignedTo?.name || 'Unassigned'} · Due {formatDate(ticket.dueDate)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Badge>{ticket.status}</Badge>
                    <Badge type="priority">{ticket.priority}</Badge>
                  </div>
                </div>
              </Link>
            ))}
            {data?.recentTickets?.length === 0 && <p className="py-4 text-sm text-slate-500">No tickets yet.</p>}
          </div>
        </div>

        <div className="theme-surface rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0f1020]">
          <h2 className="text-lg font-semibold text-ink dark:text-white">Department demand</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Where requests are coming from.</p>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: axisColor }} />
                <YAxis allowDecimals={false} tick={{ fill: axisColor }} />
                <Tooltip />
                <Bar dataKey="tickets" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="theme-surface rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0f1020]">
        <div>
          <h2 className="text-lg font-semibold text-ink dark:text-white">Recent activity</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Latest ticket movement from activity logs.</p>
        </div>
        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {(data?.recentActivity || []).map((activity) => (
            <div key={activity.id} className="flex items-start justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{activity.action}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{activity.ticket?.title}</p>
              </div>
              <span className="shrink-0 text-xs font-medium text-slate-400">{activity.actor?.name}</span>
            </div>
          ))}
          {data?.recentActivity?.length === 0 && <p className="py-4 text-sm text-slate-500">No activity yet.</p>}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
