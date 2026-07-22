import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiClient } from '../api';
import { Icon } from '../components/Icon';
import { Logo } from '../components/Logo';
import { OverviewPage } from '../pages/OverviewPage';
import { TaskDetailPage } from '../pages/TaskDetailPage';
import { LocaleContext } from './i18n';
import { detectLocale, type Locale } from './locale';
import { translate } from './strings';

type Theme = 'light' | 'dark';
type Route = { view: 'overview' } | { view: 'task'; taskUid: string };

function readHashRoute(): Route {
  const match = /^#\/task\/([0-9a-f-]{36})$/i.exec(window.location.hash);
  return match ? { view: 'task', taskUid: match[1].toLowerCase() } : { view: 'overview' };
}

function writeHashRoute(route: Route): void {
  const hash = route.view === 'task' ? `#/task/${route.taskUid}` : '#/';
  if (window.location.hash !== hash) window.location.hash = hash;
}

function initialTheme(): Theme {
  try {
    const stored = window.localStorage.getItem('longrein-dashboard-theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* storage unavailable */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      className="icon-btn"
      role="switch"
      aria-checked={dark}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={onToggle}
    >
      <Icon name={dark ? 'sun' : 'moon'} size={16} />
    </button>
  );
}

function LocaleToggle({ locale, onToggle }: { locale: Locale; onToggle: () => void }) {
  return (
    <button
      type="button"
      className="icon-btn locale-btn"
      aria-label="Switch language / 切换语言"
      title="Switch language / 切换语言"
      onClick={onToggle}
    >
      {locale === 'en' ? '中' : 'EN'}
    </button>
  );
}

export function App() {
  const [route, setRoute] = useState<Route>(() => readHashRoute());
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [locale, setLocaleState] = useState<Locale>(detectLocale);

  const client = useMemo(() => new ApiClient(), []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem('longrein-dashboard-theme', theme);
    } catch {
      /* storage unavailable */
    }
  }, [theme]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem('longrein-dashboard-locale', next);
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
  }, [locale]);

  useEffect(() => {
    const onHash = () => setRoute(readHashRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const openTask = useCallback((taskUid: string) => writeHashRoute({ view: 'task', taskUid }), []);
  const goHome = useCallback(() => writeHashRoute({ view: 'overview' }), []);
  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <div className="app">
        <header className="topbar">
          <button type="button" className="brand" onClick={goHome}>
            <span className="brand-mark" aria-hidden="true">
              <Logo size={20} />
            </span>
            <span className="brand-name">Longrein</span>
            <span className="brand-sub">{translate(locale, 'appTitle')}</span>
          </button>
          <div className="topbar-side">
            <LocaleToggle locale={locale} onToggle={() => setLocale(locale === 'en' ? 'zh' : 'en')} />
            <ThemeToggle theme={theme} onToggle={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />
          </div>
        </header>

        <main className="main">
          {route.view === 'task' ? (
            <TaskDetailPage key={`${locale}-${route.taskUid}`} client={client} taskUid={route.taskUid} onBack={goHome} />
          ) : (
            <OverviewPage key={locale} client={client} onOpenTask={openTask} />
          )}
        </main>
      </div>
    </LocaleContext.Provider>
  );
}
