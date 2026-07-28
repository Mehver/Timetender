import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  ClipboardEvent as ReactClipboardEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TodayIcon from '@mui/icons-material/Today';
import { useVirtualizer } from '@tanstack/react-virtual';

import { useStore } from '../store/useStore';
import type { Tag, Task } from '../types';
import {
  addDays,
  daysBetween,
  eachDay,
  isWeekend,
  sortTasks,
  taskExtent,
  todayStr,
  weekdayLabel,
} from '../utils/date';
import { readableTextColor, withAlpha } from '../utils/color';
import { toTsv } from '../utils/tsv';
import { copyText } from '../utils/clipboard';
import { useT, useLang } from '../i18n';

const TITLE_W = 220;
const CELL_W = 36;
const CELL_H = 28;
const HEADER_H = 38;
const MAX_DAYS = 732;

interface Selection {
  r1: number;
  c1: number;
  r2: number;
  c2: number;
}

function isCovered(task: Task, day: string): boolean {
  return day >= task.start && day <= task.end;
}

/* ------------------------------ gantt row ------------------------------ */

interface RowProps {
  rowIndex: number;
  task: Task;
  tagById: Map<string, Tag>;
  days: string[];
  top: number;
  height: number;
  today: string;
  weekendHighlight: boolean;
  selMinCol: number | null;
  selMaxCol: number | null;
  dividerColor: string;
  weekendColor: string;
  todayColor: string;
  unnamedLabel: string;
  onCellMouseDown: (row: number, col: number, e: ReactMouseEvent) => void;
  onCellMouseEnter: (row: number, col: number) => void;
  onTitleClick: (taskId: string) => void;
  onCellDoubleClick: (taskId: string) => void;
}

