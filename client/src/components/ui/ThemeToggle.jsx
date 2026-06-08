import { useTheme } from '../../context/ThemeContext.jsx';

const ThemeToggle = () => {
  const { isDark, setTheme } = useTheme();

  return (
    <div
      className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      role="group"
      aria-label="Theme selector"
    >
      <button
        type="button"
        className={`rounded-md px-2.5 py-1.5 transition ${!isDark ? 'bg-[#4A1992] text-white' : 'text-slate-500 dark:text-slate-400'}`}
        onClick={() => setTheme('light')}
        aria-pressed={!isDark}
      >
        Light
      </button>
      <button
        type="button"
        className={`rounded-md px-2.5 py-1.5 transition ${isDark ? 'bg-[#4A1992] text-white' : 'text-slate-500'}`}
        onClick={() => setTheme('dark')}
        aria-pressed={isDark}
      >
        Dark
      </button>
    </div>
  );
};

export default ThemeToggle;
