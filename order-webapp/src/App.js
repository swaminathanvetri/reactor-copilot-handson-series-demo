import React from 'react';
import './App.css';
import OrderList from './components/OrderList';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Order Management System</h1>
      </header>
      <main>
        <OrderList />
      </main>
    </div>
  );
}

export default App;
