import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import { useStore } from '../store/useStore';
import type { Lang, Settings } from '../types';
import { backendDriver } from '../storage/persistence';
import { useT } from '../i18n';
import ConfirmDialog from './ConfirmDialog';

type PendingSwitch = { direction: 'push' | 'pull' } | null;

export default function SettingsDialog() {
  const open = useStore((s) => s.settingsDialogOpen);
  const setOpen = useStore((s) => s.setSettingsDialogOpen);
  const settings = useStore((s) => s.settings);
  const tasks = useStore((s) => s.data.tasks);
  const updateSettings = useStore((s) => s.updateSettings);
  const switchStorageMode = useStore((s) => s.switchStorageMode);
  const clearAllData = useStore((s) => s.clearAllData);
  const showNotify = useStore((s) => s.showNotify);
  const t = useT();

  const [pendingSwitch, setPendingSwitch] = useState<PendingSwitch>(null);
  const [remoteTaskCount, setRemoteTaskCount] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleModeChange = async (mode: Settings['storageMode']) => {
    if (mode === settings.storageMode || busy) return;
    setBusy(true);
    try {
      if (mode === 'local') {
        await switchStorageMode('local');
        return;
      }
      try {
        const remote = await backendDriver.load();
        if (remote && (remote.tasks.length > 0 || remote.tags.length > 0)) {
          setRemoteTaskCount(remote.tasks.length);
          setPendingSwitch({ direction: 'pull' });
          return;
        }
        await switchStorageMode('backend', 'push');
      } catch (e) {
        showNotify(
          t('settings.backendUnreachable', { error: e instanceof Error ? e.message : String(e) }),
          'error',
        );
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('settings.title')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            <div>
              <Typography variant="subtitle2" gutterBottom>
                {t('settings.language')}
              </Typography>
              <RadioGroup
                row
                value={settings.lang}
                onChange={(e) =>
                  updateSettings({ lang: e.target.value as Lang })
                }
              >
                <FormControlLabel value="system" control={<Radio />} label={t('settings.langSystem')} />
                <FormControlLabel value="zh" control={<Radio />} label={t('settings.langZh')} />
                <FormControlLabel value="en" control={<Radio />} label={t('settings.langEn')} />
              </RadioGroup>
            </div>
            <Divider />
            <div>
              <Typography variant="subtitle2" gutterBottom>
                {t('settings.dataStorage')}
              </Typography>
              <RadioGroup
                value={settings.storageMode}
                onChange={(e) => void handleModeChange(e.target.value as Settings['storageMode'])}
              >
                <FormControlLabel
                  value="local"
                  control={<Radio />}
                  disabled={busy}
                  label={
                    <>
                      {t('settings.localStorage')}
                      <Typography variant="caption" color="text.secondary" display="block">
                        {t('settings.localStorageHint')}
                      </Typography>
                    </>
                  }
                />
                <FormControlLabel
                  value="backend"
                  control={<Radio />}
                  disabled={busy}
                  label={
                    <>
                      {t('settings.backendStorage')}
                      <Typography variant="caption" color="text.secondary" display="block">
                        {t('settings.backendStorageHint')}
                      </Typography>
                    </>
                  }
                />
              </RadioGroup>
              {busy && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  {t('settings.switching')}
                </Alert>
              )}
            </div>
            <Divider />
            <div>
              <Typography variant="subtitle2" gutterBottom>
                {t('settings.appearance')}
              </Typography>
              <RadioGroup
                row
                value={settings.themeMode}
                onChange={(e) =>
                  updateSettings({ themeMode: e.target.value as Settings['themeMode'] })
                }
              >
                <FormControlLabel value="system" control={<Radio />} label={t('settings.followSystem')} />
                <FormControlLabel value="light" control={<Radio />} label={t('settings.light')} />
                <FormControlLabel value="dark" control={<Radio />} label={t('settings.dark')} />
              </RadioGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.weekendHighlight}
                    onChange={(e) => updateSettings({ weekendHighlight: e.target.checked })}
                  />
                }
                label={t('settings.weekendHighlight')}
              />
            </div>
            <Divider />
            <div>
              <Typography variant="subtitle2" gutterBottom color="error">
                {t('settings.dangerOps')}
              </Typography>
              <Button color="error" variant="outlined" onClick={() => setConfirmClear(true)}>
                {t('settings.clearAll', { count: tasks.length })}
              </Button>
            </div>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t('settings.close')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={pendingSwitch !== null} onClose={() => setPendingSwitch(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('settings.backendHasData')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {t('settings.backendHasDataMsg', { count: remoteTaskCount })}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', alignItems: 'stretch', gap: 1, px: 3, pb: 2 }}>
          <Button
            variant="contained"
            disableElevation
            onClick={() => {
              setPendingSwitch(null);
              void switchStorageMode('backend', 'pull');
            }}
          >
            {t('settings.useBackend', { count: tasks.length })}
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setPendingSwitch(null);
              void switchStorageMode('backend', 'push');
            }}
          >
            {t('settings.uploadBrowser')}
          </Button>
          <Button onClick={() => setPendingSwitch(null)}>{t('settings.cancel')}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmClear}
        title={t('settings.clearAllTitle')}
        message={t('settings.clearAllMsg')}
        confirmLabel={t('settings.clearAllBtn')}
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          clearAllData();
          setConfirmClear(false);
          showNotify(t('settings.cleared'), 'success');
        }}
      />
    </>
  );
}
