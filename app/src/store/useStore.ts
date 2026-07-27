import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { Settings, Tag, Task, TimetenderData } from '../types';
import { EMPTY_DATA } from '../types';
import { pickDefaultColor } from '../utils/color';
import {
  clearLocalData,
  getDriver,
  loadSettings,
  saveSettings,
} from '../storage/persistence';

export type ViewKind = 'gantt' | 'table';
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface TaskDialogState {
  open: boolean;
  /** null → creating a new task */
  taskId: string | null;
  /** prefill for a new task (e.g. the clicked day on the gantt) */
  prefillDate: string | null;
}

interface Notify {
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
}

interface AppState {
  data: TimetenderData;
  loaded: boolean;
  settings: Settings;
  saveStatus: SaveStatus;
  view: ViewKind;
  notify: Notify | null;

  taskDialog: TaskDialogState;
  tagsDialogOpen: boolean;
  settingsDialogOpen: boolean;
  ioDialogOpen: boolean;

  init: () => Promise<void>;
  showNotify: (message: string, severity?: Notify['severity']) => void;
  dismissNotify: () => void;
  setView: (view: ViewKind) => void;

  openTaskDialog: (taskId?: string, prefillDate?: string) => void;
  closeTaskDialog: () => void;
  setTagsDialogOpen: (open: boolean) => void;
  setSettingsDialogOpen: (open: boolean) => void;
  setIoDialogOpen: (open: boolean) => void;

  upsertTask: (task: Task) => void;
  removeTask: (id: string) => void;
  addImported: (tasks: Task[], newTags: Tag[], mode: 'append' | 'replace') => void;

  upsertTag: (tag: Tag) => void;
  removeTag: (id: string) => void;

  updateSettings: (patch: Partial<Settings>) => void;
  /**
   * Switches storage mode.
   * - to backend: uploads current data if the backend is empty, otherwise pulls
   *   the backend copy (asked by the caller); the browser copy is removed.
   * - to local: the current in-memory data is persisted to the browser again.
   */
  switchStorageMode: (mode: Settings['storageMode'], direction?: 'push' | 'pull') => Promise<void>;
  clearAllData: () => void;
}

function touchData(data: TimetenderData, patch: Partial<TimetenderData>): TimetenderData {
  return { ...data, ...patch };
}

