import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = 'http://localhost:8000/api';
const WS_URL = 'ws://localhost:8000';

function App() {
  const [orders, setOrders] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [newOrder, setNewOrder] = useState({ customerName: '', items: '' });

  // WebSocket connection and message handling
  useEffect(() => {
    const websocket = new WebSocket(WS_URL);
    
    websocket.onopen = () => {
      console.log('Connected to WebSocket');
      setConnectionStatus('Connected');
    };

    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Received message:', message);

        switch (message.type) {
          case 'initial_orders':
            setOrders(message.orders);
            break;
          case 'order_created':
            setOrders(prev => [...prev, message.order]);
            break;
          case 'order_status_updated':
            setOrders(prev => prev.map(order => 
              order.id === message.order.id ? message.order : order
            ));
            break;
          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    websocket.onclose = () => {
      console.log('Disconnected from WebSocket');
      setConnectionStatus('Disconnected');
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('Error');
    };

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, []);

  const createOrder = async (e) => {
    e.preventDefault();
    
    if (!newOrder.customerName.trim() || !newOrder.items.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: newOrder.customerName,
          items: newOrder.items.split(',').map(item => item.trim()).filter(item => item)
        }),
      });

      if (response.ok) {
        setNewOrder({ customerName: '', items: '' });
      } else {
        console.error('Failed to create order');
        alert('Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        console.error('Failed to update order status');
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#fbbf24',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#10b981'
    };
    return colors[status] || '#6b7280';
  };

  const getNextStatus = (currentStatus) => {
    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    return currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : null;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Real-time Order Tracking</h1>
        <div className="connection-status">
          Status: <span style={{ color: connectionStatus === 'Connected' ? '#10b981' : '#ef4444' }}>
            {connectionStatus}
          </span>
        </div>
      </header>

      <main className="main-content">
        <div className="order-form-section">
          <h2>Create New Order</h2>
          <form onSubmit={createOrder} className="order-form">
            <div className="form-group">
              <label>Customer Name:</label>
              <input
                type="text"
                value={newOrder.customerName}
                onChange={(e) => setNewOrder(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Enter customer name"
                required
              />
            </div>
            <div className="form-group">
              <label>Items (comma-separated):</label>
              <input
                type="text"
                value={newOrder.items}
                onChange={(e) => setNewOrder(prev => ({ ...prev, items: e.target.value }))}
                placeholder="e.g., laptop, mouse, keyboard"
                required
              />
            </div>
            <button type="submit" className="create-btn">Create Order</button>
          </form>
        </div>

        <div className="orders-section">
          <h2>Orders ({orders.length})</h2>
          {orders.length === 0 ? (
            <p className="no-orders">No orders yet. Create your first order above!</p>
          ) : (
            <div className="orders-grid">
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <h3>{order.id}</h3>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="order-details">
                    <p><strong>Customer:</strong> {order.customerName}</p>
                    <p><strong>Items:</strong> {order.items.join(', ')}</p>
                    <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                    <p><strong>Updated:</strong> {new Date(order.updatedAt).toLocaleString()}</p>
                  </div>
                  {getNextStatus(order.status) && (
                    <button 
                      onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}
                      className="status-btn"
                    >
                      Move to {getNextStatus(order.status).toUpperCase()}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
