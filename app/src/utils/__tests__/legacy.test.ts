import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { convertLegacy, isLegacyEventsJson, isLegacyTagsJson } from '../legacy';

const eventsJson = JSON.parse(
  readFileSync(join(__dirname, '../../../data/event.json'), 'utf8'),
) as unknown;
const tagsJson = JSON.parse(
  readFileSync(join(__dirname, '../../../data/tag.json'), 'utf8'),
) as unknown;

describe('legacy converter (v0.1.x event.json/tag.json)', () => {
  it('detects legacy shapes', () => {
    expect(isLegacyEventsJson(eventsJson)).toBe(true);
    expect(isLegacyTagsJson(tagsJson)).toBe(true);
    expect(isLegacyEventsJson({ version: 2, tasks: [], tags: [] })).toBe(false);
  });

  it('converts all events with normalized dates and colors', () => {
    const data = convertLegacy(eventsJson, tagsJson);
    expect(data.version).toBe(2);
    expect(data.tasks).toHaveLength(4);
    expect(data.tags).toHaveLength(4);

    const t1 = data.tasks.find((t) => t.title === 'test1')!;
    expect(t1.start).toBe('2021-07-01');
    expect(t1.end).toBe('2021-07-10');
    expect(t1.color).toBe('#ff0000');
    expect(t1.finished).toBe(false);
    expect(t1.history).toHaveLength(2);

    // "#aba" must be expanded to "#aabbaa"
    const t4 = data.tasks.find((t) => t.title === 'test4')!;
    expect(t4.color).toBe('#aabbaa');
  });

  it('keeps tag references consistent', () => {
    const data = convertLegacy(eventsJson, tagsJson);
    const tagIds = new Set(data.tags.map((t) => t.id));
    for (const task of data.tasks) {
      for (const id of task.tagIds) expect(tagIds.has(id)).toBe(true);
    }
    const t3 = data.tasks.find((t) => t.title === 'test3')!;
    expect(t3.tagIds).toHaveLength(3);
  });
});
