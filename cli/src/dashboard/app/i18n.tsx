import { createContext, useContext } from 'react';
import type { Locale } from './locale';
import { translate, type StringKey } from './strings';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const LocaleContext = createContext<LocaleContextValue>({ locale: 'en', setLocale: () => {} });

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}

export function useT(): (key: StringKey) => string {
  const { locale } = useLocale();
  return (key) => translate(locale, key);
}
