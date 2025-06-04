import React, { useState, useEffect } from 'react';
import './OrderList.css';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/orders`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(`Failed to fetch orders: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchOrdersOnMount = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/orders`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(`Failed to fetch orders: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersOnMount();
  }, [API_BASE_URL]);

  const calculateItemCount = (items) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const handleRefresh = () => {
    fetchOrders();
  };

  if (loading) {
    return <div className="order-list-loading">Loading orders...</div>;
  }

  if (error) {
    return (
      <div className="order-list-error">
        <p>{error}</p>
        <button onClick={handleRefresh} className="refresh-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="order-list-container">
      <div className="order-list-header">
        <h2>Order List</h2>
        <button onClick={handleRefresh} className="refresh-button">
          Refresh
        </button>
      </div>
      
      {orders.length === 0 ? (
        <div className="no-orders">No orders found.</div>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Customer Number</th>
              <th>Item Count</th>
              <th>Total</th>
              <th>Order Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customerId}</td>
                <td>{calculateItemCount(order.items)}</td>
                <td>${order.total.toFixed(2)}</td>
                <td className={`status-${order.status}`}>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderList;