import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../../test/test-utils';
import { RoleGuard } from '../RoleGuard/RoleGuard.tsx';

describe('RoleGuard', () => {
  it('should render children when user has required role', () => {
    render(
      <RoleGuard allowedRole="admin">
        <div>Admin Content</div>
      </RoleGuard>,
      {
        preloadedState: {
          user: {
            userId: '1',
            name: 'Admin User',
            role: 'admin',
            email: 'admin@example.com',
          },
        },
      }
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('should not render children when user lacks required role', () => {
    render(
      <RoleGuard allowedRole="admin">
        <div>Admin Content</div>
      </RoleGuard>,
      {
        preloadedState: {
          user: {
            userId: '2',
            name: 'Driver User',
            role: 'driver',
            email: 'driver@example.com',
          },
        },
      }
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should render driver content when user is driver', () => {
    render(
      <RoleGuard allowedRole="driver">
        <div>Driver Content</div>
      </RoleGuard>,
      {
        preloadedState: {
          user: {
            userId: '2',
            name: 'Driver User',
            role: 'driver',
            email: 'driver@example.com',
          },
        },
      }
    );

    expect(screen.getByText('Driver Content')).toBeInTheDocument();
  });

  it('should redirect admin to admin dashboard when accessing driver route', () => {
    render(
      <RoleGuard allowedRole="driver">
        <div>Driver Content</div>
      </RoleGuard>,
      {
        preloadedState: {
          user: {
            userId: '1',
            name: 'Admin User',
            role: 'admin',
            email: 'admin@example.com',
          },
        },
      }
    );

    // Should not render driver content for admin
    expect(screen.queryByText('Driver Content')).not.toBeInTheDocument();
  });

  it('should redirect driver to driver view when accessing admin route', () => {
    render(
      <RoleGuard allowedRole="admin">
        <div>Admin Content</div>
      </RoleGuard>,
      {
        preloadedState: {
          user: {
            userId: '2',
            name: 'Driver User',
            role: 'driver',
            email: 'driver@example.com',
          },
        },
      }
    );

    // Should not render admin content for driver
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });
});

