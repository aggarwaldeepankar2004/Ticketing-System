const LoadingState = ({ label = 'Loading data...' }) => (
  <div className="theme-surface rounded-lg border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500 shadow-sm dark:border-slate-800 dark:bg-[#0f1020] dark:text-slate-400">
    {label}
  </div>
);

export default LoadingState;
