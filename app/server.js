import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = Number(process.env.PORT) || 8080;
const DATA_DIR = process.env.TIMETENDER_DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'timetender-data.json');

app.use(express.json({ limit: '10mb' }));

// Load the whole dataset (null when nothing has been saved yet).
app.get('/api/data', (_req, res) => {
  if (!fs.existsSync(DATA_FILE)) {
    res.json(null);
    return;
  }
  res.type('application/json').send(fs.readFileSync(DATA_FILE, 'utf8'));
});

// Save the whole dataset.
app.post('/api/data', (req, res) => {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(req.body ?? null));
  res.json({ ok: true });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Static frontend (single-file build) with SPA fallback.
app.use(express.static(path.join(__dirname, 'dist')));
app.use((_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Timetender server listening on port ${PORT}`);
  console.log(`Data file: ${DATA_FILE}`);
});
