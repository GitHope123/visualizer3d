import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock for ResizeObserver
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock for localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key) => {
      delete store[key];
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock for PanelInfo component
jest.mock('./components/PanelInfo', () => ({
  __esModule: true,
  default: ({
    selectedPart,
    partPosition,
    registeredParts,
    showGrid,
    setShowGrid,
    viewMode,
    setViewMode,
    controlsRef,
    setShowRegisterModal,
    removeRegisteredPart,
    fitViewToSelection,
    resetView,
    labelSettings,
    setLabelSettings,
  }) => (
    <div data-testid="mock-panel-info">
      Mock PanelInfo - Selected: {selectedPart || 'None'}
      {registeredParts.length > 0 &&
        registeredParts.map((part, index) => <div key={index} data-testid={`registered-part-${part.id}`}>Registered Part: {part.customName}</div>)}
    </div>
  ),
}));

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  test('renders Visualizador 3D de Casa', () => {
    render(<App />);
    const navbarText = screen.getByText(/3D House Visualizer/i);
    expect(navbarText).toBeInTheDocument();
  });
  test('initial state', () => {
    render(<App />);
    expect(screen.getByText(/Registered: 0/i)).toBeInTheDocument();
    expect(screen.getByText(/Selection \(0\)/i)).toBeInTheDocument();
    expect(screen.queryByTestId('mock-panel-info')).toBeInTheDocument();
    expect(screen.queryByText(/Mock PanelInfo - Selected: None/i)).toBeInTheDocument();
  });

  test('part selection and deselection', async () => {
    render(<App />);
    const mockPartName = 'Test Part';
    const mockPosition = [1, 2, 3];
    // Simulate part selection
    fireEvent(
      window,
      new CustomEvent('part-selected', {
        detail: { partName: mockPartName, position: mockPosition },
      })
    );
    await waitFor(() => {
      expect(screen.getByText(/Selection \(1\)/i)).toBeInTheDocument();
      expect(screen.getByText(`Mock PanelInfo - Selected: ${mockPartName}`)).toBeInTheDocument();
    });
    // Simulate part deselection
    fireEvent(
      window,
      new CustomEvent('part-selected', {
        detail: { partName: mockPartName, position: mockPosition },
      })
    );
    await waitFor(() => {
      expect(screen.getByText(/Selection \(0\)/i)).toBeInTheDocument();
    });
  });
  test('resetting selection', async () => {
    render(<App />);
    const mockPartName = 'Test Part';
    const mockPosition = [1, 2, 3];
    fireEvent(
      window,
      new CustomEvent('part-selected', {
        detail: { partName: mockPartName, position: mockPosition },
      })
    );
    await waitFor(() => {
      expect(screen.getByText(/Selection \(1\)/i)).toBeInTheDocument();
    });
    fireEvent(window, new CustomEvent('reset-selection'));
    await waitFor(() => {
      expect(screen.getByText(/Selection \(0\)/i)).toBeInTheDocument();
    });
  });

  test('displaying and closing the register part modal', async () => {
    render(<App />);
    const mockPartName = 'Test Part';
    const mockPosition = [1, 2, 3];
    fireEvent(
      window,
      new CustomEvent('part-selected', {
        detail: { partName: mockPartName, position: mockPosition },
      })
    );
    await waitFor(() => {
      expect(screen.getByText(/Selection \(1\)/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Selection/i));
    await waitFor(() => {
      expect(screen.getByText(/Selected Parts \(1\)/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Close/i));

    // Simulate the click to open the register modal.
    fireEvent.click(screen.getByText(/Selection/i))
    await waitFor(() => {
      expect(screen.getByText(/Selected Parts \(1\)/i)).toBeInTheDocument();
    });
    
    userEvent.type(screen.getByPlaceholderText(/Enter custom name/i), 'New Part');
    fireEvent.click(screen.getByText(/Register Part/i));
    await waitFor(() => {
      expect(screen.getByText(/Registered: 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Registered Part: New Part/i)).toBeInTheDocument();
    });

  });
});
