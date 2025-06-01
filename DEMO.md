# Real-time Order Tracking Demo

This demonstrates the WebSocket-based real-time order status tracking system.

## Features Implemented

✅ **Order Management REST API**
- Create new orders with customer name and items
- Update order status (pending → processing → shipped → delivered)
- Retrieve all orders or specific order by ID

✅ **Real-time WebSocket Updates**
- Broadcasts order creation to all connected clients
- Broadcasts status updates to all connected clients
- Maintains connection status and handles reconnection

✅ **React Frontend**
- Order creation form
- Real-time order display with status badges
- WebSocket connection status indicator
- Status progression buttons
- Responsive grid layout

## Quick Start

### 1. Start the Backend Server
```bash
cd order-service
npm install
npm start
```
Server runs on `http://localhost:8000`

### 2. Start the Frontend (in a new terminal)
```bash
cd order-webapp
npm install
npm start
```
React app runs on `http://localhost:3000`

### 3. Test the API directly
```bash
# Create an order
curl -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName": "John Doe", "items": ["laptop", "mouse"]}'

# Update order status
curl -X PUT http://localhost:8000/api/orders/[ORDER_ID]/status \
  -H "Content-Type: application/json" \
  -d '{"status": "processing"}'

# Get all orders
curl http://localhost:8000/api/orders
```

### 4. Test WebSocket Connection
```bash
cd order-service
node ws-client.js
```

## Architecture

```
┌─────────────────┐     WebSocket     ┌─────────────────┐
│                 │ ◄────────────────► │                 │
│  React Frontend │                   │  Express Server │
│  (Port 3000)    │     REST API      │  (Port 8000)    │
│                 │ ◄────────────────► │                 │
└─────────────────┘                   └─────────────────┘
                                              │
                                              ▼
                                      ┌─────────────────┐
                                      │   In-Memory     │
                                      │   Order Store   │
                                      └─────────────────┘
```

## Order Status Flow

```
pending → processing → shipped → delivered
```

## Real-time Updates

When any client:
- Creates a new order → All clients see the new order instantly
- Updates order status → All clients see the status change instantly
- Connects → Receives current list of all orders
```

The system demonstrates real-time collaboration where multiple users can track orders simultaneously with live updates.