import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import OrderTracking from './OrderTracking';
import './App.css';

function Home() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Order Management System</h1>
        <p>Welcome to the Order Management System</p>
        <div className="navigation">
          <Link to="/track" className="nav-link">Track Your Order</Link>
        </div>
      </header>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/track" element={<OrderTracking />} />
      </Routes>
    </Router>
  );
}

export default App;
