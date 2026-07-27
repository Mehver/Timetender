import { describe, expect, it } from 'vitest';
import type { Tag } from '../../types';
import { rowsToTasks, tasksToTsv, tsvToTasks } from '../taskio';

const tags: Tag[] = [
  { id: 'tag1', name: '工作', type: 'life', color: '#42a5f5' },
  { id: 'tag2', name: '学习', type: 'life', color: '#66bb6a' },
];

describe('task TSV interchange', () => {
  it('exports with header and re-imports (round trip)', () => {
    const tsv = [
      '标题\t开始\t截止\t标签\t颜色\t已完成\t描述',
      '写报告\t2026-07-01\t2026-07-05\t工作, 学习\t#ff0000\t是\t备注一',
    ].join('\n');
    const { tasks, newTags } = tsvToTasks(tsv, tags);
    expect(newTags).toHaveLength(0);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('写报告');
    expect(tasks[0].tagIds.sort()).toEqual(['tag1', 'tag2']);
    expect(tasks[0].finished).toBe(true);
    expect(tasksToTsv(tasks, tags)).toContain('写报告');
  });

  it('accepts positional rows without header and auto-creates tags', () => {
    const { tasks, newTags } = rowsToTasks(
      [['画原型图', '2026-08-01', '2026-08-03', '设计']],
      tags,
    );
    expect(tasks).toHaveLength(1);
    expect(tasks[0].finished).toBe(false);
    expect(newTags).toHaveLength(1);
    expect(newTags[0].name).toBe('设计');
    expect(tasks[0].tagIds).toEqual([newTags[0].id]);
  });

  it('skips rows without valid dates', () => {
    const { tasks } = rowsToTasks([['坏行', 'abc', 'def']], tags);
    expect(tasks).toHaveLength(0);
  });

  it('clamps end before start', () => {
    const { tasks } = rowsToTasks([['反向', '2026-08-10', '2026-08-01']], tags);
    expect(tasks[0].end).toBe('2026-08-10');
  });
});
