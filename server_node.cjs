/**
 * server_node.cjs — servidor HTTP para seduc-processos na porta 3003
 */
const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT    = 3003;
const WEBROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0]; // ignora query string (cache busters)
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(WEBROOT, urlPath);

  // Segurança: evita path traversal
  if (!filePath.startsWith(WEBROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + urlPath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('Servidor v1.1.13 ouvindo em http://localhost:' + PORT + '/');
  console.log('Raiz: ' + WEBROOT);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('ERRO: Porta ' + PORT + ' já está em uso. Encerre o processo anterior.');
  } else {
    console.error('ERRO:', err.message);
  }
  process.exit(1);
});
