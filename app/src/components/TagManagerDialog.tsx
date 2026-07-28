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
import { useT } from '../i18n';
import ConfirmDialog from './ConfirmDialog';

export default function TagManagerDialog() {
  const open = useStore((s) => s.tagsDialogOpen);
  const setOpen = useStore((s) => s.setTagsDialogOpen);
  const tags = useStore((s) => s.data.tags);
  const tasks = useStore((s) => s.data.tasks);
  const upsertTag = useStore((s) => s.upsertTag);
  const removeTag = useStore((s) => s.removeTag);
  const t = useT();

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
      name: t('tagManager.defaultName', { n: tags.length + 1 }),
      type: '',
      color: pickDefaultColor(tags.length),
    });
  };

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('tagManager.title')}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 0.5 }}>
            {tags.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                {t('tagManager.empty')}
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
                    label={t('tagManager.name')}
                    value={tag.name}
                    onChange={(e) => upsertTag({ ...tag, name: e.target.value })}
                    sx={{ flex: 2 }}
                  />
                  <TextField
                    size="small"
                    label={t('tagManager.type')}
                    value={tag.type}
                    onChange={(e) => upsertTag({ ...tag, type: e.target.value })}
                    sx={{ flex: 1.5 }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ width: 64, textAlign: 'right', flex: '0 0 auto' }}
                  >
                    {used > 0 ? t('tagManager.usage', { count: used }) : t('tagManager.unused')}
                  </Typography>
                  <IconButton size="small" onClick={() => setDeleteTarget(tag)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              );
            })}
            <Button startIcon={<AddIcon />} onClick={addTag} sx={{ alignSelf: 'flex-start' }}>
              {t('tagManager.newTag')}
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t('tagManager.close')}</Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('tagManager.deleteTag')}
        message={
          deleteTarget && (usageCount.get(deleteTarget.id) ?? 0) > 0
            ? t('tagManager.deleteConfirmUsed', { name: deleteTarget.name, count: String(usageCount.get(deleteTarget.id)) })
            : t('tagManager.deleteConfirm', { name: deleteTarget?.name ?? '' })
        }
        confirmLabel={t('tagManager.delete')}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) removeTag(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </>
  );
}
