import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Order Management System header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Order Management System/i);
  expect(headerElement).toBeInTheDocument();
});
