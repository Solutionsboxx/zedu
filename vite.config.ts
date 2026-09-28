import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { defineConfig, Plugin } from 'vite';

let pythonProc: ChildProcess | null = null;

function fastApiPlugin(): Plugin {
  return {
    name: 'fastapi-backend',
    configureServer(server) {
      if (!pythonProc) {
        console.log('[FastAPI] Launching Python FastAPI backend on port 8000...');
        pythonProc = spawn(
          'python3',
          ['-m', 'uvicorn', 'backend.main:app', '--host', '127.0.0.1', '--port', '8000'],
          {
            stdio: 'inherit',
            env: {
              ...process.env,
              PYTHONPATH: `${path.resolve(__dirname, '.python_packages')}:${process.env.PYTHONPATH || ''}`,
            },
          }
        );

        pythonProc.on('error', (err) => {
          console.error('[FastAPI] Process failed to spawn:', err);
        });

        const stop = () => {
          if (pythonProc) {
            pythonProc.kill('SIGTERM');
            pythonProc = null;
          }
        };

        process.on('exit', stop);
        process.on('SIGINT', stop);
        process.on('SIGTERM', stop);
        server.httpServer?.on('close', stop);
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), fastApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
        '/docs': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
        '/openapi.json': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

