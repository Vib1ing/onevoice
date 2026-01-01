const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname; // frontend directory
const PORT = 5173;

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function filePathFromReq(urlPath) {
  // Normalize and prevent path traversal
  const safePath = path.normalize(decodeURIComponent(urlPath)).replace(/^\.[\\/]|[\\/]+$/g, '');
  const resolved = path.join(ROOT, safePath);
  // If url is '/', serve index.html
  if (safePath === '' || safePath === '.') return path.join(ROOT, 'index.html');
  return resolved;
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  // Proxy /api requests to the backend
  if (url.startsWith('/api/')) {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: req.url,
      method: req.method,
      headers: req.headers
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (e) => {
      console.error(`Proxy error: ${e.message}`);
      res.statusCode = 502;
      res.end('Bad Gateway');
    });

    req.pipe(proxyReq, { end: true });
    return;
  }

  let filePath = filePathFromReq(url);
  // If path is a directory, try index.html inside it
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    fs.readFile(filePath, (err2, data) => {
      if (err2) {
        res.statusCode = 404;
        res.end('Not Found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      const mimeType = mime[ext] || 'text/plain';
      res.setHeader('Content-Type', mimeType);
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Frontend dev server running at http://localhost:${PORT}/`);
});
