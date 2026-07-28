import type { Lang, ResolvedLang } from '../types';
import zh from './zh';
import en from './en';

const translations: Record<ResolvedLang, Record<string, string>> = {
  zh: zh as Record<string, string>,
  en,
};

export function resolveLang(lang: Lang): ResolvedLang {
  if (lang === 'system') {
    const nav = (
      typeof navigator !== 'undefined' ? navigator.language : ''
    ).toLowerCase();
    return nav.startsWith('zh') ? 'zh' : 'en';
  }
  return lang;
}

export function getT(lang: Lang) {
  const resolved = resolveLang(lang);
  return (key: string, vars?: Record<string, string | number>) => {
    const msg =
      translations[resolved]?.[key] ?? translations.zh[key] ?? key;
    if (!vars) return msg;
    return Object.entries(vars).reduce(
      (s, [k, v]) => s.replace(`{${k}}`, String(v)),
      msg,
    );
  };
}