const GanttRow = memo(function GanttRow(props: RowProps) {
  const {
    rowIndex,
    task,
    tagById,
    days,
    top,
    height,
    today,
    weekendHighlight,
    selMinCol,
    selMaxCol,
    dividerColor,
    weekendColor,
    todayColor,
    unnamedLabel,
    onCellMouseDown,
    onCellMouseEnter,
    onTitleClick,
    onCellDoubleClick,
  } = props;

  const firstDay = days[0];
  const lastDay = days[days.length - 1];
  const startIdx = daysBetween(firstDay, task.start);
  const endIdx = daysBetween(firstDay, task.end);
  const visStart = Math.max(0, startIdx);
  const visEnd = Math.min(days.length - 1, endIdx);
  const barVisible = task.start <= lastDay && task.end >= firstDay;

  const textColor = readableTextColor(task.color);

  return (
    <div style={{ position: 'absolute', top, left: 0, height, width: '100%', display: 'flex' }}>
      {/* sticky title cell */}
      <div
        onClick={() => onTitleClick(task.id)}
        title={`${task.title}\n${task.start} ~ ${task.end}`}
        style={{
          position: 'sticky',
          left: 0,
          zIndex: 5,
          width: TITLE_W,
          flex: '0 0 auto',
          height: '100%',
          boxSizing: 'border-box',
          background: task.color,
          color: textColor,
          opacity: task.finished ? 0.55 : 1,
          borderRight: `1px solid ${dividerColor}`,
          borderBottom: `1px solid ${dividerColor}`,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '0 8px',
          cursor: 'pointer',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: 13,
            fontWeight: task.finished ? 400 : 600,
            textDecoration: task.finished ? 'line-through' : 'none',
          }}
        >
          {task.title || unnamedLabel}
        </span>
        <span style={{ display: 'inline-flex', gap: 3, flex: '0 0 auto' }}>
          {task.tagIds.map((id) => {
            const tag = tagById.get(id);
            if (!tag) return null;
            return (
              <span
                key={id}
                title={tag.name}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: tag.color,
                  display: 'inline-block',
                }}
              />
            );
          })}
        </span>
      </div>
      {/* day cells */}
      {days.map((day, j) => {
        const covered = barVisible && j >= visStart && j <= visEnd;
        const isToday = day === today;
        let bg: string | undefined;
        if (covered) {
          bg = withAlpha(task.color, task.finished ? 0.35 : 0.85);
        } else if (isToday) {
          bg = todayColor;
        } else if (weekendHighlight && isWeekend(day)) {
          bg = weekendColor;
        }
        const selected =
          selMinCol !== null && selMaxCol !== null && j >= selMinCol && j <= selMaxCol;
        const showBarTitle = covered && j === visStart;
        const showEndMark = covered && j === visEnd && task.end <= lastDay && task.finished;
        return (
          <div
            key={day}
            onMouseDown={(e) => onCellMouseDown(rowIndex, j, e)}
            onMouseEnter={() => onCellMouseEnter(rowIndex, j)}
            onDoubleClick={() => onCellDoubleClick(task.id)}
            style={{
              position: 'relative',
              width: CELL_W,
              flex: '0 0 auto',
              height: '100%',
              boxSizing: 'border-box',
              borderRight: `1px solid ${dividerColor}`,
              borderBottom: `1px solid ${dividerColor}`,
              background: bg,
              outline: selected ? '1.5px solid rgba(25, 118, 210, 0.9)' : undefined,
              outlineOffset: -1.5,
              cursor: 'cell',
              userSelect: 'none',
            }}
          >
            {showBarTitle && (
              <span
                style={{
                  position: 'absolute',
                  left: 4,
                  top: 0,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  zIndex: 2,
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  fontSize: 12,
                  fontWeight: 600,
                  color: textColor,
                }}
              >
                {task.title}
              </span>
            )}
            {showEndMark && (
              <span
                style={{
                  position: 'absolute',
                  right: 2,
                  top: 0,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  zIndex: 2,
                  pointerEvents: 'none',
                  fontSize: 12,
                  color: textColor,
                }}
              >
                ✓
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
});

/* ------------------------------ main view ------------------------------ */

export default function GanttView() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const tasks = useStore((s) => s.data.tasks);
  const tags = useStore((s) => s.data.tags);
  const weekendHighlight = useStore((s) => s.settings.weekendHighlight);
  const openTaskDialog = useStore((s) => s.openTaskDialog);
  const showNotify = useStore((s) => s.showNotify);
  const t = useT();
  const lang = useLang();

  const sortedTasks = useMemo(() => sortTasks(tasks, lang), [tasks, lang]);
  const tagById = useMemo(() => new Map(tags.map((t) => [t.id, t])), [tags]);

  const [range, setRange] = useState<{ start: string; count: number } | null>(null);

  const effectiveRange = useMemo(() => {
    if (range) return range;
    const today = todayStr();
    const extent = taskExtent(tasks);
    if (!extent) return { start: addDays(today, -7), count: 60 };
    const start = addDays(extent.min, -3);
    const rawCount = daysBetween(start, extent.max) + 1 + 14;
    return { start, count: Math.min(rawCount, MAX_DAYS) };
  }, [range, tasks]);

  const days = useMemo(
    () => eachDay(effectiveRange.start, effectiveRange.count),
    [effectiveRange],
  );
  const today = todayStr();

  const [selection, setSelection] = useState<Selection | null>(null);
  const dragAnchor = useRef<{ r: number; c: number } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: sortedTasks.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => CELL_H,
    overscan: 8,
    initialRect: { width: 1200, height: 800 },
  });

  useEffect(() => {
    const up = () => {
      dragAnchor.current = null;
    };
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = daysBetween(effectiveRange.start, todayStr());
    if (idx > 0) {
      el.scrollLeft = Math.max(0, idx * CELL_W - (el.clientWidth - TITLE_W) / 2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shiftWindow = useCallback(
    (direction: 1 | -1) => {
      const step = Math.max(7, Math.floor(effectiveRange.count / 2));
      setRange({
        start: addDays(effectiveRange.start, direction * step),
        count: effectiveRange.count,
      });
    },
    [effectiveRange],
  );

  const jumpToToday = useCallback(() => {
    const start = addDays(todayStr(), -10);
    setRange({ start, count: effectiveRange.count });
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollLeft = Math.max(0, 10 * CELL_W - (el.clientWidth - TITLE_W) / 2);
    });
  }, [effectiveRange.count]);

  const buildTsv = useCallback(
    (sel: Selection): string => {
      const lines: string[][] = [[t('gantt.header').replace(' \\ ', '、'), ...days.slice(sel.c1, sel.c2 + 1)]];
      for (let r = sel.r1; r <= sel.r2; r++) {
        const task = sortedTasks[r];
        if (!task) continue;
        const row = [task.title];
        for (let c = sel.c1; c <= sel.c2; c++) {
          row.push(isCovered(task, days[c]) ? '■' : '');
        }
        lines.push(row);
      }
      return toTsv(lines);
    },
    [days, sortedTasks, t],
  );

  const handleCopy = useCallback(
    (e: ReactClipboardEvent) => {
      if (!selection) return;
      e.preventDefault();
      e.clipboardData.setData('text/plain', buildTsv(selection));
      showNotify(t('gantt.copiedSelection'), 'success');
    },
    [selection, buildTsv, showNotify, t],
  );

  const copyWholeView = useCallback(async () => {
    if (sortedTasks.length === 0) {
      showNotify(t('gantt.noTasksToCopy'), 'warning');
      return;
    }
    const ok = await copyText(
      buildTsv({ r1: 0, c1: 0, r2: sortedTasks.length - 1, c2: days.length - 1 }),
    );
    showNotify(
      ok ? t('gantt.copiedView') : t('gantt.copyFailed'),
      ok ? 'success' : 'error',
    );
  }, [buildTsv, days.length, sortedTasks.length, showNotify, t]);

  const handleKeyDown = useCallback((e: ReactKeyboardEvent) => {
    if (e.key === 'Escape') setSelection(null);
  }, []);

  const handleCellMouseDown = useCallback((row: number, col: number, e: ReactMouseEvent) => {
    e.preventDefault();
    scrollRef.current?.focus({ preventScroll: true });
    dragAnchor.current = { r: row, c: col };
    setSelection({ r1: row, c1: col, r2: row, c2: col });
  }, []);

  const handleCellMouseEnter = useCallback((row: number, col: number) => {
    const anchor = dragAnchor.current;
    if (!anchor) return;
    setSelection({ r1: anchor.r, c1: anchor.c, r2: row, c2: col });
  }, []);

  const handleTitleClick = useCallback(
    (taskId: string) => openTaskDialog(taskId),
    [openTaskDialog],
  );

  const unnamedLabel = t('gantt.unnamed');

  const dividerColor = theme.palette.divider;
  const weekendColor = isDark ? 'rgba(255,255,255,0.045)' : 'rgba(0,0,0,0.05)';
  const todayColor = isDark ? 'rgba(144,202,249,0.16)' : 'rgba(25,118,210,0.12)';
  const headerBg = theme.palette.background.paper;

  const selMinRow = selection ? Math.min(selection.r1, selection.r2) : null;
  const selMaxRow = selection ? Math.max(selection.r1, selection.r2) : null;
  const selMinCol = selection ? Math.min(selection.c1, selection.c2) : null;
  const selMaxCol = selection ? Math.max(selection.c1, selection.c2) : null;

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {/* toolbar */}
      <Paper square elevation={0} sx={{ borderBottom: `1px solid ${dividerColor}` }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.5,
            flexWrap: 'wrap',
          }}
        >
          <Tooltip title={t('gantt.prevPage')}>
            <IconButton size="small" onClick={() => shiftWindow(-1)}>
              <ChevronLeftIcon />
            </IconButton>
          </Tooltip>
          <Button size="small" startIcon={<TodayIcon />} onClick={jumpToToday}>
            {t('gantt.today')}
          </Button>
          <Tooltip title={t('gantt.nextPage')}>
            <IconButton size="small" onClick={() => shiftWindow(1)}>
              <ChevronRightIcon />
            </IconButton>
          </Tooltip>
          <Select
            size="small"
            value={range === null ? 'fit' : String(range.count)}
            onChange={(e) => {
              const v = e.target.value;
              if (v === 'fit') setRange(null);
              else setRange({ start: effectiveRange.start, count: Number(v) });
            }}
            sx={{ minWidth: 110 }}
          >
            <MenuItem value="fit">{t('gantt.fitAll')}</MenuItem>
            <MenuItem value="30">{t('gantt.days_30')}</MenuItem>
            <MenuItem value="60">{t('gantt.days_60')}</MenuItem>
            <MenuItem value="90">{t('gantt.days_90')}</MenuItem>
            <MenuItem value="180">{t('gantt.days_180')}</MenuItem>
            <MenuItem value="365">{t('gantt.days_365')}</MenuItem>
          </Select>
          <Tooltip title={t('gantt.copyViewTooltip')}>
            <Button size="small" startIcon={<ContentCopyIcon />} onClick={copyWholeView}>
              {t('gantt.copyView')}
            </Button>
          </Tooltip>
          <Box sx={{ flex: 1 }} />
          <Typography variant="caption" color="text.secondary">
            {t('gantt.statusBar', {
              count: sortedTasks.length,
              first: days[0],
              last: days[days.length - 1],
            })}
          </Typography>
        </Box>
      </Paper>

      {/* grid */}
      <Box
        ref={scrollRef}
        tabIndex={0}
        onCopy={handleCopy}
        onKeyDown={handleKeyDown}
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          outline: 'none',
          bgcolor: 'background.default',
        }}
      >
        <div
          style={{
            width: TITLE_W + days.length * CELL_W,
            height: HEADER_H + rowVirtualizer.getTotalSize(),
            position: 'relative',
          }}
        >
          {/* header */}
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 6,
              display: 'flex',
              height: HEADER_H,
              background: headerBg,
            }}
          >
            <div
              style={{
                position: 'sticky',
                left: 0,
                zIndex: 7,
                width: TITLE_W,
                flex: '0 0 auto',
                background: headerBg,
                borderRight: `1px solid ${dividerColor}`,
                borderBottom: `1px solid ${dividerColor}`,
                display: 'flex',
                alignItems: 'center',
                padding: '0 8px',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {t('gantt.header')}
            </div>
            {days.map((day) => {
              const weekend = weekendHighlight && isWeekend(day);
              const isToday = day === today;
              return (
                <div
                  key={day}
                  style={{
                    width: CELL_W,
                    flex: '0 0 auto',
                    boxSizing: 'border-box',
                    borderRight: `1px solid ${dividerColor}`,
                    borderBottom: `1px solid ${dividerColor}`,
                    background: isToday ? todayColor : weekend ? weekendColor : undefined,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1.1,
                    userSelect: 'none',
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: isToday ? 700 : 400 }}>
                    {Number(day.slice(8))}
                  </span>
                  <span style={{ fontSize: 9, opacity: 0.65 }}>
                    {Number(day.slice(5, 7))}月 {weekdayLabel(day)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* body rows */}
          {rowVirtualizer.getVirtualItems().map((vr) => {
            const task = sortedTasks[vr.index];
            const selected =
              selMinRow !== null &&
              selMaxRow !== null &&
              vr.index >= selMinRow &&
              vr.index <= selMaxRow;
            return (
              <GanttRow
                key={task.id}
                rowIndex={vr.index}
                task={task}
                tagById={tagById}
                days={days}
                top={HEADER_H + vr.start}
                height={vr.size}
                today={today}
                weekendHighlight={weekendHighlight}
                selMinCol={selected ? selMinCol : null}
                selMaxCol={selected ? selMaxCol : null}
                dividerColor={dividerColor}
                weekendColor={weekendColor}
                todayColor={todayColor}
                unnamedLabel={unnamedLabel}
                onCellMouseDown={handleCellMouseDown}
                onCellMouseEnter={handleCellMouseEnter}
                onTitleClick={handleTitleClick}
                onCellDoubleClick={handleTitleClick}
              />
            );
          })}

          {sortedTasks.length === 0 && (
            <div
              style={{
                position: 'sticky',
                left: 0,
                width: 'min(100vw, 100%)',
                padding: '64px 16px',
                textAlign: 'center',
                boxSizing: 'border-box',
              }}
            >
              <Typography color="text.secondary">
                {t('gantt.noTasks')}
              </Typography>
            </div>
          )}
        </div>
      </Box>
    </Box>
  );
}
