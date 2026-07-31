// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeEmptyTask, useStore } from '../../store/useStore';

describe('store autosave (local mode)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('persists the first edit after a fresh (empty) init', async () => {
    await useStore.getState().init();
    expect(useStore.getState().loaded).toBe(true);

    useStore.getState().upsertTask({ ...makeEmptyTask('2026-07-27', 0), title: '首次编辑' });
    await vi.advanceTimersByTimeAsync(1000);

    const raw = localStorage.getItem('timetender.data.v2');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!) as { tasks: { title: string }[] };
    expect(parsed.tasks.some((t) => t.title === '首次编辑')).toBe(true);
  });

  it('does not save right after loading existing data', async () => {
    localStorage.setItem(
      'timetender.data.v2',
      JSON.stringify({ version: 2, tasks: [{ id: 'x' }], tags: [] }),
    );
    await useStore.getState().init();
    await vi.advanceTimersByTimeAsync(2000);
    // The load itself must not have triggered a write that could clobber data
    // (e.g. with a partially-initialized state). Content stays intact.
    const parsed = JSON.parse(localStorage.getItem('timetender.data.v2')!) as {
      tasks: unknown[];
    };
    expect(parsed.tasks).toHaveLength(1);
  });
});
