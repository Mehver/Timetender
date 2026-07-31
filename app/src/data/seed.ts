import type { Tag, Task, TimetenderData } from '../types';

function offsetDate(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function todayStr(): string {
  return offsetDate(new Date(), 0);
}

const SEED_TAGS: Tag[] = [
  { id: 'seed-tag-work',     name: '工作', type: '项目', color: '#42a5f5' },
  { id: 'seed-tag-personal', name: '个人', type: '生活', color: '#66bb6a' },
  { id: 'seed-tag-urgent',   name: '紧急', type: '优先级', color: '#ef5350' },
  { id: 'seed-tag-study',    name: '学习', type: '技能',  color: '#ab47bc' },
];

export function generateSeedData(): TimetenderData {
  const t = todayStr();

  const tasks: Task[] = [
    {
      id: 'seed-task-1',
      title: '撰写项目需求文档',
      start: offsetDate(new Date(), -5),
      end: offsetDate(new Date(), 2),
      color: '#42a5f5',
      tagIds: ['seed-tag-work'],
      description: '梳理功能需求、绘制原型图、编写 PRD 文档',
      finished: false,
      history: [
        { time: `${offsetDate(new Date(), -4)} 10:00`, status: '开始调研' },
        { time: `${offsetDate(new Date(), -2)} 15:30`, status: '完成初稿' },
      ],
    },
    {
      id: 'seed-task-2',
      title: '前端页面开发',
      start: offsetDate(new Date(), -2),
      end: offsetDate(new Date(), 10),
      color: '#ef5350',
      tagIds: ['seed-tag-work', 'seed-tag-urgent'],
      description: '使用 React + TypeScript 开发核心页面，对接后端 API',
      finished: false,
      history: [
        { time: `${offsetDate(new Date(), -1)} 09:00`, status: '搭建项目脚手架' },
      ],
    },
    {
      id: 'seed-task-3',
      title: '代码审查与重构',
      start: offsetDate(new Date(), 3),
      end: offsetDate(new Date(), 14),
      color: '#42a5f5',
      tagIds: ['seed-tag-work'],
      description: 'Review 现有代码、统一错误处理、补充单元测试',
      finished: false,
      history: [],
    },
    {
      id: 'seed-task-4',
      title: '学习 Rust 编程',
      start: offsetDate(new Date(), -3),
      end: offsetDate(new Date(), 20),
      color: '#ab47bc',
      tagIds: ['seed-tag-study', 'seed-tag-personal'],
      description: '阅读《The Rust Programming Language》，完成 Rustlings 练习',
      finished: false,
      history: [
        { time: `${offsetDate(new Date(), -3)} 20:00`, status: '安装 Rust 工具链' },
      ],
    },
    {
      id: 'seed-task-5',
      title: '每周运动计划',
      start: offsetDate(new Date(), -1),
      end: offsetDate(new Date(), 6),
      color: '#66bb6a',
      tagIds: ['seed-tag-personal'],
      description: '周一三五跑步 5 公里，周二四游泳 1 小时',
      finished: false,
      history: [],
    },
  ];

  return { version: 2, tasks, tags: SEED_TAGS };
}
