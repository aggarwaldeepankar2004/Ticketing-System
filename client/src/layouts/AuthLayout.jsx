import { Outlet } from 'react-router-dom';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';

const AuthLayout = () => (
  <main className="theme-page min-h-screen transition-colors dark:bg-[#08080d]">
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden bg-gradient-to-br from-[#0A0A0F] to-[#4A1992] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="text-lg font-semibold">TicketDesk Pro</div>
        <div className="max-w-xl">
          <p className="text-sm uppercase tracking-[0.18em] text-violet-100">Enterprise support operations</p>
          <h1 className="mt-5 text-5xl font-semibold leading-tight">
            Resolve issues faster with one organized ticket command center.
          </h1>
          <p className="mt-5 text-lg leading-8 text-violet-50/90">
            Role-based workflows, clean assignment queues, and auditable activity history for serious support teams.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm text-violet-50">
          <div className="rounded-xl bg-white/12 p-4 ring-1 ring-white/15 backdrop-blur">
            <strong className="block text-2xl text-white">24m</strong>
            Avg response
          </div>
          <div className="rounded-xl bg-white/12 p-4 ring-1 ring-white/15 backdrop-blur">
            <strong className="block text-2xl text-white">98%</strong>
            SLA clarity
          </div>
          <div className="rounded-xl bg-white/12 p-4 ring-1 ring-white/15 backdrop-blur">
            <strong className="block text-2xl text-white">4 roles</strong>
            Secure access
          </div>
        </div>
      </section>
      <section className="relative flex items-center justify-center px-5 py-10">
        <div className="absolute right-5 top-5">
          <ThemeToggle />
        </div>
        <Outlet />
      </section>
    </div>
  </main>
);

export default AuthLayout;
