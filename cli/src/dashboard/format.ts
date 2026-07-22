import type { Locale } from './app/locale';

// Locale-aware date/time + byte formatting. The Intl objects are memoised per
// locale so repeated renders stay cheap.

const dateTime = new Map<Locale, Intl.DateTimeFormat>();
const dateTimeFull = new Map<Locale, Intl.DateTimeFormat>();
const relative = new Map<Locale, Intl.RelativeTimeFormat>();

function tag(locale: Locale): string {
  return locale === 'zh' ? 'zh-CN' : 'en-US';
}

function dateTimeFmt(locale: Locale): Intl.DateTimeFormat {
  if (!dateTime.has(locale)) {
    dateTime.set(
      locale,
      new Intl.DateTimeFormat(tag(locale), { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
    );
  }
  return dateTime.get(locale)!;
}

function dateTimeFullFmt(locale: Locale): Intl.DateTimeFormat {
  if (!dateTimeFull.has(locale)) {
    dateTimeFull.set(
      locale,
      new Intl.DateTimeFormat(tag(locale), {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
      }),
    );
  }
  return dateTimeFull.get(locale)!;
}

function relativeFmt(locale: Locale): Intl.RelativeTimeFormat {
  if (!relative.has(locale)) relative.set(locale, new Intl.RelativeTimeFormat(tag(locale), { numeric: 'auto' }));
  return relative.get(locale)!;
}

function toDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(iso: string | null | undefined, locale: Locale = 'en'): string {
  const date = toDate(iso);
  if (!date) return iso ?? '—';
  return dateTimeFmt(locale).format(date);
}

export function formatDateTimeFull(iso: string | null | undefined, locale: Locale = 'en'): string {
  const date = toDate(iso);
  if (!date) return iso ?? '—';
  return dateTimeFullFmt(locale).format(date);
}

export function formatRelative(iso: string | null | undefined, locale: Locale = 'en', now = Date.now()): string {
  const date = toDate(iso);
  if (!date) return iso ?? '—';
  const seconds = Math.round((date.getTime() - now) / 1000);
  const abs = Math.abs(seconds);
  const rtf = relativeFmt(locale);
  if (abs < 45) return locale === 'zh' ? '刚刚' : seconds <= 0 ? 'just now' : 'in a moment';
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute');
  const hours = Math.round(seconds / 3600);
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');
  const days = Math.round(seconds / 86400);
  if (Math.abs(days) < 30) return rtf.format(days, 'day');
  const months = Math.round(seconds / 2_592_000);
  if (Math.abs(months) < 12) return rtf.format(months, 'month');
  return rtf.format(Math.round(seconds / 31_536_000), 'year');
}

export function formatBytes(bytes: number, locale: Locale = 'en'): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unit = 'B';
  for (const next of units) {
    if (value < 1024 || next === 'TB') {
      unit = next;
      break;
    }
    value /= 1024;
  }
  const rounded = value >= 100 ? Math.round(value) : value.toFixed(1);
  return locale === 'zh' ? `${rounded} ${unit}` : `${rounded} ${unit}`;
}

export function shortSha(hash: string | null | undefined, length = 7): string {
  if (!hash) return '—';
  return hash.slice(0, length);
}

export function isPlaceholder(text: string | null | undefined): boolean {
  if (!text) return true;
  const normalized = text.trim().toLowerCase();
  return normalized === '' || normalized === 'none' || normalized === 'unresolved';
}
