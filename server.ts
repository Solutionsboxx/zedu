import express from 'express';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Spawn Python FastAPI backend process
console.log('[FastAPI] Spawning Python FastAPI service on port 8001...');
const fastApiProc = spawn('python3', ['-m', 'uvicorn', 'backend.main:app', '--host', '127.0.0.1', '--port', '8001'], {
  stdio: 'inherit',
});

fastApiProc.on('error', (err) => {
  console.error('[FastAPI] Process failed to spawn:', err);
});

const cleanup = () => {
  if (fastApiProc) {
    fastApiProc.kill('SIGTERM');
  }
};
process.on('exit', cleanup);
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Forward /api, /docs, /openapi.json to FastAPI using fetch/stream
app.use(['/api', '/docs', '/openapi.json'], async (req, res) => {
  const targetUrl = `http://127.0.0.1:8001${req.originalUrl}`;
  try {
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string' && key.toLowerCase() !== 'host') {
        headers[key] = value;
      }
    }

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      fetchOptions.body = Buffer.concat(chunks);
    }

    const response = await fetch(targetUrl, fetchOptions);
    res.status(response.status);

    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error(`Error proxying to FastAPI (${targetUrl}):`, err);
    res.status(502).json({ error: 'FastAPI backend unavailable or initializing' });
  }
});

// Serve frontend production build if present, otherwise handle dev
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  const indexHtml = path.join(distPath, 'index.html');
  res.sendFile(indexHtml);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
