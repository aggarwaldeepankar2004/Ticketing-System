import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <main className="theme-page grid min-h-screen place-items-center px-5 dark:bg-[#08080d]">
    <section className="theme-surface max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-soft dark:border-slate-800 dark:bg-[#0f1020]">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-600">404</p>
      <h1 className="mt-3 text-3xl font-bold text-ink dark:text-white">Page not found</h1>
      <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
        The page you are looking for is not available in this workspace.
      </p>
      <Link className="btn-primary mt-6" to="/dashboard">
        Go to dashboard
      </Link>
    </section>
  </main>
);

export default NotFoundPage;
