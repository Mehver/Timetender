// @vitest-environment happy-dom
import { beforeAll, describe, expect, it } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import App from '../../App';

beforeAll(() => {
  Object.defineProperty(navigator, 'language', {
    value: 'zh-CN',
    writable: true,
    configurable: true,
  });
  // Polyfills required by MUI / Data Grid in a headless DOM.
  if (!('matchMedia' in window)) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  }
  // happy-dom has no layout engine — fake a 1200x800 viewport so that
  // virtualized components compute visible items.
  const fakeRect = {
    width: 1200,
    height: 800,
    top: 0,
    left: 0,
    right: 1200,
    bottom: 800,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect;
  HTMLElement.prototype.getBoundingClientRect = () => fakeRect;
  class RO {
    private cb: ResizeObserverCallback;
    constructor(cb: ResizeObserverCallback) {
      this.cb = cb;
    }
    observe(el: Element) {
      this.cb(
        [
          {
            target: el,
            contentRect: fakeRect,
            borderBoxSize: [{ inlineSize: 1200, blockSize: 800 }],
          } as unknown as ResizeObserverEntry,
        ],
        this as unknown as ResizeObserver,
      );
    }
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(globalThis, 'ResizeObserver', { writable: true, value: RO });
  (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
});

describe('App smoke test', () => {
  it('mounts, loads (local mode) and renders the gantt view', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    await act(async () => {
      createRoot(container).render(<App />);
    });
    // let init() + autosave settle
    await act(async () => {
      await new Promise((r) => setTimeout(r, 300));
    });

    const text = container.textContent ?? '';
    expect(text).toContain('Timetender');
    expect(text).toContain('甘特图');
    expect(text).toContain('任务列表');
    expect(text).toContain('新建任务');
    expect(text).toContain('撰写项目需求文档');
    expect(text).toContain('5 个任务');
  }, 15000);

  it('renders seeded tasks with bars and tag dots', async () => {
    localStorage.setItem(
      'timetender.data.v2',
      JSON.stringify({
        version: 2,
        tasks: [
          {
            id: 'seed1',
            title: '种子任务甲',
            start: '2026-07-20',
            end: '2026-08-05',
            color: '#42a5f5',
            tagIds: ['seetag'],
            description: '',
            finished: false,
            history: [],
          },
        ],
        tags: [{ id: 'seetag', name: '种子标签', type: '', color: '#66bb6a' }],
      }),
    );

    const container = document.createElement('div');
    document.body.appendChild(container);
    await act(async () => {
      createRoot(container).render(<App />);
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 300));
    });

    const text = container.textContent ?? '';
    expect(text).toContain('种子任务甲'); // sticky title + bar title
    expect(text).toContain('1 个任务');
  }, 15000);
});
