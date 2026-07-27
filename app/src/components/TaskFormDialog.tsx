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

  const editing = taskDialog.taskId
    ? (tasks.find((t) => t.id === taskDialog.taskId) ?? null)
    : null;

  const [form, setForm] = useState<Task>(() => makeEmptyTask(todayStr(), 0));
  const [titleError, setTitleError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // (Re)initialize the form whenever the dialog opens.
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
    showNotify(editing ? '任务已更新' : '任务已创建', 'success');
    closeTaskDialog();
  };

  return (
    <>
      <Dialog open={taskDialog.open} onClose={closeTaskDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? '编辑任务' : '新建任务'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            <TextField
              label="标题"
              value={form.title}
              onChange={(e) => {
                patch({ title: e.target.value });
                if (titleError) setTitleError(false);
              }}
              error={titleError}
              helperText={titleError ? '标题不能为空' : undefined}
              required
              autoFocus
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <DatePicker
                label="开始日期"
                value={dayjs(form.start)}
                onChange={(d) => {
                  if (!d || !d.isValid()) return;
                  const start = d.format(DATE_FMT);
                  patch({ start, end: form.end < start ? start : form.end });
                }}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
              <DatePicker
                label="截止日期"
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
                颜色
              </Typography>
              <ColorPicker value={form.color} onChange={(color) => patch({ color })} />
            </Box>
            <FormControl fullWidth size="small">
              <InputLabel id="task-tags-label">标签</InputLabel>
              <Select
                labelId="task-tags-label"
                label="标签"
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
                    <ListItemText primary="还没有标签" />
                  </MenuItem>
                )}
              </Select>
              <Button
                size="small"
                sx={{ alignSelf: 'flex-start', mt: 0.5 }}
                onClick={() => setTagsDialogOpen(true)}
              >
                管理标签…
              </Button>
            </FormControl>
            <TextField
              label="描述"
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
              label="已完成"
            />
            <Divider />
            <Box>
              <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ flex: 1 }}>
                  进度记录
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
                  添加记录
                </Button>
              </Stack>
              {form.history.length === 0 && (
                <Typography variant="caption" color="text.secondary">
                  暂无记录，可用于跟踪任务进展（如「开始」「完成一半」）。
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
                      placeholder="状态，如：完成一半"
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
              删除
            </Button>
          )}
          <Button onClick={closeTaskDialog}>取消</Button>
          <Button variant="contained" onClick={handleSave} disableElevation>
            保存
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={confirmDelete}
        title="删除任务"
        message={`确定删除任务「${form.title}」吗？此操作不可撤销。`}
        confirmLabel="删除"
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
