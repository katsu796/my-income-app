import { render, screen } from '@testing-library/react';
import App from './App';

test('renders page title', () => {
  render(<App />);
  const headingElement = screen.getByText('バイト収支カレンダー');
  expect(headingElement).toBeInTheDocument();
});
