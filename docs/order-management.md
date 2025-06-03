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
- Viewing orders
- Creating new orders
- Updating existing orders
- Deleting orders
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
This will start the React development server and open the application in your default web browser.
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
