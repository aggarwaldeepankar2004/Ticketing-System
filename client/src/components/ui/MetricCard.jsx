const MetricCard = ({ label, value, accent = 'from-[#0A0A0F] to-[#4A1992]', helper }) => (
  <div className="theme-surface relative overflow-hidden rounded-xl border border-white/70 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-[#0f1020]">
    <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${accent}`} />
    <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-2 text-3xl font-bold text-ink dark:text-white">{value}</p>
    {helper && <p className="mt-2 text-xs font-medium text-slate-400 dark:text-slate-500">{helper}</p>}
  </div>
);

export default MetricCard;
