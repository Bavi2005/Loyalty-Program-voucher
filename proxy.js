const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'frontend', 'dist');

// Backend runs internally on port 5000.
// BACKEND_TARGET can still override this for Docker Compose/local use.
const BACKEND =
  process.env.BACKEND_TARGET || 'http://127.0.0.1:5000';

// Render provides PORT. Falls back to 8080 locally.
const PUBLIC_PORT = Number(process.env.PORT || 8080);

const proxy = httpProxy.createProxyServer({});

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};

function serveStatic(req, res) {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);

  let filePath = path.join(DIST, urlPath);

  // React SPA fallback:
  // if the requested file doesn't exist, serve index.html.
  try {
    if (
      urlPath === '/' ||
      !fs.existsSync(filePath) ||
      fs.statSync(filePath).isDirectory()
    ) {
      filePath = path.join(DIST, 'index.html');
    }
  } catch (err) {
    filePath = path.join(DIST, 'index.html');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error('Static file error:', err);

      res.writeHead(404, {
        'Content-Type': 'text/plain; charset=utf-8',
      });

      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();

    const headers = {
      'Content-Type': MIME[ext] || 'application/octet-stream',
    };

    // Prevent old frontend builds from being cached.
    if (
      filePath.endsWith('index.html') ||
      ext === '.js' ||
      ext === '.css'
    ) {
      headers['Cache-Control'] =
        'no-store, no-cache, must-revalidate, proxy-revalidate';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    }

    res.writeHead(200, headers);
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const pathname = req.url.split('?')[0];

  // Send API, uploaded files and backend health checks
  // to Express running internally on port 5000.
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/uploads') ||
    pathname === '/health' ||
    pathname === '/ready'
  ) {
    proxy.web(req, res, {
      target: BACKEND,
      changeOrigin: true,
    });

    return;
  }

  // Everything else is the React frontend.
  serveStatic(req, res);
});

proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err.message);

  if (!res.headersSent) {
    res.writeHead(502, {
      'Content-Type': 'application/json; charset=utf-8',
    });
  }

  res.end(
    JSON.stringify({
      error: 'Backend service unavailable',
    })
  );
});

server.on('error', (err) => {
  console.error('App server error:', err);
  process.exit(1);
});

server.listen(PUBLIC_PORT, '0.0.0.0', () => {
  console.log(
    `App server running on http://0.0.0.0:${PUBLIC_PORT}`
  );

  console.log(
    '  - Static frontend served from',
    DIST
  );

  console.log(
    `  - Backend proxied to ${BACKEND}`
  );

  console.log(
    '  - Proxy routes: /api, /uploads, /health, /ready'
  );
});
