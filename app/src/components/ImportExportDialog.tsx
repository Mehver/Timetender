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
      showNotify(`${source}中没有可导入的数据`, 'warning');
      return;
    }
    addImported(tasks, tags, mode);
    showNotify(
      `已${mode === 'replace' ? '替换导入' : '追加导入'} ${tasks.length} 个任务、${tags.length} 个标签`,
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
    showNotify(ok ? '任务表已复制，可直接粘贴到 Excel' : '复制失败', ok ? 'success' : 'error');
  };

  /* ------------------------------ import ------------------------------ */

  const handleJsonFile = async (file: File) => {
    try {
      const json: unknown = JSON.parse(await readFileText(file));
      if (isV2Data(json)) {
        finishImport(json.tasks, json.tags, '文件');
      } else if (isLegacyEventsJson(json)) {
        // Old event.json — need (optionally) the matching tag.json before converting.
        setLegacyEvents(json);
        showNotify('检测到旧版 event.json，请选择对应的 tag.json 后执行转换导入（可跳过）', 'info');
      } else if (isLegacyTagsJson(json)) {
        setLegacyTags(json);
        showNotify('已读取旧版 tag.json', 'info');
      } else {
        showNotify('无法识别的 JSON 格式', 'error');
      }
    } catch (e) {
      showNotify(`JSON 解析失败：${e instanceof Error ? e.message : String(e)}`, 'error');
    } finally {
      if (jsonFileRef.current) jsonFileRef.current.value = '';
    }
  };

  const handleLegacyTagFile = async (file: File) => {
    try {
      const json: unknown = JSON.parse(await readFileText(file));
      if (isLegacyTagsJson(json)) {
        setLegacyTags(json);
        showNotify('已读取旧版 tag.json，现在可以执行转换导入', 'info');
      } else {
        showNotify('该文件不是有效的旧版 tag.json', 'error');
      }
    } catch (e) {
      showNotify(`JSON 解析失败：${e instanceof Error ? e.message : String(e)}`, 'error');
    } finally {
      if (legacyTagFileRef.current) legacyTagFileRef.current.value = '';
    }
  };

  const runLegacyConvert = () => {
    if (!legacyEvents) return;
    const converted = convertLegacy(legacyEvents, legacyTags);
    finishImport(converted.tasks, converted.tags, '旧版数据');
  };

  const handlePasteImport = () => {
    const text = pasteText.trim();
    if (!text) {
      showNotify('请先粘贴内容', 'warning');
      return;
    }
    // Try JSON first, then TSV.
    try {
      const json: unknown = JSON.parse(text);
      if (isV2Data(json)) {
        finishImport(json.tasks, json.tags, '粘贴内容');
        return;
      }
      if (isLegacyEventsJson(json)) {
        const converted = convertLegacy(json, null);
        finishImport(converted.tasks, converted.tags, '旧版数据');
        return;
      }
      showNotify('无法识别的 JSON 格式', 'error');
      return;
    } catch {
      /* not JSON → treat as TSV */
    }
    const { tasks, newTags } = tsvToTasks(text, data.tags);
    finishImport(tasks, newTags, '粘贴内容');
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>导入 / 导出</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 0.5 }}>
          {/* export */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              导出（两种存储模式下均可用，建议定期备份）
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={exportJson}>
                JSON 备份
              </Button>
              <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={exportCsv}>
                CSV（Excel 可打开）
              </Button>
              <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={exportTsv}>
                复制 TSV 到剪贴板
              </Button>
            </Stack>
          </Box>
          <Divider />
          {/* import */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              导入方式
            </Typography>
            <RadioGroup row value={mode} onChange={(e) => setMode(e.target.value as ImportMode)}>
              <FormControlLabel value="append" control={<Radio size="small" />} label="追加到现有数据" />
              <FormControlLabel value="replace" control={<Radio size="small" />} label="替换全部数据" />
            </RadioGroup>
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Button
                  variant="outlined"
                  startIcon={<FileUploadIcon />}
                  onClick={() => jsonFileRef.current?.click()}
                >
                  导入 JSON 文件
                </Button>
                <Typography variant="caption" color="text.secondary">
                  支持本应用导出的备份，以及旧版 v0.1.x 的 event.json / tag.json
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
                        {legacyTags ? '已选 tag.json ✓' : '选择 tag.json（可选）'}
                      </Button>
                      <Button size="small" variant="contained" disableElevation onClick={runLegacyConvert}>
                        转换并导入（{(legacyEvents as unknown[]).length} 个任务）
                      </Button>
                    </Stack>
                  }
                >
                  已读取旧版 event.json
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
                label="或在此粘贴 Excel 区域 / JSON 文本"
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                multiline
                minRows={4}
                fullWidth
                placeholder={'从 Excel 复制的区域（制表符分隔）：\n标题\t开始\t截止\t标签\n写报告\t2026-08-01\t2026-08-05\t工作'}
              />
              <Button
                variant="contained"
                disableElevation
                onClick={handlePasteImport}
                disabled={!pasteText.trim()}
                sx={{ alignSelf: 'flex-start' }}
              >
                解析并导入
              </Button>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>关闭</Button>
      </DialogActions>
    </Dialog>
  );
}
