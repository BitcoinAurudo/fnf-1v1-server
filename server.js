const http = require('http');
const url = require('url');

// Guarda os eventos separados por código de sala
let rooms = {};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (req.method === 'GET' && parsedUrl.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Servidor FNF 1v1 Multi-Salas Online!');
    } else if (req.method === 'POST' && parsedUrl.pathname === '/send') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const room = data.room || 'geral';
                if (!rooms[room]) rooms[room] = { events: [], nextId: 1 };

                rooms[room].events.push({
                    id: rooms[room].nextId++,
                    sender: data.sender,
                    tipo: data.tipo,
                    dir: data.dir
                });

                if (rooms[room].events.length > 100) rooms[room].events.shift();
                res.writeHead(200);
                res.end('ok');
            } catch (e) {
                res.writeHead(400);
                res.end('erro');
            }
        });
    } else if (req.method === 'GET' && parsedUrl.pathname === '/poll') {
        const room = parsedUrl.query.room || 'geral';
        const target = parsedUrl.query.target;
        const after = parseInt(parsedUrl.query.after || '0', 10);

        if (!rooms[room]) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ events: [] }));
            return;
        }

        const filtered = rooms[room].events.filter(e => e.sender === target && e.id > after);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ events: filtered }));
    } else {
        res.writeHead(404);
        res.end();
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Rodando na porta ' + PORT));
