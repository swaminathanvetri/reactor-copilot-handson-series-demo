// Basic Express.js server with WebSocket endpoint using ws

const http = require('http');
const WebSocket = require('ws');
const { app, wsConnections } = require('./app');

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket endpoint
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Add to connections set for broadcasting
  wsConnections.add(ws);
  
  ws.on('message', (message) => {
    console.log('Received:', message.toString());
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'subscribe') {
        // Client wants to subscribe to order updates
        ws.send(JSON.stringify({
          type: 'subscribed',
          message: 'Subscribed to order tracking updates'
        }));
      }
    } catch (e) {
      // Fallback for non-JSON messages
      ws.send(`Echo: ${message}`);
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
    wsConnections.delete(ws);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    wsConnections.delete(ws);
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
