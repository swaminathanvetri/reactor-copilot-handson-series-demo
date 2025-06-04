import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrderList from './OrderList';

// Mock fetch globally
global.fetch = jest.fn();

describe('OrderList Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  const mockOrders = [
    {
      id: 1,
      customerId: 'customer-123',
      items: [
        { name: 'Product A', quantity: 2, price: 25.99 },
        { name: 'Product B', quantity: 1, price: 15.50 }
      ],
      status: 'pending',
      total: 67.48,
      createdAt: '2024-01-01T10:00:00.000Z',
      updatedAt: '2024-01-01T10:00:00.000Z'
    },
    {
      id: 2,
      customerId: 'customer-456',
      items: [
        { name: 'Product C', quantity: 5, price: 6.00 }
      ],
      status: 'processing',
      total: 30.00,
      createdAt: '2024-01-01T11:00:00.000Z',
      updatedAt: '2024-01-01T11:00:00.000Z'
    }
  ];

  test('renders loading state initially', () => {
    fetch.mockImplementation(() => 
      new Promise(() => {}) // Never resolves to keep in loading state
    );

    render(<OrderList />);
    expect(screen.getByText('Loading orders...')).toBeInTheDocument();
  });

  test('renders order list with correct data', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrders,
    });

    render(<OrderList />);

    await waitFor(() => {
      expect(screen.getByText('Order List')).toBeInTheDocument();
    });

    // Check table headers
    expect(screen.getByText('Order Number')).toBeInTheDocument();
    expect(screen.getByText('Customer Number')).toBeInTheDocument();
    expect(screen.getByText('Item Count')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Order Status')).toBeInTheDocument();

    // Check first order data
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('customer-123')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // 2 + 1 items
    expect(screen.getByText('$67.48')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();

    // Check second order data
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('customer-456')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // 5 items
    expect(screen.getByText('$30.00')).toBeInTheDocument();
    expect(screen.getByText('processing')).toBeInTheDocument();
  });

  test('calculates item count correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrders,
    });

    render(<OrderList />);

    await waitFor(() => {
      // First order: 2 + 1 = 3 items
      expect(screen.getByText('3')).toBeInTheDocument();
      // Second order: 5 items
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  test('renders empty state when no orders', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<OrderList />);

    await waitFor(() => {
      expect(screen.getByText('No orders found.')).toBeInTheDocument();
    });
  });

  test('renders error state on fetch failure', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<OrderList />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch orders/)).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  test('renders error state on HTTP error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<OrderList />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch orders/)).toBeInTheDocument();
    });
  });

  test('refresh button refetches orders', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrders,
    });

    render(<OrderList />);

    await waitFor(() => {
      expect(screen.getByText('Order List')).toBeInTheDocument();
    });

    // Clear the initial fetch call
    fetch.mockClear();

    // Mock the refresh call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrders,
    });

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    // Verify fetch was called again
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('retry button refetches orders after error', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<OrderList />);

    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    // Clear the initial fetch call
    fetch.mockClear();

    // Mock the retry call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrders,
    });

    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    // Verify fetch was called again
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('uses correct API endpoint', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<OrderList />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/orders');
    });
  });
});