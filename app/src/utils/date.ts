import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';

import type { ResolvedLang } from '../types';

let currentLocale: string = 'zh-cn';

export function setDayjsLocale(lang: ResolvedLang): void {
  currentLocale = lang === 'zh' ? 'zh-cn' : 'en';
  dayjs.locale(currentLocale);
}

dayjs.locale(currentLocale);

export const DATE_FMT = 'YYYY-MM-DD';

export function todayStr(): string {
  return dayjs().format(DATE_FMT);
}

/** Normalizes various date-ish strings to "YYYY-MM-DD". Returns null if unparseable. */
export function toDateStr(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Legacy values look like "2021-07-05 00:10:00" — the date part is enough.
  const candidate = trimmed.length > 10 ? trimmed.slice(0, 10) : trimmed;
  const d = dayjs(candidate);
  if (!d.isValid()) return null;
  const s = d.format(DATE_FMT);
  // Reject obvious garbage that dayjs coerces (e.g. bare numbers as years).
  if (Number(s.slice(0, 4)) < 1970) return null;
  return s;
}

export function addDays(date: string, n: number): string {
  return dayjs(date).add(n, 'day').format(DATE_FMT);
}

/** Number of whole days from a to b (b - a). */
export function daysBetween(a: string, b: string): number {
  return dayjs(b).startOf('day').diff(dayjs(a).startOf('day'), 'day');
}

export function isWeekend(date: string): boolean {
  const w = dayjs(date).day();
  return w === 0 || w === 6;
}

export function weekdayLabel(date: string): string {
  return dayjs(date).format('dd');
}

/** Inclusive day list starting at `start`. */
export function eachDay(start: string, count: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) out.push(addDays(start, i));
  return out;
}

/** min/max across task start/end dates. Null when no tasks. */
export function taskExtent(tasks: { start: string; end: string }[]): { min: string; max: string } | null {
  if (tasks.length === 0) return null;
  let min = tasks[0].start;
  let max = tasks[0].end;
  for (const t of tasks) {
    if (t.start < min) min = t.start;
    if (t.end > max) max = t.end;
  }
  return { min, max };
}

export function sortTasks<T extends { start: string; end: string; title: string }>(tasks: T[], lang?: ResolvedLang): T[] {
  const collationLocale = lang === 'en' ? 'en' : 'zh-CN';
  return [...tasks].sort((a, b) => {
    if (a.start !== b.start) return a.start < b.start ? -1 : 1;
    if (a.end !== b.end) return a.end < b.end ? -1 : 1;
    return a.title.localeCompare(b.title, collationLocale);
  });
}
