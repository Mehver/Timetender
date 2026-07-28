import { createContext, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useStore } from '../store/useStore';
import { getT, resolveLang } from './static';
import type { TranslationKey } from './zh';
import type { ResolvedLang } from '../types';

interface I18nContextValue {
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  lang: ResolvedLang;
}

const I18nContext = createContext<I18nContextValue>({
  t: (key: string) => key,
  lang: 'en' as ResolvedLang,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const lang = useStore((s) => s.settings.lang);
  const resolvedLang = resolveLang(lang);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) =>
      getT(resolvedLang)(key, vars),
    [resolvedLang],
  );

  return (
    <I18nContext.Provider value={{ t, lang: resolvedLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT() {
  return useContext(I18nContext).t;
}

export function useLang() {
  return useContext(I18nContext).lang;
}

export type { TranslationKey };
