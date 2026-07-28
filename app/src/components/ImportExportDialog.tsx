import { useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
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
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';

import { useStore } from '../store/useStore';
import type { Tag, Task, TimetenderData } from '../types';
import { convertLegacy, isLegacyEventsJson, isLegacyTagsJson } from '../utils/legacy';
import { tasksToCsv, tasksToTsv, tsvToTasks } from '../utils/taskio';
import { copyText } from '../utils/clipboard';
import { downloadText } from '../utils/download';
import { useT } from '../i18n';

type ImportMode = 'append' | 'replace';

function isV2Data(json: unknown): json is TimetenderData {
  return (
    typeof json === 'object' &&
    json !== null &&
    (json as { version?: unknown }).version === 2 &&
    Array.isArray((json as TimetenderData).tasks) &&
    Array.isArray((json as TimetenderData).tags)
  );
}

async function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
}

export default function ImportExportDialog() {
  const open = useStore((s) => s.ioDialogOpen);
  const setOpen = useStore((s) => s.setIoDialogOpen);
  const data = useStore((s) => s.data);
  const addImported = useStore((s) => s.addImported);
  const showNotify = useStore((s) => s.showNotify);
  const t = useT();

  const [mode, setMode] = useState<ImportMode>('append');
  const [legacyEvents, setLegacyEvents] = useState<unknown | null>(null);
  const [legacyTags, setLegacyTags] = useState<unknown | null>(null);
  const [pasteText, setPasteText] = useState('');

  const jsonFileRef = useRef<HTMLInputElement>(null);
  const legacyTagFileRef = useRef<HTMLInputElement>(null);

  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  const resetTransient = () => {
    setLegacyEvents(null);
    setLegacyTags(null);
    setPasteText('');
    if (jsonFileRef.current) jsonFileRef.current.value = '';
    if (legacyTagFileRef.current) legacyTagFileRef.current.value = '';
  };

  const finishImport = (tasks: Task[], tags: Tag[], source: string) => {
    if (tasks.length === 0 && tags.length === 0) {
      showNotify(t('importExport.noData', { source }), 'warning');
      return;
    }
    addImported(tasks, tags, mode);
    const key = mode === 'replace' ? 'importExport.importedReplace' : 'importExport.importedAppend';
    showNotify(
      t(key, { tasks: tasks.length, tags: tags.length }),
      'success',
    );
    resetTransient();
  };

  /* ------------------------------ export ------------------------------ */

  const exportJson = () => {
    downloadText(`timetender-${stamp}.json`, JSON.stringify(data, null, 2));
  };
  const exportCsv = () => {
    downloadText(`timetender-tasks-${stamp}.csv`, tasksToCsv(data.tasks, data.tags), 'text/csv');
  };
  const exportTsv = async () => {
    const ok = await copyText(tasksToTsv(data.tasks, data.tags));
    showNotify(ok ? t('importExport.copied') : t('importExport.copyFailed'), ok ? 'success' : 'error');
  };

  /* ------------------------------ import ------------------------------ */

  const handleJsonFile = async (file: File) => {
    try {
      const json: unknown = JSON.parse(await readFileText(file));
      if (isV2Data(json)) {
        finishImport(json.tasks, json.tags, t('importExport.importJson'));
      } else if (isLegacyEventsJson(json)) {
        setLegacyEvents(json);
        showNotify(t('importExport.legacyDetected'), 'info');
      } else if (isLegacyTagsJson(json)) {
        setLegacyTags(json);
        showNotify(t('importExport.tagRead'), 'info');
      } else {
        showNotify(t('importExport.unrecognizedJson'), 'error');
      }
    } catch (e) {
      showNotify(t('importExport.jsonParseFailed', { error: e instanceof Error ? e.message : String(e) }), 'error');
    } finally {
      if (jsonFileRef.current) jsonFileRef.current.value = '';
    }
  };

  const handleLegacyTagFile = async (file: File) => {
    try {
      const json: unknown = JSON.parse(await readFileText(file));
      if (isLegacyTagsJson(json)) {
        setLegacyTags(json);
        showNotify(t('importExport.tagReadReady'), 'info');
      } else {
        showNotify(t('importExport.notValidTag'), 'error');
      }
    } catch (e) {
      showNotify(t('importExport.jsonParseFailed', { error: e instanceof Error ? e.message : String(e) }), 'error');
    } finally {
      if (legacyTagFileRef.current) legacyTagFileRef.current.value = '';
    }
  };

  const runLegacyConvert = () => {
    if (!legacyEvents) return;
    const converted = convertLegacy(legacyEvents, legacyTags);
    finishImport(converted.tasks, converted.tags, t('importExport.legacyRead'));
  };

  const handlePasteImport = () => {
    const text = pasteText.trim();
    if (!text) {
      showNotify(t('importExport.pasteFirst'), 'warning');
      return;
    }
    try {
      const json: unknown = JSON.parse(text);
      if (isV2Data(json)) {
        finishImport(json.tasks, json.tags, t('importExport.pastePlaceholder'));
        return;
      }
      if (isLegacyEventsJson(json)) {
        const converted = convertLegacy(json, null);
        finishImport(converted.tasks, converted.tags, t('importExport.legacyRead'));
        return;
      }
      showNotify(t('importExport.unrecognizedJson'), 'error');
      return;
    } catch {
      /* not JSON -> treat as TSV */
    }
    const { tasks, newTags } = tsvToTasks(text, data.tags);
    finishImport(tasks, newTags, t('importExport.pastePlaceholder'));
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>{t('importExport.title')}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 0.5 }}>
          {/* export */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {t('importExport.exportSection')}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={exportJson}>
                {t('importExport.jsonBackup')}
              </Button>
              <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={exportCsv}>
                {t('importExport.csv')}
              </Button>
              <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={exportTsv}>
                {t('importExport.copyTsv')}
              </Button>
            </Stack>
          </Box>
          <Divider />
          {/* import */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {t('importExport.importMode')}
            </Typography>
            <RadioGroup row value={mode} onChange={(e) => setMode(e.target.value as ImportMode)}>
              <FormControlLabel value="append" control={<Radio size="small" />} label={t('importExport.append')} />
              <FormControlLabel value="replace" control={<Radio size="small" />} label={t('importExport.replace')} />
            </RadioGroup>
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Button
                  variant="outlined"
                  startIcon={<FileUploadIcon />}
                  onClick={() => jsonFileRef.current?.click()}
                >
                  {t('importExport.importJson')}
                </Button>
                <Typography variant="caption" color="text.secondary">
                  {t('importExport.jsonHint')}
                </Typography>
                <input
                  ref={jsonFileRef}
                  type="file"
                  accept=".json,application/json"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleJsonFile(f);
                  }}
                />
              </Stack>
              {legacyEvents !== null && (
                <Alert
                  severity="info"
                  action={
                    <Stack direction="row" spacing={1}>
                      <Button size="small" onClick={() => legacyTagFileRef.current?.click()}>
                        {legacyTags ? t('importExport.tagJsonSelected') : t('importExport.selectTagJson')}
                      </Button>
                      <Button size="small" variant="contained" disableElevation onClick={runLegacyConvert}>
                        {t('importExport.convertImport', { count: (legacyEvents as unknown[]).length })}
                      </Button>
                    </Stack>
                  }
                >
                  {t('importExport.legacyRead')}
                  <input
                    ref={legacyTagFileRef}
                    type="file"
                    accept=".json,application/json"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleLegacyTagFile(f);
                    }}
                  />
                </Alert>
              )}
              <TextField
                label={t('importExport.pastePlaceholder')}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                multiline
                minRows={4}
                fullWidth
                placeholder={t('importExport.pasteArea')}
              />
              <Button
                variant="contained"
                disableElevation
                onClick={handlePasteImport}
                disabled={!pasteText.trim()}
                sx={{ alignSelf: 'flex-start' }}
              >
                {t('importExport.parseImport')}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>{t('importExport.close')}</Button>
      </DialogActions>
    </Dialog>
  );
}
