import { nanoid } from 'nanoid';
import type { Tag, Task, TimetenderData } from '../types';
import { normalizeHex, pickDefaultColor } from './color';
import { toDateStr } from './date';

/** Converters for the Timetender v0.1.x (Luckysheet-era) JSON files. */

interface LegacyTagRef {
  id: number | string;
}

interface LegacyEvent {
  id?: number | string;
  title?: string;
  start?: string;
  ddl?: string;
  tags?: LegacyTagRef[];
  color?: string;
  description?: string;
  history?: { time?: string; status?: string }[];
  finished?: boolean;
}

interface LegacyTag {
  id?: number | string;
  color?: string;
  type?: string;
  tag?: string;
}

export function isLegacyEventsJson(json: unknown): boolean {
  return (
    Array.isArray(json) &&
    json.length > 0 &&
    json.every(
      (e) => typeof e === 'object' && e !== null && ('ddl' in e || 'start' in e) && 'title' in e,
    )
  );
}

export function isLegacyTagsJson(json: unknown): boolean {
  return (
    Array.isArray(json) &&
    json.length > 0 &&
    json.every((t) => typeof t === 'object' && t !== null && 'tag' in t && 'color' in t)
  );
}

/**
 * Converts old `event.json` (+ optional `tag.json`) into the v2 data model.
 * Invalid rows are skipped; referenced-but-undefined tags are auto-created.
 */
export function convertLegacy(eventsJson: unknown, tagsJson: unknown): TimetenderData {
  const tags: Tag[] = [];
  const tagIdMap = new Map<string, string>(); // legacy id -> new id

  if (Array.isArray(tagsJson)) {
    for (const raw of tagsJson as LegacyTag[]) {
      const newId = nanoid();
      tags.push({
        id: newId,
        name: String(raw.tag ?? '').trim() || '未命名标签',
        type: String(raw.type ?? '').trim(),
        color: normalizeHex(raw.color ?? '') ?? pickDefaultColor(tags.length),
      });
      if (raw.id !== undefined) tagIdMap.set(String(raw.id), newId);
    }
  }

  const ensureTag = (legacyId: string): string => {
    const mapped = tagIdMap.get(legacyId);
    if (mapped) return mapped;
    const newId = nanoid();
    tags.push({
      id: newId,
      name: `标签 ${legacyId}`,
      type: '',
      color: pickDefaultColor(tags.length),
    });
    tagIdMap.set(legacyId, newId);
    return newId;
  };

  const tasks: Task[] = [];
  if (Array.isArray(eventsJson)) {
    for (const raw of eventsJson as LegacyEvent[]) {
      const start = toDateStr(raw.start ?? '');
      const end = toDateStr(raw.ddl ?? '');
      if (!start || !end) continue;
      tasks.push({
        id: nanoid(),
        title: String(raw.title ?? '').trim() || '未命名任务',
        start,
        end: end < start ? start : end,
        color: normalizeHex(raw.color ?? '') ?? pickDefaultColor(tasks.length),
        tagIds: (raw.tags ?? [])
          .map((t) => (t?.id !== undefined ? ensureTag(String(t.id)) : null))
          .filter((x): x is string => x !== null),
        description: String(raw.description ?? ''),
        finished: Boolean(raw.finished),
        history: (raw.history ?? [])
          .filter((h) => h && (h.time || h.status))
          .map((h) => ({
            time: String(h.time ?? '').slice(0, 16),
            status: String(h.status ?? ''),
          })),
      });
    }
  }

  return { version: 2, tasks, tags };
}
