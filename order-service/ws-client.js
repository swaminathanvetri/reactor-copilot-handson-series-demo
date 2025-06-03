// Simple WebSocket client to test the Express.js WebSocket server

const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8000');

ws.on('open', function open() {
  console.log('Connected to server');
  ws.send('Hello from client!');
});

ws.on('message', function message(data) {
  console.log('Received from server:', data.toString());
  ws.close();
});

ws.on('close', function close() {
  console.log('Disconnected from server');
});

ws.on('error', function error(err) {
  console.error('WebSocket error:', err);
});
