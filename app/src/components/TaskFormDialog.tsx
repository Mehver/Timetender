import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { makeEmptyTask, useStore } from '../store/useStore';
import type { HistoryEntry, Task } from '../types';
import { DATE_FMT, todayStr } from '../utils/date';
import { readableTextColor } from '../utils/color';
import { useT } from '../i18n';
import ColorPicker from './ColorPicker';
import ConfirmDialog from './ConfirmDialog';

const TIME_FMT = 'YYYY-MM-DD HH:mm';

export default function TaskFormDialog() {
  const taskDialog = useStore((s) => s.taskDialog);
  const tasks = useStore((s) => s.data.tasks);
  const tags = useStore((s) => s.data.tags);
  const closeTaskDialog = useStore((s) => s.closeTaskDialog);
  const upsertTask = useStore((s) => s.upsertTask);
  const removeTask = useStore((s) => s.removeTask);
  const setTagsDialogOpen = useStore((s) => s.setTagsDialogOpen);
  const showNotify = useStore((s) => s.showNotify);
  const t = useT();

  const editing = taskDialog.taskId
    ? (tasks.find((t) => t.id === taskDialog.taskId) ?? null)
    : null;

  const [form, setForm] = useState<Task>(() => makeEmptyTask(todayStr(), 0));
  const [titleError, setTitleError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!taskDialog.open) return;
    setTitleError(false);
    setConfirmDelete(false);
    if (editing) {
      setForm({ ...editing, tagIds: [...editing.tagIds], history: editing.history.map((h) => ({ ...h })) });
    } else {
      setForm(makeEmptyTask(taskDialog.prefillDate ?? todayStr(), tasks.length));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskDialog.open]);

  const patch = (p: Partial<Task>) => setForm((f) => ({ ...f, ...p }));

  const patchHistory = (idx: number, p: Partial<HistoryEntry>) =>
    setForm((f) => ({
      ...f,
      history: f.history.map((h, i) => (i === idx ? { ...h, ...p } : h)),
    }));

  const handleSave = () => {
    const title = form.title.trim();
    if (!title) {
      setTitleError(true);
      return;
    }
    const end = form.end < form.start ? form.start : form.end;
    const history = [...form.history]
      .filter((h) => h.status.trim() || h.time.trim())
      .sort((a, b) => (a.time < b.time ? -1 : 1));
    upsertTask({ ...form, title, end, history });
    showNotify(editing ? t('taskForm.taskUpdated') : t('taskForm.taskCreated'), 'success');
    closeTaskDialog();
  };

  return (
    <>
      <Dialog open={taskDialog.open} onClose={closeTaskDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? t('taskForm.editTask') : t('taskForm.newTask')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            <TextField
              label={t('taskForm.title')}
              value={form.title}
              onChange={(e) => {
                patch({ title: e.target.value });
                if (titleError) setTitleError(false);
              }}
              error={titleError}
              helperText={titleError ? t('taskForm.titleRequired') : undefined}
              required
              autoFocus
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <DatePicker
                label={t('taskForm.startDate')}
                value={dayjs(form.start)}
                onChange={(d) => {
                  if (!d || !d.isValid()) return;
                  const start = d.format(DATE_FMT);
                  patch({ start, end: form.end < start ? start : form.end });
                }}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
              <DatePicker
                label={t('taskForm.endDate')}
                value={dayjs(form.end)}
                minDate={dayjs(form.start)}
                onChange={(d) => {
                  if (!d || !d.isValid()) return;
                  patch({ end: d.format(DATE_FMT) });
                }}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Stack>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {t('taskForm.color')}
              </Typography>
              <ColorPicker value={form.color} onChange={(color) => patch({ color })} />
            </Box>
            <FormControl fullWidth size="small">
              <InputLabel id="task-tags-label">{t('taskForm.tags')}</InputLabel>
              <Select
                labelId="task-tags-label"
                label={t('taskForm.tags')}
                multiple
                value={form.tagIds}
                onChange={(e) => patch({ tagIds: e.target.value as string[] })}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((id) => {
                      const tag = tags.find((t) => t.id === id);
                      if (!tag) return null;
                      return (
                        <Chip
                          key={id}
                          size="small"
                          label={tag.name}
                          sx={{ bgcolor: tag.color, color: readableTextColor(tag.color) }}
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {tags.map((tag) => (
                  <MenuItem key={tag.id} value={tag.id}>
                    <Checkbox checked={form.tagIds.includes(tag.id)} size="small" />
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: tag.color,
                        mr: 1,
                        flex: '0 0 auto',
                      }}
                    />
                    <ListItemText
                      primary={tag.name}
                      secondary={tag.type || undefined}
                    />
                  </MenuItem>
                ))}
                {tags.length === 0 && (
                  <MenuItem disabled value="">
                    <ListItemText primary={t('taskForm.noTags')} />
                  </MenuItem>
                )}
              </Select>
              <Button
                size="small"
                sx={{ alignSelf: 'flex-start', mt: 0.5 }}
                onClick={() => setTagsDialogOpen(true)}
              >
                {t('taskForm.manageTags')}
              </Button>
            </FormControl>
            <TextField
              label={t('taskForm.description')}
              value={form.description}
              onChange={(e) => patch({ description: e.target.value })}
              multiline
              minRows={2}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.finished}
                  onChange={(e) => patch({ finished: e.target.checked })}
                />
              }
              label={t('taskForm.finished')}
            />
            <Divider />
            <Box>
              <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ flex: 1 }}>
                  {t('taskForm.progress')}
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      history: [...f.history, { time: dayjs().format(TIME_FMT), status: '' }],
                    }))
                  }
                >
                  {t('taskForm.addRecord')}
                </Button>
              </Stack>
              {form.history.length === 0 && (
                <Typography variant="caption" color="text.secondary">
                  {t('taskForm.noRecords')}
                </Typography>
              )}
              <Stack spacing={1}>
                {form.history.map((h, i) => (
                  <Stack direction="row" spacing={1} key={i} alignItems="center">
                    <TextField
                      type="datetime-local"
                      size="small"
                      value={h.time.replace(' ', 'T')}
                      onChange={(e) =>
                        patchHistory(i, { time: e.target.value.replace('T', ' ') })
                      }
                      sx={{ width: 220 }}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      size="small"
                      placeholder={t('taskForm.statusPlaceholder')}
                      value={h.status}
                      onChange={(e) => patchHistory(i, { status: e.target.value })}
                      fullWidth
                    />
                    <IconButton
                      size="small"
                      onClick={() =>
                        setForm((f) => ({ ...f, history: f.history.filter((_, x) => x !== i) }))
                      }
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {editing && (
            <Button color="error" onClick={() => setConfirmDelete(true)} sx={{ mr: 'auto' }}>
              {t('taskForm.delete')}
            </Button>
          )}
          <Button onClick={closeTaskDialog}>{t('taskForm.cancel')}</Button>
          <Button variant="contained" onClick={handleSave} disableElevation>
            {t('taskForm.save')}
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={confirmDelete}
        title={t('taskForm.deleteTask')}
        message={t('taskForm.deleteConfirm', { title: form.title })}
        confirmLabel={t('taskForm.delete')}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (editing) removeTask(editing.id);
          setConfirmDelete(false);
          closeTaskDialog();
        }}
      />
    </>
  );
}
