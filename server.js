const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.wasm': 'application/wasm',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
};

http.createServer((req, res) => {
    let reqUrl = decodeURIComponent(req.url);
    let filePath = '.' + reqUrl;
    if (filePath == './') filePath = './index.html';

    // remove query strings
    filePath = filePath.split('?')[0];

    const extname = String(path.extname(filePath)).toLowerCase();

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error: ' + error.code);
            }
        } else {
            const headers = {};

            // Set Content-Type based on actual file or Unity specific endings
            if (filePath.endsWith('.js.br') || filePath.endsWith('.js.gz') || filePath.endsWith('.js')) {
                headers['Content-Type'] = 'application/javascript';
            } else if (filePath.endsWith('.wasm.br') || filePath.endsWith('.wasm.gz') || filePath.endsWith('.wasm')) {
                headers['Content-Type'] = 'application/wasm';
            } else if (filePath.endsWith('.data.br') || filePath.endsWith('.data.gz') || filePath.endsWith('.data')) {
                headers['Content-Type'] = 'application/octet-stream';
            } else {
                headers['Content-Type'] = MIME_TYPES[extname] || 'application/octet-stream';
            }

            // Set Content-Encoding for Unity compressed WebGL files
            if (filePath.endsWith('.br')) {
                headers['Content-Encoding'] = 'br';
            } else if (filePath.endsWith('.gz')) {
                headers['Content-Encoding'] = 'gzip';
            }

            // Enable cross-origin isolation (required by some Unity WebGL builds for SharedArrayBuffer)
            headers['Cross-Origin-Opener-Policy'] = 'same-origin';
            headers['Cross-Origin-Embedder-Policy'] = 'require-corp';

            res.writeHead(200, headers);
            res.end(content, 'utf-8');
        }
    });
}).listen(PORT);

console.log(`Unity WebGL dev server running at http://127.0.0.1:${PORT}/`);
