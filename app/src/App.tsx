import { useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { buildTheme } from './theme';
import { useStore } from './store/useStore';
import TopBar from './components/TopBar';
import GanttView from './components/GanttView';
import TaskTableView from './components/TaskTableView';
import TaskFormDialog from './components/TaskFormDialog';
import TagManagerDialog from './components/TagManagerDialog';
import SettingsDialog from './components/SettingsDialog';
import ImportExportDialog from './components/ImportExportDialog';

export default function App() {
  const loaded = useStore((s) => s.loaded);
  const view = useStore((s) => s.view);
  const themeMode = useStore((s) => s.settings.themeMode);
  const notify = useStore((s) => s.notify);
  const dismissNotify = useStore((s) => s.dismissNotify);
  const init = useStore((s) => s.init);

  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const resolvedMode = themeMode === 'system' ? (prefersDark ? 'dark' : 'light') : themeMode;
  const theme = useMemo(() => buildTheme(resolvedMode), [resolvedMode]);

  useEffect(() => {
    void init();
  }, [init]);

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-cn">
        <CssBaseline />
        {!loaded ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress />
            <Typography color="text.secondary">Timetender 加载中…</Typography>
          </Box>
        ) : (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <TopBar />
            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              {view === 'gantt' ? <GanttView /> : <TaskTableView />}
            </Box>
            <TaskFormDialog />
            <TagManagerDialog />
            <SettingsDialog />
            <ImportExportDialog />
          </Box>
        )}
        <Snackbar
          open={notify !== null}
          autoHideDuration={3000}
          onClose={dismissNotify}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          {notify ? (
            <Alert onClose={dismissNotify} severity={notify.severity} variant="filled">
              {notify.message}
            </Alert>
          ) : undefined}
        </Snackbar>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
