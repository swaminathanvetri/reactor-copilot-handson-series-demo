import React, { useState, useEffect } from 'react';
import './OrderTracking.css';

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ws, setWs] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
  const WS_BASE_URL = process.env.REACT_APP_WS_BASE_URL || 'ws://localhost:8000';

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/orders`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // Sort orders by most recent update first
      const sortedOrders = data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setOrders(sortedOrders);
    } catch (err) {
      setError(`Failed to fetch orders: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Establish WebSocket connection
    const websocket = new WebSocket(WS_BASE_URL);
    
    websocket.onopen = () => {
      console.log('WebSocket connected');
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'orderUpdate') {
          // Update the orders list with the new order data
          setOrders(prevOrders => {
            const updatedOrders = prevOrders.map(order => 
              order.id === message.order.id ? message.order : order
            );
            
            // If it's a new order, add it to the list
            if (!prevOrders.find(order => order.id === message.order.id)) {
              updatedOrders.push(message.order);
            }
            
            // Sort by most recent update first
            return updatedOrders.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          });
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('WebSocket connection error');
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      setWs(null);
    };

    // Cleanup on component unmount
    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, [API_BASE_URL, WS_BASE_URL]);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getStatusIndex = (status) => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered'];
    return statuses.indexOf(status.toLowerCase());
  };

  const renderOrderTimeline = (order) => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered'];
    const currentStatusIndex = getStatusIndex(order.status);
    
    return (
      <div className="order-timeline">
        {statuses.map((status, index) => {
          const isCompleted = index <= currentStatusIndex;
          const statusEntry = order.statusHistory?.find(entry => entry.status.toLowerCase() === status);
          
          return (
            <div key={status} className={`timeline-step ${isCompleted ? 'completed' : ''}`}>
              <div className="timeline-circle">
                {isCompleted && <span className="checkmark">✓</span>}
              </div>
              <div className="timeline-content">
                <div className="status-label">{status.charAt(0).toUpperCase() + status.slice(1)}</div>
                {statusEntry && (
                  <div className="status-timestamp">
                    {formatTimestamp(statusEntry.timestamp)}
                  </div>
                )}
              </div>
              {index < statuses.length - 1 && <div className="timeline-connector"></div>}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return <div className="order-tracking-loading">Loading order tracking...</div>;
  }

  if (error) {
    return (
      <div className="order-tracking-error">
        <p>{error}</p>
        <button onClick={fetchOrders} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="order-tracking-container">
      <div className="order-tracking-header">
        <h2>Track Order</h2>
        <div className="connection-status">
          WebSocket: {ws ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </div>
      
      {orders.length === 0 ? (
        <div className="no-orders">No orders to track.</div>
      ) : (
        <div className="orders-tracking-list">
          {orders.map((order) => (
            <div key={order.id} className="order-tracking-item">
              <div className="order-header">
                <h3>Order Number: {order.id}</h3>
                <div className="order-meta">
                  <span>Customer: {order.customerId}</span>
                  <span>Total: ${order.total.toFixed(2)}</span>
                </div>
              </div>
              {renderOrderTimeline(order)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderTracking;