import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatPhoneNumber,
  formatDistance,
  formatDuration,
  formatRegistrationNumber,
} from '../formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1000)).toContain('1,000');
      expect(formatCurrency(1500.5)).toContain('1,500.5');
    });

    it('should handle zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0');
    });

    it('should handle negative numbers', () => {
      const result = formatCurrency(-500);
      expect(result).toContain('500');
    });

    it('should use default currency', () => {
      const result = formatCurrency(1000);
      expect(result).toContain('₹');
    });
  });

  describe('formatDate', () => {
    it('should format date without time', () => {
      const date = new Date('2024-01-15T10:30:00');
      const result = formatDate(date);
      expect(result).toContain('Jan');
      expect(result).toContain('2024');
    });

    it('should format date with time', () => {
      const date = new Date('2024-01-15T10:30:00');
      const result = formatDate(date, true);
      expect(result).toContain('Jan');
      expect(result).toContain('10:30');
    });

    it('should handle string dates', () => {
      const result = formatDate('2024-01-15');
      expect(result).toContain('Jan');
    });

    it('should handle invalid dates', () => {
      const result = formatDate('invalid');
      expect(result).toBe('Invalid Date');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format 10-digit phone number', () => {
      expect(formatPhoneNumber('9876543210')).toBe('98765 43210');
    });

    it('should handle already formatted numbers', () => {
      expect(formatPhoneNumber('98765 43210')).toBe('98765 43210');
    });

    it('should return original for non-10-digit numbers', () => {
      expect(formatPhoneNumber('123')).toBe('123');
    });

    it('should remove non-numeric characters for 10-digit numbers', () => {
      expect(formatPhoneNumber('987-654-3210')).toBe('98765 43210');
    });
  });

  describe('formatDistance', () => {
    it('should format meters correctly', () => {
      expect(formatDistance(500)).toBe('500m');
      expect(formatDistance(999)).toBe('999m');
    });

    it('should format kilometers correctly', () => {
      expect(formatDistance(1000)).toBe('1.0km');
      expect(formatDistance(1500)).toBe('1.5km');
      expect(formatDistance(10000)).toBe('10.0km');
    });

    it('should handle zero', () => {
      expect(formatDistance(0)).toBe('0m');
    });

    it('should round meters', () => {
      expect(formatDistance(500.7)).toBe('501m');
    });
  });

  describe('formatDuration', () => {
    it('should format seconds', () => {
      expect(formatDuration(30)).toBe('30s');
      expect(formatDuration(59)).toBe('59s');
    });

    it('should format minutes', () => {
      expect(formatDuration(60)).toBe('1m');
      expect(formatDuration(120)).toBe('2m');
      expect(formatDuration(3540)).toBe('59m');
    });

    it('should format hours', () => {
      expect(formatDuration(3600)).toBe('1h');
      expect(formatDuration(7200)).toBe('2h');
    });

    it('should format hours with minutes', () => {
      expect(formatDuration(3660)).toBe('1h 1m');
      expect(formatDuration(5400)).toBe('1h 30m');
    });

    it('should handle zero', () => {
      expect(formatDuration(0)).toBe('0s');
    });
  });

  describe('formatRegistrationNumber', () => {
    it('should uppercase registration number', () => {
      expect(formatRegistrationNumber('tn01ab1234')).toBe('TN01AB1234');
    });

    it('should remove spaces', () => {
      expect(formatRegistrationNumber('TN 01 AB 1234')).toBe('TN01AB1234');
    });

    it('should handle already formatted numbers', () => {
      expect(formatRegistrationNumber('TN01AB1234')).toBe('TN01AB1234');
    });
  });
});

