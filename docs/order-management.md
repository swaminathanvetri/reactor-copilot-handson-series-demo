# Order management documentation

## Overview
This document provides an overview of the order management system, including its architecture, components, and usage.
## Architecture
The order management system consists of two main components:
- **Client**: A web application built using React.js that allows users to manage orders.
- **Server**: An API built using Express.js that handles order processing, storage, and retrieval.
## Components
### Client
The client is located in the `order-webapp` directory. It is built using React.js and provides a user interface for managing orders. Key features include:
- **Order Listing**: View all orders in a comprehensive table format with the following information:
  - Order Number (ID)
  - Customer Number (ID)
  - Item Count (dynamically calculated from order items)
  - Total amount
  - Order Status (with color-coded status indicators)
- **Refresh Functionality**: Refresh button to fetch the latest order data
- **Responsive Design**: Mobile-friendly interface that adapts to different screen sizes
- **Error Handling**: Graceful handling of API errors with retry functionality
- Creating new orders (future feature)
- Updating existing orders (future feature)
- Deleting orders (future feature)

#### Order Status Display
The order listing page displays orders with color-coded status indicators:
- **Pending**: Yellow background for orders awaiting processing
- **Processing**: Blue background for orders currently being processed
- **Shipped**: Light blue background for orders that have been shipped
- **Delivered**: Green background for successfully delivered orders
- **Cancelled**: Red background for cancelled orders
### Server
The server is located in the `order-service` directory. It is built using Express.js and provides a RESTful API for order management. Key features include:
- Creating orders
- Retrieving orders
- Updating orders
- Deleting orders
## Usage
### Client
To run the client application, navigate to the `order-webapp` directory and use the following commands:
```bash
npm install
npm start
```
This will start the React development server and open the application in your default web browser at `http://localhost:3000`.

#### Environment Configuration
The client application can be configured to connect to a different API server by setting the `REACT_APP_API_BASE_URL` environment variable:
```bash
# Development (default)
REACT_APP_API_BASE_URL=http://localhost:8000

# Production example
REACT_APP_API_BASE_URL=https://your-api-server.com
```

#### Order Listing Page Features
The main order listing page (`/`) provides:
- Real-time order data fetched from the API
- Sortable table with order information
- Item count calculation based on the sum of quantities for all items in each order
- Refresh button to manually update the order list
- Loading states and error handling with user-friendly messages
- Responsive design that works on desktop, tablet, and mobile devices
### Server
To run the server application, navigate to the `order-service` directory and use the following commands:
```bash
npm install
npm start
```
This will start the Express server and make the API available for use.
## API Documentation
For detailed API documentation, refer to the `docs/api.md` file. This documentation includes information on available endpoints, request/response formats, and example usage.
## Testing
To run tests for both the client and server, use the following commands in their respective directories:
### Client
```bash
npm test
```
### Server
```bash
npm test
```
## Contributing
Contributions to the order management system are welcome! Please follow these guidelines:
- Fork the repository and create a new branch for your feature or bug fix.
- Ensure your code adheres to the project's coding standards and best practices.
- Write tests for any new features or changes.
- Submit a pull request with a clear description of your changes and why they are needed.
