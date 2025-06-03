import { render, screen } from '@testing-library/react';
import App from './App';

test('renders track your order link', () => {
  render(<App />);
  const linkElement = screen.getByText(/Track Your Order/i);
  expect(linkElement).toBeInTheDocument();
});
