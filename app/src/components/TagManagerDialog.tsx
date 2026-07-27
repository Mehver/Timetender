import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { nanoid } from 'nanoid';

import { useStore } from '../store/useStore';
import type { Tag } from '../types';
import { pickDefaultColor } from '../utils/color';
import ConfirmDialog from './ConfirmDialog';

export default function TagManagerDialog() {
  const open = useStore((s) => s.tagsDialogOpen);
  const setOpen = useStore((s) => s.setTagsDialogOpen);
  const tags = useStore((s) => s.data.tags);
  const tasks = useStore((s) => s.data.tasks);
  const upsertTag = useStore((s) => s.upsertTag);
  const removeTag = useStore((s) => s.removeTag);

  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);

  const usageCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const task of tasks) {
      for (const id of task.tagIds) map.set(id, (map.get(id) ?? 0) + 1);
    }
    return map;
  }, [tasks]);

  const addTag = () => {
    upsertTag({
      id: nanoid(),
      name: `新标签 ${tags.length + 1}`,
      type: '',
      color: pickDefaultColor(tags.length),
    });
  };

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>标签管理</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 0.5 }}>
            {tags.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                还没有标签，点击下方按钮创建。标签可用于按颜色对任务分类。
              </Typography>
            )}
            {tags.map((tag) => {
              const used = usageCount.get(tag.id) ?? 0;
              return (
                <Stack key={tag.id} direction="row" spacing={1} alignItems="center">
                  <Box
                    component="input"
                    type="color"
                    value={tag.color}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      upsertTag({ ...tag, color: e.target.value })
                    }
                    sx={{
                      width: 34,
                      height: 32,
                      p: 0,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: '6px',
                      bgcolor: 'transparent',
                      cursor: 'pointer',
                      flex: '0 0 auto',
                    }}
                  />
                  <TextField
                    size="small"
                    label="名称"
                    value={tag.name}
                    onChange={(e) => upsertTag({ ...tag, name: e.target.value })}
                    sx={{ flex: 2 }}
                  />
                  <TextField
                    size="small"
                    label="分类"
                    value={tag.type}
                    onChange={(e) => upsertTag({ ...tag, type: e.target.value })}
                    sx={{ flex: 1.5 }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ width: 64, textAlign: 'right', flex: '0 0 auto' }}
                  >
                    {used > 0 ? `${used} 个任务` : '未使用'}
                  </Typography>
                  <IconButton size="small" onClick={() => setDeleteTarget(tag)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              );
            })}
            <Button startIcon={<AddIcon />} onClick={addTag} sx={{ alignSelf: 'flex-start' }}>
              新建标签
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        title="删除标签"
        message={
          deleteTarget && (usageCount.get(deleteTarget.id) ?? 0) > 0
            ? `标签「${deleteTarget.name}」正被 ${usageCount.get(deleteTarget.id)} 个任务使用，删除后将从这些任务上移除。确定删除吗？`
            : `确定删除标签「${deleteTarget?.name ?? ''}」吗？`
        }
        confirmLabel="删除"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) removeTag(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </>
  );
}
