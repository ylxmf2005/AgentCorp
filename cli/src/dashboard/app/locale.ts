export type Locale = 'en' | 'zh';

let current: Locale = 'en';

export function getLocale(): Locale {
  return current;
}

export function setLocale(locale: Locale): void {
  current = locale;
}

export function detectLocale(): Locale {
  try {
    const stored = window.localStorage.getItem('longrein-dashboard-locale');
    if (stored === 'en' || stored === 'zh') return stored;
  } catch {
    /* storage unavailable */
  }
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}
