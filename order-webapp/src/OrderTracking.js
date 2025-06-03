import React, { useState, useEffect } from 'react';
import './OrderTracking.css';

const OrderTracking = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ws, setWs] = useState(null);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:8000');
    
    websocket.onopen = () => {
      console.log('Connected to WebSocket');
      websocket.send(JSON.stringify({ type: 'subscribe' }));
    };
    
    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'orderUpdate' && orderData && data.data.id === orderData.id) {
          setOrderData(data.data);
        }
      } catch (e) {
        console.log('Received message:', event.data);
      }
    };
    
    websocket.onclose = () => {
      console.log('WebSocket connection closed');
    };
    
    setWs(websocket);
    
    return () => {
      websocket.close();
    };
  }, [orderData]);

  const trackOrder = async () => {
    if (!orderNumber.trim()) {
      setError('Please enter an order number');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:8000/orders/${orderNumber}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Order not found');
        }
        throw new Error('Failed to fetch order');
      }
      
      const data = await response.json();
      setOrderData(data);
    } catch (err) {
      setError(err.message);
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = () => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    const currentStatusIndex = orderData ? steps.indexOf(orderData.status) : -1;
    
    return steps.map((step, index) => ({
      name: step.charAt(0).toUpperCase() + step.slice(1),
      completed: index <= currentStatusIndex,
      timestamp: orderData?.statusHistory?.[step] || null
    }));
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="order-tracking">
      <h1>Track Order</h1>
      
      <div className="tracking-input">
        <div className="input-group">
          <label htmlFor="orderNumber">Order number</label>
          <input
            id="orderNumber"
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Enter your order number"
            onKeyPress={(e) => e.key === 'Enter' && trackOrder()}
          />
          <button 
            onClick={trackOrder} 
            disabled={loading}
            className="track-button"
          >
            {loading ? 'Loading...' : 'Track'}
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
      </div>

      {orderData && (
        <div className="order-status">
          <div className="status-timeline">
            {getStatusSteps().map((step, index) => (
              <div key={step.name} className="status-step">
                <div className={`step-indicator ${step.completed ? 'completed' : ''}`}>
                  <div className="step-circle">
                    {step.completed && <span className="checkmark">✓</span>}
                  </div>
                  {index < getStatusSteps().length - 1 && (
                    <div className={`step-line ${step.completed ? 'completed' : ''}`}></div>
                  )}
                </div>
                <div className="step-content">
                  <div className="step-title">{step.name}</div>
                  <div className="step-timestamp">
                    {step.timestamp ? formatTimestamp(step.timestamp) : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;