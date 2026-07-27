import { describe, expect, it } from 'vitest';
import { addDays, daysBetween, eachDay, isWeekend, taskExtent, toDateStr } from '../date';

describe('date utils', () => {
  it('normalizes legacy datetime strings', () => {
    expect(toDateStr('2021-07-05 00:10:00')).toBe('2021-07-05');
    expect(toDateStr('2021-07-01')).toBe('2021-07-01');
    expect(toDateStr('2021/7/1')).toBe('2021-07-01');
    expect(toDateStr('')).toBeNull();
    expect(toDateStr('not a date')).toBeNull();
    expect(toDateStr(null)).toBeNull();
  });

  it('computes day differences and offsets', () => {
    expect(daysBetween('2026-07-01', '2026-07-10')).toBe(9);
    expect(daysBetween('2026-07-10', '2026-07-01')).toBe(-9);
    expect(addDays('2026-07-31', 1)).toBe('2026-08-01');
    expect(eachDay('2026-07-01', 3)).toEqual(['2026-07-01', '2026-07-02', '2026-07-03']);
  });

  it('detects weekends', () => {
    expect(isWeekend('2026-07-25')).toBe(true); // Saturday
    expect(isWeekend('2026-07-26')).toBe(true); // Sunday
    expect(isWeekend('2026-07-27')).toBe(false); // Monday
  });

  it('computes task extent', () => {
    expect(
      taskExtent([
        { start: '2026-07-05', end: '2026-07-12' },
        { start: '2026-07-01', end: '2026-07-08' },
      ]),
    ).toEqual({ min: '2026-07-01', max: '2026-07-12' });
    expect(taskExtent([])).toBeNull();
  });
});
