const request = require('supertest');
const { app, resetData } = require('../app');

describe('Order Management API', () => {
  beforeEach(() => {
    resetData();
  });

  describe('GET /', () => {
    it('should return the API welcome message', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Order Management API is running. Available endpoints: POST/GET/PUT/DELETE /orders');
    });
  });

  describe('POST /orders', () => {
    it('should create a new order with valid data', async () => {
      const orderData = {
        customerId: 'customer-123',
        items: [
          { name: 'Product A', quantity: 2, price: 25.99 },
          { name: 'Product B', quantity: 1, price: 15.50 }
        ],
        status: 'pending'
      };

      const response = await request(app)
        .post('/orders')
        .send(orderData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: 1,
        customerId: 'customer-123',
        items: orderData.items,
        status: 'pending',
        total: 67.48
      });
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should create an order with default status when not provided', async () => {
      const orderData = {
        customerId: 'customer-123',
        items: [{ name: 'Product A', quantity: 1, price: 10.00 }]
      };

      const response = await request(app)
        .post('/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.status).toBe('pending');
    });

    it('should return 400 for missing customerId', async () => {
      const orderData = {
        items: [{ name: 'Product A', quantity: 1, price: 10.00 }]
      };

      const response = await request(app)
        .post('/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('customerId is required and must be a string');
    });

    it('should return 400 for empty items array', async () => {
      const orderData = {
        customerId: 'customer-123',
        items: []
      };

      const response = await request(app)
        .post('/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('items is required and must be a non-empty array');
    });

    it('should return 400 for invalid item data', async () => {
      const orderData = {
        customerId: 'customer-123',
        items: [
          { name: '', quantity: -1, price: 0 }
        ]
      };

      const response = await request(app)
        .post('/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('items[0].name is required and must be a string');
      expect(response.body.details).toContain('items[0].quantity is required and must be a positive number');
      expect(response.body.details).toContain('items[0].price is required and must be a positive number');
    });

    it('should return 400 for invalid status', async () => {
      const orderData = {
        customerId: 'customer-123',
        items: [{ name: 'Product A', quantity: 1, price: 10.00 }],
        status: 'invalid-status'
      };

      const response = await request(app)
        .post('/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('status must be one of: pending, processing, shipped, delivered, cancelled');
    });
  });

  describe('GET /orders', () => {
    it('should return empty array when no orders exist', async () => {
      const response = await request(app).get('/orders').expect(200);
      expect(response.body).toEqual([]);
    });

    it('should return all orders', async () => {
      // Create test orders
      await request(app)
        .post('/orders')
        .send({
          customerId: 'customer-1',
          items: [{ name: 'Product A', quantity: 1, price: 10.00 }]
        });

      await request(app)
        .post('/orders')
        .send({
          customerId: 'customer-2',
          items: [{ name: 'Product B', quantity: 2, price: 15.00 }]
        });

      const response = await request(app).get('/orders').expect(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].customerId).toBe('customer-1');
      expect(response.body[1].customerId).toBe('customer-2');
    });
  });

  describe('GET /orders/:id', () => {
    it('should return order by ID', async () => {
      const orderData = {
        customerId: 'customer-123',
        items: [{ name: 'Product A', quantity: 1, price: 10.00 }]
      };

      const createResponse = await request(app)
        .post('/orders')
        .send(orderData);

      const response = await request(app)
        .get(`/orders/${createResponse.body.id}`)
        .expect(200);

      expect(response.body).toMatchObject(createResponse.body);
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/orders/999')
        .expect(404);

      expect(response.body.error).toBe('Order not found');
      expect(response.body.message).toBe('Order with ID 999 does not exist');
    });

    it('should return 400 for invalid order ID', async () => {
      const response = await request(app)
        .get('/orders/invalid-id')
        .expect(400);

      expect(response.body.error).toBe('Invalid order ID');
      expect(response.body.message).toBe('Order ID must be a valid number');
    });
  });

  describe('PUT /orders/:id', () => {
    let orderId;

    beforeEach(async () => {
      const orderData = {
        customerId: 'customer-123',
        items: [{ name: 'Product A', quantity: 1, price: 10.00 }]
      };

      const response = await request(app)
        .post('/orders')
        .send(orderData);

      orderId = response.body.id;
    });

    it('should update an existing order', async () => {
      const updateData = {
        customerId: 'customer-456',
        items: [{ name: 'Product B', quantity: 2, price: 20.00 }],
        status: 'processing'
      };

      const response = await request(app)
        .put(`/orders/${orderId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.customerId).toBe('customer-456');
      expect(response.body.items).toEqual(updateData.items);
      expect(response.body.status).toBe('processing');
      expect(response.body.total).toBe(40.00);
      expect(response.body.updatedAt).not.toBe(response.body.createdAt);
    });

    it('should return 404 for non-existent order', async () => {
      const updateData = {
        customerId: 'customer-456',
        items: [{ name: 'Product B', quantity: 1, price: 20.00 }]
      };

      const response = await request(app)
        .put('/orders/999')
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBe('Order not found');
    });

    it('should return 400 for invalid update data', async () => {
      const updateData = {
        customerId: '',
        items: []
      };

      const response = await request(app)
        .put(`/orders/${orderId}`)
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 400 for invalid order ID', async () => {
      const updateData = {
        customerId: 'customer-456',
        items: [{ name: 'Product B', quantity: 1, price: 20.00 }]
      };

      const response = await request(app)
        .put('/orders/invalid-id')
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBe('Invalid order ID');
    });
  });

  describe('DELETE /orders/:id', () => {
    let orderId;

    beforeEach(async () => {
      const orderData = {
        customerId: 'customer-123',
        items: [{ name: 'Product A', quantity: 1, price: 10.00 }]
      };

      const response = await request(app)
        .post('/orders')
        .send(orderData);

      orderId = response.body.id;
    });

    it('should delete an existing order', async () => {
      const response = await request(app)
        .delete(`/orders/${orderId}`)
        .expect(200);

      expect(response.body.message).toBe('Order deleted successfully');
      expect(response.body.order.id).toBe(orderId);

      // Verify order is deleted
      await request(app)
        .get(`/orders/${orderId}`)
        .expect(404);
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .delete('/orders/999')
        .expect(404);

      expect(response.body.error).toBe('Order not found');
    });

    it('should return 400 for invalid order ID', async () => {
      const response = await request(app)
        .delete('/orders/invalid-id')
        .expect(400);

      expect(response.body.error).toBe('Invalid order ID');
    });
  });
});