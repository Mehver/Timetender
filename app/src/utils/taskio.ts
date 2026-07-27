import { nanoid } from 'nanoid';
import type { Tag, Task } from '../types';
import { normalizeHex, pickDefaultColor } from './color';
import { toDateStr } from './date';
import { parseTsv, toTsv } from './tsv';

/** Column layout used for Excel/CSV interchange of the task list. */
export const TASK_TSV_HEADERS = ['标题', '开始', '截止', '标签', '颜色', '已完成', '描述'] as const;

function tagNames(task: Task, tags: Tag[]): string {
  const byId = new Map(tags.map((t) => [t.id, t.name]));
  return task.tagIds.map((id) => byId.get(id)).filter(Boolean).join(', ') as string;
}

export function tasksToRows(tasks: Task[], tags: Tag[]): string[][] {
  return [
    [...TASK_TSV_HEADERS],
    ...tasks.map((t) => [
      t.title,
      t.start,
      t.end,
      tagNames(t, tags),
      t.color,
      t.finished ? '是' : '否',
      t.description,
    ]),
  ];
}

export function tasksToTsv(tasks: Task[], tags: Tag[]): string {
  return toTsv(tasksToRows(tasks, tags));
}

export function tasksToCsv(tasks: Task[], tags: Tag[]): string {
  const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  // BOM so that Excel opens the file with UTF-8 decoding.
  return '\ufeff' + tasksToRows(tasks, tags).map((row) => row.map(esc).join(',')).join('\r\n');
}

function parseFinished(v: string): boolean {
  const s = v.trim().toLowerCase();
  return ['是', 'true', '1', 'yes', 'y', '完成', 'done', '✓'].includes(s);
}

/**
 * Converts TSV rows (pasted from Excel) into tasks.
 * - A leading header row matching TASK_TSV_HEADERS (or the English aliases) is auto-detected.
 * - With a header, columns are matched by name; otherwise positional order is assumed.
 * - Unknown tag names are auto-created and returned in `newTags`.
 */
export function rowsToTasks(
  rows: string[][],
  existingTags: Tag[],
): { tasks: Task[]; newTags: Tag[] } {
  if (rows.length === 0) return { tasks: [], newTags: [] };

  const HEADER_ALIASES: Record<string, string> = {
    标题: 'title', title: 'title', 任务: 'title', 名称: 'title', name: 'title',
    开始: 'start', start: 'start', 开始日期: 'start',
    截止: 'end', end: 'end', ddl: 'end', 截止日期: 'end', 截止日: 'end', deadline: 'end',
    标签: 'tags', tags: 'tags', tag: 'tags',
    颜色: 'color', color: 'color',  colour: 'color',
    已完成: 'finished', finished: 'finished', 完成: 'finished', done: 'finished',
    描述: 'description', description: 'description', 备注: 'description', desc: 'description',
  };

  const first = rows[0].map((c) => c.trim().toLowerCase());
  const headerMatches = first.filter((c) => HEADER_ALIASES[c] !== undefined).length;
  const hasHeader = headerMatches >= 2;

  const DEFAULT_ORDER = ['title', 'start', 'end', 'tags', 'color', 'finished', 'description'];
  const columnOf = hasHeader
    ? first.map((c) => HEADER_ALIASES[c] ?? null)
    : DEFAULT_ORDER.map((name) => name as string | null);

  const body = hasHeader ? rows.slice(1) : rows;

  const newTags: Tag[] = [];
  const tagByName = new Map(existingTags.map((t) => [t.name.toLowerCase(), t]));
  const ensureTag = (name: string): string => {
    const key = name.toLowerCase();
    const found = tagByName.get(key);
    if (found) return found.id;
    const tag: Tag = { id: nanoid(), name, type: '', color: pickDefaultColor(tagByName.size) };
    newTags.push(tag);
    tagByName.set(key, tag);
    return tag.id;
  };

  const tasks: Task[] = [];
  for (const row of body) {
    const get = (field: string): string => {
      const idx = columnOf.indexOf(field);
      return idx >= 0 ? (row[idx] ?? '') : '';
    };
    const title = get('title') || row[0] || '';
    const start = toDateStr(get('start'));
    const end = toDateStr(get('end'));
    if (!title.trim() || !start || !end) continue;
    const tagsCell = get('tags');
    tasks.push({
      id: nanoid(),
      title: title.trim(),
      start,
      end: end < start ? start : end,
      color: normalizeHex(get('color')) ?? pickDefaultColor(tasks.length),
      tagIds: tagsCell
        ? tagsCell.split(/[,，、;；]/).map((s) => s.trim()).filter(Boolean).map(ensureTag)
        : [],
      description: get('description'),
      finished: parseFinished(get('finished')),
      history: [],
    });
  }

  return { tasks, newTags };
}

export function tsvToTasks(text: string, existingTags: Tag[]): { tasks: Task[]; newTags: Tag[] } {
  return rowsToTasks(parseTsv(text), existingTags);
}
