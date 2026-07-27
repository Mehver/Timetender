import type { Settings, StorageMode, TimetenderData } from '../types';
import { DEFAULT_SETTINGS } from '../types';

const LS_DATA_KEY = 'timetender.data.v2';
const LS_SETTINGS_KEY = 'timetender.settings.v2';

/** Pluggable persistence backend for the task/tag dataset. */
export interface StorageDriver {
  /** Returns null when no data exists yet. */
  load(): Promise<TimetenderData | null>;
  save(data: TimetenderData): Promise<void>;
}

function isTimetenderData(json: unknown): json is TimetenderData {
  return (
    typeof json === 'object' &&
    json !== null &&
    Array.isArray((json as TimetenderData).tasks) &&
    Array.isArray((json as TimetenderData).tags)
  );
}

export const localDriver: StorageDriver = {
  async load() {
    try {
      const raw = localStorage.getItem(LS_DATA_KEY);
      if (!raw) return null;
      const json = JSON.parse(raw) as unknown;
      return isTimetenderData(json) ? json : null;
    } catch {
      return null;
    }
  },
  async save(data) {
    localStorage.setItem(LS_DATA_KEY, JSON.stringify(data));
  },
};

export const backendDriver: StorageDriver = {
  async load() {
    const res = await fetch('/api/data', { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`加载失败：HTTP ${res.status}`);
    const json = (await res.json()) as unknown;
    return isTimetenderData(json) ? json : null;
  },
  async save(data) {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`保存失败：HTTP ${res.status}`);
  },
};

export function getDriver(mode: StorageMode): StorageDriver {
  return mode === 'backend' ? backendDriver : localDriver;
}

/** Removes the browser-side copy of the dataset (used when switching to backend mode). */
export function clearLocalData(): void {
  try {
    localStorage.removeItem(LS_DATA_KEY);
  } catch {
    /* file:// or private mode — ignore */
  }
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(LS_SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}
