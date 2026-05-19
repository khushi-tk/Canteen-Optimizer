import { useTheme } from '../context/ThemeContext';

export function ThemeToggle() {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="
        relative inline-flex h-7 w-13 items-center rounded-full
        transition-colors duration-300
        bg-slate-200 dark:bg-slate-700
        focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
      "
        >
            {/* Track icons */}
            <span className="absolute left-1 text-xs">☀️</span>
            <span className="absolute right-1 text-xs">🌙</span>

            {/* Thumb */}
            <span
                className={`
          inline-block h-5 w-5 transform rounded-full bg-white shadow-md
          transition-transform duration-300
          ${isDark ? 'translate-x-6' : 'translate-x-1'}
        `}
            />
        </button>
    );
}