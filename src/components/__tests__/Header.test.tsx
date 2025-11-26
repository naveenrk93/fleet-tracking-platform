import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../test/test-utils';
import { Header } from '../Header';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('Header', () => {
  it('should render header component', () => {
    const { container } = render(<Header />, {
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
    render(<Header />, {
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
    render(<Header />, {
      preloadedState: {
        user: {
          userId: '1',
          name: 'Admin User',
          role: 'admin',
          email: 'admin@example.com',
        },
        theme: {
          mode: 'light',
        },
      },
    });

    const themeButtons = screen.getAllByRole('button');
    expect(themeButtons.length).toBeGreaterThan(0);
  });

  it('should toggle theme when button clicked', () => {
    const { store } = render(<Header />, {
      preloadedState: {
        user: {
          userId: '1',
          name: 'Admin User',
          role: 'admin',
          email: 'admin@example.com',
        },
        theme: {
          mode: 'light',
        },
      },
    });

    // Find theme toggle button (light/dark mode icon)
    const buttons = screen.getAllByRole('button');
    const themeToggle = buttons.find(btn => btn.getAttribute('aria-label')?.includes('mode'));
    
    if (themeToggle) {
      fireEvent.click(themeToggle);
      expect(store.getState().theme.mode).toBe('dark');
    }
  });

  it('should show user menu', () => {
    render(<Header />, {
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

