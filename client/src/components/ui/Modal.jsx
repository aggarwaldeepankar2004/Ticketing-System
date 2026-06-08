const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
    <div className="theme-surface max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl dark:border dark:border-slate-800 dark:bg-[#0f1020]">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-ink dark:text-white">{title}</h2>
        <button type="button" className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

export default Modal;
