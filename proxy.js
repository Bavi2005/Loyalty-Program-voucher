const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'frontend', 'dist');
// Overridable for Docker: the compose network resolves the backend by service name
const BACKEND = process.env.BACKEND_TARGET || 'http://localhost:5000';

const proxy = httpProxy.createProxyServer({});

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = path.join(DIST, urlPath);

  if (urlPath === '/' || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream' };
    if (filePath.endsWith('index.html') || ext === '.js' || ext === '.css') {
      headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    }
    res.writeHead(200, headers);
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api') || req.url.startsWith('/uploads')) {
    proxy.web(req, res, { target: BACKEND });
  } else {
    serveStatic(req, res);
  }
});

proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Proxy error');
});

server.listen(8080, '0.0.0.0', () => {
  console.log('App server running on http://0.0.0.0:8080');
  console.log('  - Static frontend served from', DIST);
  console.log('  - Backend API (port 5000) proxied to /api and /uploads');
});