export const useStore = create<AppState>()((set, get) => ({
  data: EMPTY_DATA,
  loaded: false,
  settings: loadSettings(),
  saveStatus: 'idle',
  view: 'gantt',
  notify: null,

  taskDialog: { open: false, taskId: null, prefillDate: null },
  tagsDialogOpen: false,
  settingsDialogOpen: false,
  ioDialogOpen: false,

  init: async () => {
    const { settings } = get();
    try {
      const data = await getDriver(settings.storageMode).load();
      // Suppress the autosave triggered by the load itself.
      suppressSave = true;
      set({ data: data ?? EMPTY_DATA, loaded: true });
      suppressSave = false;
    } catch (e) {
      set({ loaded: true });
      get().showNotify(e instanceof Error ? e.message : '数据加载失败', 'error');
    }
  },

  showNotify: (message, severity = 'info') => set({ notify: { message, severity } }),
  dismissNotify: () => set({ notify: null }),
  setView: (view) => set({ view }),

  openTaskDialog: (taskId, prefillDate) =>
    set({ taskDialog: { open: true, taskId: taskId ?? null, prefillDate: prefillDate ?? null } }),
  closeTaskDialog: () =>
    set({ taskDialog: { open: false, taskId: null, prefillDate: null } }),
  setTagsDialogOpen: (open) => set({ tagsDialogOpen: open }),
  setSettingsDialogOpen: (open) => set({ settingsDialogOpen: open }),
  setIoDialogOpen: (open) => set({ ioDialogOpen: open }),

  upsertTask: (task) =>
    set((s) => {
      const exists = s.data.tasks.some((t) => t.id === task.id);
      const tasks = exists
        ? s.data.tasks.map((t) => (t.id === task.id ? task : t))
        : [...s.data.tasks, task];
      return { data: touchData(s.data, { tasks }) };
    }),

  removeTask: (id) =>
    set((s) => ({
      data: touchData(s.data, { tasks: s.data.tasks.filter((t) => t.id !== id) }),
    })),

  addImported: (tasks, newTags, mode) =>
    set((s) => {
      if (mode === 'replace') {
        return { data: touchData(s.data, { tasks, tags: newTags }) };
      }
      // Merge tags by name (case-insensitive) and remap incoming tag ids.
      const byName = new Map(s.data.tags.map((t) => [t.name.toLowerCase(), t.id]));
      const idRemap = new Map<string, string>();
      const mergedTags = [...s.data.tags];
      for (const tag of newTags) {
        const existing = byName.get(tag.name.toLowerCase());
        if (existing) {
          idRemap.set(tag.id, existing);
        } else {
          mergedTags.push(tag);
          byName.set(tag.name.toLowerCase(), tag.id);
        }
      }
      const mergedTasks = tasks.map((t) => ({
        ...t,
        id: s.data.tasks.some((x) => x.id === t.id) ? nanoid() : t.id,
        tagIds: t.tagIds.map((id) => idRemap.get(id) ?? id),
      }));
      return {
        data: touchData(s.data, {
          tasks: [...s.data.tasks, ...mergedTasks],
          tags: mergedTags,
        }),
      };
    }),

  upsertTag: (tag) =>
    set((s) => {
      const exists = s.data.tags.some((t) => t.id === tag.id);
      const tags = exists
        ? s.data.tags.map((t) => (t.id === tag.id ? tag : t))
        : [...s.data.tags, tag];
      return { data: touchData(s.data, { tags }) };
    }),

  removeTag: (id) =>
    set((s) => ({
      data: touchData(s.data, {
        tags: s.data.tags.filter((t) => t.id !== id),
        tasks: s.data.tasks.map((t) =>
          t.tagIds.includes(id) ? { ...t, tagIds: t.tagIds.filter((x) => x !== id) } : t,
        ),
      }),
    })),

  updateSettings: (patch) => {
    const settings = { ...get().settings, ...patch };
    saveSettings(settings);
    set({ settings });
  },

  switchStorageMode: async (mode, direction) => {
    const s = get();
    if (mode === s.settings.storageMode) return;
    if (mode === 'backend') {
      try {
        const remote = await getDriver('backend').load();
        if (remote && direction !== 'push') {
          set({ data: remote });
        } else {
          await getDriver('backend').save(s.data);
        }
        clearLocalData();
        s.updateSettings({ storageMode: 'backend' });
        s.showNotify('已切换到后端存储，数据不再保存在浏览器中', 'success');
      } catch (e) {
        s.showNotify(
          `切换失败：${e instanceof Error ? e.message : '无法连接后端'}`,
          'error',
        );
        return;
      }
    } else {
      s.updateSettings({ storageMode: 'local' });
      // Persist immediately so a reload does not lose anything.
      await getDriver('local').save(get().data);
      s.showNotify('已切换到浏览器本地存储', 'success');
    }
    scheduleSave();
  },

  clearAllData: () => set({ data: EMPTY_DATA }),
}));

/* ------------------------------ autosave ------------------------------- */

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let suppressSave = false; // set around store updates that must not trigger autosave

export function scheduleSave(): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSave, 800);
}

async function flushSave(): Promise<void> {
  const { data, settings, loaded } = useStore.getState();
  if (!loaded) return;
  useStore.setState({ saveStatus: 'saving' });
  try {
    await getDriver(settings.storageMode).save(data);
    useStore.setState({ saveStatus: 'saved' });
  } catch (e) {
    useStore.setState({ saveStatus: 'error' });
    useStore
      .getState()
      .showNotify(e instanceof Error ? e.message : '保存失败', 'error');
  }
}

// Auto-persist whenever the dataset changes (debounced).
useStore.subscribe((state, prev) => {
  if (!state.loaded) return;
  if (state.data === prev.data) return;
  if (suppressSave) return;
  scheduleSave();
});

/* ------------------------------ factories ------------------------------ */

export function makeEmptyTask(date: string, existingCount: number): Task {
  return {
    id: nanoid(),
    title: '',
    start: date,
    end: date,
    color: pickDefaultColor(existingCount),
    tagIds: [],
    description: '',
    finished: false,
    history: [],
  };
}
