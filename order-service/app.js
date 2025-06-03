const express = require('express');

const app = express();

// Middleware
app.use(express.json());

// In-memory data store for orders
let orders = [];
let nextOrderId = 1;

// Store WebSocket connections for broadcasting
let wsConnections = new Set();

// Validation utilities
const validateOrder = (order) => {
  const errors = [];
  
  if (!order.customerId || typeof order.customerId !== 'string') {
    errors.push('customerId is required and must be a string');
  }
  
  if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
    errors.push('items is required and must be a non-empty array');
  } else {
    order.items.forEach((item, index) => {
      if (!item.name || typeof item.name !== 'string') {
        errors.push(`items[${index}].name is required and must be a string`);
      }
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
        errors.push(`items[${index}].quantity is required and must be a positive number`);
      }
      if (!item.price || typeof item.price !== 'number' || item.price <= 0) {
        errors.push(`items[${index}].price is required and must be a positive number`);
      }
    });
  }
  
  if (order.status && !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(order.status)) {
    errors.push('status must be one of: pending, processing, shipped, delivered, cancelled');
  }
  
  return errors;
};

const calculateTotal = (items) => {
  const total = items.reduce((total, item) => total + (item.quantity * item.price), 0);
  return Math.round(total * 100) / 100; // Round to 2 decimal places
};

// Helper function to reset data (for testing)
const resetData = () => {
  orders = [];
  nextOrderId = 1;
};

// Helper function to broadcast order updates via WebSocket
const broadcastOrderUpdate = (order) => {
  const message = JSON.stringify({
    type: 'orderUpdate',
    data: order
  });
  
  wsConnections.forEach(ws => {
    if (ws.readyState === 1) { // WebSocket.OPEN
      ws.send(message);
    }
  });
};

// REST API Endpoints

// Create order (POST /orders)
app.post('/orders', (req, res) => {
  try {
    const validationErrors = validateOrder(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
    }

    const currentTime = new Date().toISOString();
    const status = req.body.status || 'pending';
    const order = {
      id: nextOrderId++,
      customerId: req.body.customerId,
      items: req.body.items,
      status: status,
      total: calculateTotal(req.body.items),
      createdAt: currentTime,
      updatedAt: currentTime,
      statusHistory: {
        [status]: currentTime
      }
    };

    orders.push(order);
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get all orders (GET /orders)
app.get('/orders', (req, res) => {
  try {
    res.json(orders);
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get order by ID (GET /orders/:id)
app.get('/orders/:id', (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    
    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID',
        message: 'Order ID must be a valid number'
      });
    }

    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: `Order with ID ${orderId} does not exist`
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Update order (PUT /orders/:id)
app.put('/orders/:id', (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    
    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID',
        message: 'Order ID must be a valid number'
      });
    }

    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return res.status(404).json({
        error: 'Order not found',
        message: `Order with ID ${orderId} does not exist`
      });
    }

    const validationErrors = validateOrder(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
    }

    const currentTime = new Date().toISOString();
    const newStatus = req.body.status || orders[orderIndex].status;
    const currentOrder = orders[orderIndex];
    
    // Update status history if status changed
    const statusHistory = { ...currentOrder.statusHistory };
    if (newStatus !== currentOrder.status && !statusHistory[newStatus]) {
      statusHistory[newStatus] = currentTime;
    }

    const updatedOrder = {
      ...currentOrder,
      customerId: req.body.customerId,
      items: req.body.items,
      status: newStatus,
      total: calculateTotal(req.body.items),
      updatedAt: currentTime,
      statusHistory: statusHistory
    };

    orders[orderIndex] = updatedOrder;
    
    // Broadcast update if status changed
    if (newStatus !== currentOrder.status) {
      broadcastOrderUpdate(updatedOrder);
    }
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Delete order (DELETE /orders/:id)
app.delete('/orders/:id', (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    
    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID',
        message: 'Order ID must be a valid number'
      });
    }

    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return res.status(404).json({
        error: 'Order not found',
        message: `Order with ID ${orderId} does not exist`
      });
    }

    const deletedOrder = orders.splice(orderIndex, 1)[0];
    res.json({
      message: 'Order deleted successfully',
      order: deletedOrder
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

app.get('/', (req, res) => {
  res.send('Order Management API is running. Available endpoints: POST/GET/PUT/DELETE /orders');
});

// Export app and utilities for testing
module.exports = { app, resetData, wsConnections, broadcastOrderUpdate };