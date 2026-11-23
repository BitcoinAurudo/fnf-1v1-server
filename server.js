const http = require('http');
const url = require('url');

let events = [];
let nextId = 1;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (req.method === 'GET' && parsedUrl.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Servidor FNF 1v1 Online!');
    } else if (req.method === 'POST' && parsedUrl.pathname === '/send') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                events.push({ id: nextId++, ...data });
                if (events.length > 100) events.shift();
                res.writeHead(200);
                res.end('ok');
            } catch (e) {
                res.writeHead(400);
                res.end('erro');
            }
        });
    } else if (req.method === 'GET' && parsedUrl.pathname === '/poll') {
        const target = parsedUrl.query.target;
        const after = parseInt(parsedUrl.query.after || '0', 10);
        const filtered = events.filter(e => e.sender === target && e.id > after);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ events: filtered }));
    } else {
        res.writeHead(404);
        res.end();
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Rodando na porta ' + PORT));
