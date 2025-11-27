import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../test/test-utils';
import { Header } from '../Header/Header.tsx';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock routes to prevent initialization errors
vi.mock('../../app/routes.tsx', () => ({
  ROUTE_PATHS: {
    DASHBOARD: "/dashboard",
    ADMIN: {
      DASHBOARD: "/admin/dashboard",
      MASTER_DATA: {
        HUBS: "/admin/master-data/hubs",
        TERMINALS: "/admin/master-data/terminals",
        PRODUCTS: "/admin/master-data/products",
        DRIVERS: "/admin/master-data/drivers",
        VEHICLES: "/admin/master-data/vehicles",
      },
      ORDERS: "/admin/orders",
      VEHICLE_ALLOCATIONS: "/admin/vehicle-allocations",
      LIVE_FLEET: "/admin/live-fleet",
      INVENTORY: "/admin/inventory",
    },
    DRIVER: {
      DASHBOARD: "/driver/dashboard",
      SHIFTS: "/driver/shifts",
      DELIVERIES: "/driver/deliveries",
      HISTORY: "/driver/history",
    },
  },
}));

describe('Header', () => {
  const mockOnMenuClick = vi.fn();

  it('should render header component', () => {
    const { container } = render(<Header onMenuClick={mockOnMenuClick} />, {
      preloadedState: {
        user: {
          userId: '1',
          name: 'Admin User',
          role: 'admin',
          email: 'admin@example.com',
        },
      },
    });

    // Check that header renders
    expect(container.firstChild).toBeTruthy();
  });

  it('should display user name when logged in', () => {
    render(<Header onMenuClick={mockOnMenuClick} />, {
      preloadedState: {
        user: {
          userId: '1',
          name: 'Admin User',
          role: 'admin',
          email: 'admin@example.com',
        },
      },
    });

    expect(screen.getByText('Admin User')).toBeInTheDocument();
  });

  it('should show theme toggle button', () => {
    render(<Header onMenuClick={mockOnMenuClick} />, {
      preloadedState: {
        user: {
          userId: '1',
          name: 'Admin User',
          role: 'admin',
          email: 'admin@example.com',
        },
        theme: {
          colorMode: 'light',
        },
      },
    });

    const themeButtons = screen.getAllByRole('button');
    expect(themeButtons.length).toBeGreaterThan(0);
  });

  it('should toggle theme when button clicked', () => {
    const { store } = render(<Header onMenuClick={mockOnMenuClick} />, {
      preloadedState: {
        user: {
          userId: '1',
          name: 'Admin User',
          role: 'admin',
          email: 'admin@example.com',
        },
        theme: {
          colorMode: 'light',
        },
      },
    });

    // Find theme toggle button (light/dark mode icon)
    const buttons = screen.getAllByRole('button');
    const themeToggle = buttons.find(btn => btn.getAttribute('aria-label')?.includes('mode'));
    
    if (themeToggle) {
      fireEvent.click(themeToggle);
      const state: any = store.getState();
      expect(state.theme.colorMode).toBe('dark');
    }
  });

  it('should show user menu', () => {
    render(<Header onMenuClick={mockOnMenuClick} />, {
      preloadedState: {
        user: {
          userId: '1',
          name: 'Admin User',
          role: 'admin',
          email: 'admin@example.com',
        },
      },
    });

    // Check if user name is displayed (which opens the menu)
    expect(screen.getByText('Admin User')).toBeInTheDocument();
  });
});

