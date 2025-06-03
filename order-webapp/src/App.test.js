import { render, screen } from '@testing-library/react';
import App from './App';

test('renders order tracking app', () => {
  render(<App />);
  const titleElement = screen.getByText(/Real-time Order Tracking/i);
  expect(titleElement).toBeInTheDocument();
  
  const createOrderSection = screen.getByText(/Create New Order/i);
  expect(createOrderSection).toBeInTheDocument();
});
