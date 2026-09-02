const { spawn } = require('child_process');

let shuttingDown = false;

function startProcess(name, args, extraEnv = {}) {
  const child = spawn(process.execPath, args, {
    stdio: 'inherit',
    env: {
      ...process.env,
      ...extraEnv,
    },
  });

  child.on('exit', (code, signal) => {
    console.error(
      `${name} exited with code ${code ?? 'null'} signal ${signal ?? 'none'}`
    );

    if (!shuttingDown) {
      shutdown(code || 1);
    }
  });

  return child;
}

// Backend must use internal port 5000
const backend = startProcess(
  'backend',
  ['backend/src/server.js'],
  { PORT: '5000' }
);

// Public proxy uses Render's PORT (8080 in your setup)
const proxy = startProcess(
  'proxy',
  ['proxy.js']
);

function shutdown(exitCode = 0) {
  if (shuttingDown) return;

  shuttingDown = true;

  if (!backend.killed) backend.kill('SIGTERM');
  if (!proxy.killed) proxy.kill('SIGTERM');

  setTimeout(() => {
    process.exit(exitCode);
  }, 500).unref();
}

process.on('SIGTERM', () => shutdown(0));
process.on('SIGINT', () => shutdown(0));
