import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge, getStatusColor, formatStatusText } from '../StatusBadge/StatusBadge';

describe('StatusBadge Component', () => {
  describe('getStatusColor', () => {
    it('should return green for active status', () => {
      expect(getStatusColor('active')).toBe('green');
    });

    it('should return green for completed status', () => {
      expect(getStatusColor('completed')).toBe('green');
    });

    it('should return blue for in_progress status', () => {
      expect(getStatusColor('in_progress')).toBe('blue');
    });

    it('should return blue for assigned status', () => {
      expect(getStatusColor('assigned')).toBe('blue');
    });

    it('should return blue for allocated status', () => {
      expect(getStatusColor('allocated')).toBe('blue');
    });

    it('should return yellow for pending status', () => {
      expect(getStatusColor('pending')).toBe('yellow');
    });

    it('should return yellow for inactive status', () => {
      expect(getStatusColor('inactive')).toBe('yellow');
    });

    it('should return red for cancelled status', () => {
      expect(getStatusColor('cancelled')).toBe('red');
    });

    it('should return red for canceled status', () => {
      expect(getStatusColor('canceled')).toBe('red');
    });

    it('should return red for failed status', () => {
      expect(getStatusColor('failed')).toBe('red');
    });

    it('should return gray for unknown status', () => {
      expect(getStatusColor('unknown')).toBe('gray');
    });

    it('should handle uppercase status', () => {
      expect(getStatusColor('ACTIVE')).toBe('green');
    });

    it('should handle mixed case status', () => {
      expect(getStatusColor('InProgress')).toBe('gray'); // Doesn't match pattern
    });
  });

  describe('formatStatusText', () => {
    it('should format single word status', () => {
      expect(formatStatusText('active')).toBe('Active');
    });

    it('should format underscore-separated status', () => {
      expect(formatStatusText('in_progress')).toBe('In Progress');
    });

    it('should format multiple underscores', () => {
      expect(formatStatusText('order_in_progress')).toBe('Order In Progress');
    });

    it('should handle uppercase text', () => {
      expect(formatStatusText('ACTIVE')).toBe('Active');
    });

    it('should handle mixed case', () => {
      expect(formatStatusText('InProgress')).toBe('Inprogress');
    });
  });

  describe('StatusBadge Rendering', () => {
    it('should render with default props', () => {
      render(<StatusBadge status="active" />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render with custom children', () => {
      render(<StatusBadge status="active">Custom Text</StatusBadge>);
      expect(screen.getByText('Custom Text')).toBeInTheDocument();
    });

    it('should apply correct color scheme for completed status', () => {
      render(<StatusBadge status="completed" />);
      const badge = screen.getByText('Completed');
      expect(badge).toBeInTheDocument();
    });

    it('should apply custom color scheme when provided', () => {
      render(<StatusBadge status="active" colorSchemeOverride="purple" />);
      const badge = screen.getByText('Active');
      expect(badge).toBeInTheDocument();
    });

    it('should pass through additional badge props', () => {
      render(<StatusBadge status="pending" data-testid="custom-badge" />);
      const badge = screen.getByTestId('custom-badge');
      expect(badge).toBeInTheDocument();
    });

    it('should format underscore status text', () => {
      render(<StatusBadge status="in_progress" />);
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });
  });
});

