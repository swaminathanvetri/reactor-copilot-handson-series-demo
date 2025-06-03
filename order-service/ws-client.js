// WebSocket client to test the order tracking server

const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8000');

ws.on('open', function open() {
  console.log('Connected to order tracking server');
  
  // Send ping to test connection
  ws.send(JSON.stringify({ type: 'ping' }));
});

ws.on('message', function message(data) {
  console.log('Received from server:', data.toString());
  
  try {
    const message = JSON.parse(data.toString());
    console.log('Parsed message:', message);
    
    if (message.type === 'pong') {
      console.log('Connection test successful!');
      ws.close();
    }
  } catch (error) {
    console.log('Raw message (not JSON):', data.toString());
  }
});

ws.on('close', function close() {
  console.log('Disconnected from server');
});

ws.on('error', function error(err) {
  console.error('WebSocket error:', err);
});
