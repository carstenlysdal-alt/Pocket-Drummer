const cp = require('child_process');
const http = require('http');
const fs = require('fs');

let logs = '';
function log(msg) {
  const line = `[wrapper] ${new Date().toISOString()} - ${msg}\n`;
  logs += line;
  console.log(line.trim());
}

log('Starting Next.js production server...');

const port = process.env.PORT || '3000';
const standalonePath = './.next/standalone/server.js';
let targetBin = './node_modules/next/dist/bin/next';
let args = ['start'];

if (fs.existsSync(standalonePath)) {
  log('Found Next.js standalone server, using it.');
  targetBin = standalonePath;
  args = [];
} else {
  log('Standalone server not found, falling back to next start.');
}

log(`Executing: node ${targetBin} ${args.join(' ')} on port ${port}`);

const nextProc = cp.spawn('node', [targetBin, ...args], {
  env: {
    ...process.env,
    HOSTNAME: '0.0.0.0',
    PORT: port
  }
});

nextProc.stdout.on('data', (data) => {
  const msg = data.toString();
  logs += msg;
  process.stdout.write(msg);
});

nextProc.stderr.on('data', (data) => {
  const msg = data.toString();
  logs += msg;
  process.stderr.write(msg);
});

nextProc.on('error', (err) => {
  log(`Failed to spawn Next.js: ${err.message}`);
  startFallbackServer(err.message, -1);
});

nextProc.on('exit', (code, signal) => {
  log(`Next.js exited with code ${code} and signal ${signal}`);
  startFallbackServer(`Next.js exited with code ${code} (signal: ${signal})`, code);
});

function startFallbackServer(reason, code) {
  log(`Starting fallback server on port ${port} due to: ${reason}`);
  try {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.write(`CRITICAL: Next.js failed to start on Railway!\n`);
      res.write(`Reason: ${reason}\n`);
      res.write(`Exit Code: ${code}\n\n`);
      res.write(`--- STARTUP LOGS ---\n`);
      res.write(logs);
      res.end();
    });

    server.listen(parseInt(port), '0.0.0.0', () => {
      log(`Fallback server successfully listening on 0.0.0.0:${port}`);
    });
  } catch (err) {
    console.error('Failed to start fallback server:', err);
  }
}

