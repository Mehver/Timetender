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
import type { Settings } from '../types';
import { backendDriver } from '../storage/persistence';
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
      // Switching to backend: decide push vs pull.
      try {
        const remote = await backendDriver.load();
        if (remote && (remote.tasks.length > 0 || remote.tags.length > 0)) {
          setRemoteTaskCount(remote.tasks.length);
          setPendingSwitch({ direction: 'pull' }); // ask the user below
          return;
        }
        // Backend is empty → just push the current data.
        await switchStorageMode('backend', 'push');
      } catch (e) {
        showNotify(
          `无法连接后端存储：${e instanceof Error ? e.message : String(e)}`,
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
        <DialogTitle>设置</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            <div>
              <Typography variant="subtitle2" gutterBottom>
                数据存储
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
                      浏览器本地存储
                      <Typography variant="caption" color="text.secondary" display="block">
                        数据保存在此浏览器中，无需服务器；可随时导出备份。
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
                      后端服务器存储
                      <Typography variant="caption" color="text.secondary" display="block">
                        数据保存在服务器上（需通过 Express 服务访问本应用），便于多设备同步；切换后浏览器中不再保留数据副本。
                      </Typography>
                    </>
                  }
                />
              </RadioGroup>
              {busy && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  正在切换存储模式…
                </Alert>
              )}
            </div>
            <Divider />
            <div>
              <Typography variant="subtitle2" gutterBottom>
                外观
              </Typography>
              <RadioGroup
                row
                value={settings.themeMode}
                onChange={(e) =>
                  updateSettings({ themeMode: e.target.value as Settings['themeMode'] })
                }
              >
                <FormControlLabel value="system" control={<Radio />} label="跟随系统" />
                <FormControlLabel value="light" control={<Radio />} label="浅色" />
                <FormControlLabel value="dark" control={<Radio />} label="深色" />
              </RadioGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.weekendHighlight}
                    onChange={(e) => updateSettings({ weekendHighlight: e.target.checked })}
                  />
                }
                label="在甘特图中高亮周末"
              />
            </div>
            <Divider />
            <div>
              <Typography variant="subtitle2" gutterBottom color="error">
                危险操作
              </Typography>
              <Button color="error" variant="outlined" onClick={() => setConfirmClear(true)}>
                清空全部任务与标签（{tasks.length} 个任务）
              </Button>
            </div>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>

      {/* Backend already has data — ask which copy wins. */}
      <Dialog open={pendingSwitch !== null} onClose={() => setPendingSwitch(null)} maxWidth="xs" fullWidth>
        <DialogTitle>后端已存在数据</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            服务器上已有 {remoteTaskCount} 个任务。切换到后端存储时，请选择保留哪份数据：
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
            使用后端数据（覆盖浏览器中的 {tasks.length} 个任务）
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setPendingSwitch(null);
              void switchStorageMode('backend', 'push');
            }}
          >
            上传浏览器数据（覆盖服务器）
          </Button>
          <Button onClick={() => setPendingSwitch(null)}>取消</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmClear}
        title="清空全部数据"
        message="将删除所有任务与标签（当前存储位置中的数据也会被覆盖清空）。建议先导出备份。确定继续吗？"
        confirmLabel="全部清空"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          clearAllData();
          setConfirmClear(false);
          showNotify('已清空全部数据', 'success');
        }}
      />
    </>
  );
}
