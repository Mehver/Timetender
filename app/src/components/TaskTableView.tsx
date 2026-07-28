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
import { useT } from '../i18n';
import ConfirmDialog from './ConfirmDialog';

export default function TaskTableView() {
  const tasks = useStore((s) => s.data.tasks);
  const tags = useStore((s) => s.data.tags);
  const openTaskDialog = useStore((s) => s.openTaskDialog);
  const removeTask = useStore((s) => s.removeTask);
  const upsertTask = useStore((s) => s.upsertTask);
  const addImported = useStore((s) => s.addImported);
  const showNotify = useStore((s) => s.showNotify);
  const t = useT();

  const apiRef = useGridApiRef();
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const tagById = useMemo(() => new Map(tags.map((t) => [t.id, t])), [tags]);

  const columns = useMemo<GridColDef<Task>[]>(
    () => [
      {
        field: 'color',
        headerName: t('table.color'),
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
      { field: 'title', headerName: t('table.title'), flex: 1, minWidth: 160 },
      { field: 'start', headerName: t('table.start'), width: 110 },
      { field: 'end', headerName: t('table.end'), width: 110 },
      {
        field: 'days',
        headerName: t('table.days'),
        width: 72,
        type: 'number',
        valueGetter: (_value, row) => daysBetween(row.start, row.end) + 1,
      },
      {
        field: 'tags',
        headerName: t('table.tags'),
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
      { field: 'finished', headerName: t('table.completed'), type: 'boolean', width: 76, editable: true },
      { field: 'description', headerName: t('table.description'), width: 220 },
      {
        field: 'actions',
        type: 'actions',
        headerName: t('table.actions'),
        width: 96,
        getActions: (params: GridRowParams<Task>) => [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label={t('table.edit')}
            onClick={() => openTaskDialog(String(params.id))}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label={t('table.delete')}
            onClick={() => setDeleteTarget(params.row)}
          />,
        ],
      },
    ],
    [tagById, openTaskDialog, t],
  );

  const handleCopy = useCallback(
    (e: ReactClipboardEvent) => {
      const selected = apiRef.current?.getSelectedRows?.();
      if (!selected || selected.size === 0) return;
      e.preventDefault();
      e.stopPropagation();
      const rows = [...selected.values()] as Task[];
      e.clipboardData.setData('text/plain', tasksToTsv(rows, tags));
      showNotify(t('table.copiedN', { count: rows.length }), 'success');
    },
    [apiRef, tags, showNotify, t],
  );

  const handlePaste = useCallback(
    (e: ReactClipboardEvent) => {
      const text = e.clipboardData.getData('text/plain');
      if (!text || (!text.includes('\t') && !text.includes('\n'))) return;
      e.preventDefault();
      const { tasks: parsed, newTags } = tsvToTasks(text, tags);
      if (parsed.length === 0) {
        showNotify(t('table.noTasksParsed'), 'warning');
        return;
      }
      addImported(parsed, newTags, 'append');
      showNotify(
        newTags.length > 0
          ? t('table.importedNTags', { count: parsed.length, tagCount: newTags.length })
          : t('table.importedN', { count: parsed.length }),
        'success',
      );
    },
    [tags, addImported, showNotify, t],
  );

  return (
    <Box
      sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
      onCopyCapture={handleCopy}
      onPaste={handlePaste}
    >
      <Paper square elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 1.5, py: 0.75 }}>
          {t('table.hint')}
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
            showNotify(t('table.updateFailed', { error: err instanceof Error ? err.message : String(err) }), 'error')
          }
          initialState={{
            sorting: { sortModel: [{ field: 'start', sort: 'asc' }] },
          }}
          localeText={{ noRowsLabel: t('table.noRows') }}
        />
      </Box>
      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('table.deleteTask')}
        message={t('table.deleteConfirm', { title: deleteTarget?.title ?? '' })}
        confirmLabel={t('table.delete')}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) removeTask(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </Box>
  );
}
