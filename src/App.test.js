import { render, screen } from '@testing-library/react';
import App from './App';

// Mock for ResizeObserver
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

test('renders Visualizador 3D de Casa', () => {
  render(<App />);
  const navbarText = screen.getByText(/Visualizador 3D de Casa/i); // Match the actual text
  expect(navbarText).toBeInTheDocument();
});
