// Basic Express.js server with WebSocket endpoint using ws

const http = require('http');
const WebSocket = require('ws');
const { app } = require('./app');

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket endpoint
wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('message', (message) => {
    console.log('Received:', message.toString());
    ws.send(`Echo: ${message}`);
  });
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
