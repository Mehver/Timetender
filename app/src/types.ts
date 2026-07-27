/** Core data model of Timetender v2. */

export interface HistoryEntry {
  /** "YYYY-MM-DD HH:mm" */
  time: string;
  status: string;
}

export interface Task {
  id: string;
  title: string;
  /** "YYYY-MM-DD" */
  start: string;
  /** "YYYY-MM-DD" deadline (inclusive) */
  end: string;
  /** "#rrggbb" */
  color: string;
  tagIds: string[];
  description: string;
  finished: boolean;
  history: HistoryEntry[];
}

export interface Tag {
  id: string;
  name: string;
  type: string;
  /** "#rrggbb" */
  color: string;
}

export interface TimetenderData {
  version: 2;
  tasks: Task[];
  tags: Tag[];
}

export type StorageMode = 'local' | 'backend';

export interface Settings {
  storageMode: StorageMode;
  themeMode: 'light' | 'dark' | 'system';
  weekendHighlight: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  storageMode: 'local',
  themeMode: 'system',
  weekendHighlight: true,
};

export const EMPTY_DATA: TimetenderData = { version: 2, tasks: [], tags: [] };
