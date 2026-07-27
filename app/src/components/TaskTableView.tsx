import { useCallback, useMemo, useState } from 'react';
import type { ClipboardEvent as ReactClipboardEvent } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  DataGrid,
  GridActionsCellItem,
  useGridApiRef,
} from '@mui/x-data-grid';
import type { GridColDef, GridRowParams } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import { useStore } from '../store/useStore';
import type { Task } from '../types';
import { daysBetween } from '../utils/date';
import { readableTextColor } from '../utils/color';
import { tasksToTsv, tsvToTasks } from '../utils/taskio';
import ConfirmDialog from './ConfirmDialog';

export default function TaskTableView() {
  const tasks = useStore((s) => s.data.tasks);
  const tags = useStore((s) => s.data.tags);
  const openTaskDialog = useStore((s) => s.openTaskDialog);
  const removeTask = useStore((s) => s.removeTask);
  const upsertTask = useStore((s) => s.upsertTask);
  const addImported = useStore((s) => s.addImported);
  const showNotify = useStore((s) => s.showNotify);

  const apiRef = useGridApiRef();
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const tagById = useMemo(() => new Map(tags.map((t) => [t.id, t])), [tags]);

  const columns = useMemo<GridColDef<Task>[]>(
    () => [
      {
        field: 'color',
        headerName: '颜色',
        width: 64,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: '6px',
                bgcolor: params.value as string,
                border: '1px solid rgba(128,128,128,0.4)',
                flexShrink: 0,
              }}
            />
          </Box>
        ),
      },
      { field: 'title', headerName: '标题', flex: 1, minWidth: 160 },
      { field: 'start', headerName: '开始', width: 110 },
      { field: 'end', headerName: '截止', width: 110 },
      {
        field: 'days',
        headerName: '天数',
        width: 72,
        type: 'number',
        valueGetter: (_value, row) => daysBetween(row.start, row.end) + 1,
      },
      {
        field: 'tags',
        headerName: '标签',
        width: 220,
        sortable: false,
        valueGetter: (_value, row: Task) =>
          row.tagIds
            .map((id) => tagById.get(id)?.name)
            .filter(Boolean)
            .join(', '),
        renderCell: (params) => (
          <Stack direction="row" spacing={0.5} sx={{ overflow: 'hidden', alignItems: 'center', height: '100%' }}>
            {params.row.tagIds.map((id: string) => {
              const tag = tagById.get(id);
              if (!tag) return null;
              return (
                <Chip
                  key={id}
                  size="small"
                  label={tag.name}
                  sx={{
                    bgcolor: tag.color,
                    color: readableTextColor(tag.color),
                    fontSize: 12,
                    height: 22,
                  }}
                />
              );
            })}
          </Stack>
        ),
      },
      { field: 'finished', headerName: '完成', type: 'boolean', width: 76, editable: true },
      { field: 'description', headerName: '描述', width: 220 },
      {
        field: 'actions',
        type: 'actions',
        headerName: '操作',
        width: 96,
        getActions: (params: GridRowParams<Task>) => [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="编辑"
            onClick={() => openTaskDialog(String(params.id))}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="删除"
            onClick={() => setDeleteTarget(params.row)}
          />,
        ],
      },
    ],
    [tagById, openTaskDialog],
  );

  /**
   * Ctrl+C with selected rows → Excel-friendly TSV (with header).
   * Runs in the capture phase so the grid's own clipboard handler never fires.
   */
  const handleCopy = useCallback(
    (e: ReactClipboardEvent) => {
      const selected = apiRef.current?.getSelectedRows?.();
      if (!selected || selected.size === 0) return; // default single-cell copy
      e.preventDefault();
      e.stopPropagation();
      const rows = [...selected.values()] as Task[];
      e.clipboardData.setData('text/plain', tasksToTsv(rows, tags));
      showNotify(`已复制 ${rows.length} 个任务，可直接粘贴到 Excel`, 'success');
    },
    [apiRef, tags, showNotify],
  );

  /** Ctrl+V TSV from Excel → append tasks (auto-creating unknown tags). */
  const handlePaste = useCallback(
    (e: ReactClipboardEvent) => {
      const text = e.clipboardData.getData('text/plain');
      if (!text || (!text.includes('\t') && !text.includes('\n'))) return;
      e.preventDefault();
      const { tasks: parsed, newTags } = tsvToTasks(text, tags);
      if (parsed.length === 0) {
        showNotify('剪贴板中未识别到任务行（需要至少包含：标题、开始、截止三列）', 'warning');
        return;
      }
      addImported(parsed, newTags, 'append');
      showNotify(
        `已粘贴导入 ${parsed.length} 个任务${newTags.length > 0 ? `，并新建 ${newTags.length} 个标签` : ''}`,
        'success',
      );
    },
    [tags, addImported, showNotify],
  );

  return (
    <Box
      sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
      onCopyCapture={handleCopy}
      onPaste={handlePaste}
    >
      <Paper square elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 1.5, py: 0.75 }}>
          勾选行后 Ctrl+C 复制为 Excel 格式；从 Excel 复制区域后在此 Ctrl+V 可直接批量新增任务；双击行打开编辑表单。
        </Typography>
      </Paper>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataGrid
          apiRef={apiRef}
          rows={tasks}
          columns={columns}
          getRowId={(row) => row.id}
          checkboxSelection
          disableRowSelectionOnClick
          onRowDoubleClick={(params) => openTaskDialog(String(params.id))}
          processRowUpdate={(newRow: Task) => {
            upsertTask(newRow);
            return newRow;
          }}
          onProcessRowUpdateError={(err) =>
            showNotify(`更新失败：${err instanceof Error ? err.message : String(err)}`, 'error')
          }
          initialState={{
            sorting: { sortModel: [{ field: 'start', sort: 'asc' }] },
          }}
          localeText={{ noRowsLabel: '还没有任务 — 点击右上角「新建任务」，或直接从 Excel 粘贴。' }}
        />
      </Box>
      <ConfirmDialog
        open={deleteTarget !== null}
        title="删除任务"
        message={`确定删除任务「${deleteTarget?.title ?? ''}」吗？此操作不可撤销。`}
        confirmLabel="删除"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) removeTask(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </Box>
  );
}
