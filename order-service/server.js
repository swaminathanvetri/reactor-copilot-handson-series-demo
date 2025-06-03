// Express.js server with WebSocket endpoint for real-time order tracking

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { app } = require('./app');

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Enable JSON parsing and CORS
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// In-memory order storage (in production, use a database)
const orders = new Map();
const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered'];

// Generate unique order ID
function generateOrderId() {
  return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
}

// Broadcast message to all connected WebSocket clients
function broadcast(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// WebSocket endpoint for real-time updates
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Send current orders to newly connected client
  ws.send(JSON.stringify({
    type: 'initial_orders',
    orders: Array.from(orders.values())
  }));

  ws.on('message', (message) => {
    console.log('Received:', message.toString());
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    } catch (error) {
      console.error('Invalid message format:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// REST API endpoints
app.get('/', (req, res) => {
  res.send('Order Tracking WebSocket server is running.');
});

// Get all orders
app.get('/api/orders', (req, res) => {
  res.json(Array.from(orders.values()));
});

// Create new order
app.post('/api/orders', (req, res) => {
  const { customerName, items } = req.body;
  
  if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Customer name and items are required' });
  }

  const order = {
    id: generateOrderId(),
    customerName,
    items,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  orders.set(order.id, order);
  
  // Broadcast new order to all connected clients
  broadcast({
    type: 'order_created',
    order
  });

  res.status(201).json(order);
});

// Update order status
app.put('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be one of: ' + ORDER_STATUSES.join(', ') });
  }

  const order = orders.get(id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();
  orders.set(id, order);

  // Broadcast status update to all connected clients
  broadcast({
    type: 'order_status_updated',
    order
  });

  res.json(order);
});

// Get specific order
app.get('/api/orders/:id', (req, res) => {
  const order = orders.get(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
