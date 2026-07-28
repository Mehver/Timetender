import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import LabelIcon from '@mui/icons-material/Label';
import SettingsIcon from '@mui/icons-material/Settings';
import SyncIcon from '@mui/icons-material/Sync';
import TableChartIcon from '@mui/icons-material/TableChart';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import logo from '../assets/256.png';

import { useStore } from '../store/useStore';
import { useT } from '../i18n';

function SaveStatusChip() {
  const saveStatus = useStore((s) => s.saveStatus);
  const storageMode = useStore((s) => s.settings.storageMode);
  const t = useT();
  if (saveStatus === 'saving') {
    return <Chip size="small" icon={<SyncIcon />} label={t('topBar.saving')} variant="outlined" />;
  }
  if (saveStatus === 'saved') {
    return (
      <Chip
        size="small"
        icon={<CheckCircleIcon />}
        label={storageMode === 'local' ? t('topBar.savedToLocal') : t('topBar.savedToServer')}
        color="success"
        variant="outlined"
      />
    );
  }
  if (saveStatus === 'error') {
    return <Chip size="small" icon={<ErrorOutlineIcon />} label={t('topBar.saveFailed')} color="error" />;
  }
  return null;
}

export default function TopBar() {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const openTaskDialog = useStore((s) => s.openTaskDialog);
  const setTagsDialogOpen = useStore((s) => s.setTagsDialogOpen);
  const setSettingsDialogOpen = useStore((s) => s.setSettingsDialogOpen);
  const setIoDialogOpen = useStore((s) => s.setIoDialogOpen);
  const t = useT();

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar variant="dense" sx={{ gap: 1 }}>
        <Box component="img" src={logo} alt="Timetender" sx={{ height: 32, width: 32 }} />
        <Typography variant="h6" component="div" sx={{ mr: 2 }}>
          Timetender
        </Typography>
        <Tabs
          value={view}
          onChange={(_e, v) => setView(v)}
          sx={{ minHeight: 0, '& .MuiTab-root': { minHeight: 48 } }}
        >
          <Tab value="gantt" icon={<ViewColumnIcon />} iconPosition="start" label={t('topBar.gantt')} />
          <Tab value="table" icon={<TableChartIcon />} iconPosition="start" label={t('topBar.tasks')} />
        </Tabs>
        <Box sx={{ flex: 1 }} />
        <SaveStatusChip />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openTaskDialog()}
          disableElevation
        >
          {t('topBar.newTask')}
        </Button>
        <Tooltip title={t('topBar.tagManagement')}>
          <IconButton onClick={() => setTagsDialogOpen(true)}>
            <LabelIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('topBar.importExport')}>
          <IconButton onClick={() => setIoDialogOpen(true)}>
            <ImportExportIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('topBar.settings')}>
          <IconButton onClick={() => setSettingsDialogOpen(true)}>
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
