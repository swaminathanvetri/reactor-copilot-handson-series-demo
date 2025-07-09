import React, { useState } from 'react';
import './App.css';
import OrderList from './components/OrderList';
import OrderTracking from './components/OrderTracking';

function App() {
  const [currentView, setCurrentView] = useState('list');

  return (
    <div className="App">
      <header className="App-header">
        <h1>Order Management System</h1>
        <nav className="app-navigation">
          <button 
            className={`nav-button ${currentView === 'list' ? 'active' : ''}`}
            onClick={() => setCurrentView('list')}
          >
            Order List
          </button>
          <button 
            className={`nav-button ${currentView === 'tracking' ? 'active' : ''}`}
            onClick={() => setCurrentView('tracking')}
          >
            Order Tracking
          </button>
        </nav>
      </header>
      <main>
        {currentView === 'list' && <OrderList />}
        {currentView === 'tracking' && <OrderTracking />}
      </main>
    </div>
  );
}

export default App;
