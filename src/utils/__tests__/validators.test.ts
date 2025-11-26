import { describe, it, expect } from 'vitest';
import {
  isValidPhoneNumber,
  isValidEmail,
  isValidRegistrationNumber,
  isValidLicenseNumber,
  isValidCoordinates,
  isFutureDate,
  isPastDate,
} from '../validators';

describe('validators', () => {
  describe('isValidPhoneNumber', () => {
    it('should validate correct phone numbers', () => {
      expect(isValidPhoneNumber('9876543210')).toBe(true);
      expect(isValidPhoneNumber('8123456789')).toBe(true);
      expect(isValidPhoneNumber('7000000000')).toBe(true);
      expect(isValidPhoneNumber('6999999999')).toBe(true);
    });

    it('should accept formatted phone numbers', () => {
      expect(isValidPhoneNumber('98765 43210')).toBe(true);
      expect(isValidPhoneNumber('987-654-3210')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhoneNumber('1234567890')).toBe(false); // Starts with 1
      expect(isValidPhoneNumber('5876543210')).toBe(false); // Starts with 5
      expect(isValidPhoneNumber('987654321')).toBe(false); // Too short
      expect(isValidPhoneNumber('98765432100')).toBe(false); // Too long
      expect(isValidPhoneNumber('abcdefghij')).toBe(false); // Letters
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.in')).toBe(true);
      expect(isValidEmail('test+tag@example.org')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test@domain')).toBe(false);
      expect(isValidEmail('test @example.com')).toBe(false);
    });
  });

  describe('isValidRegistrationNumber', () => {
    it('should validate correct registration numbers', () => {
      expect(isValidRegistrationNumber('TN01AB1234')).toBe(true);
      expect(isValidRegistrationNumber('MH12XY5678')).toBe(true);
      expect(isValidRegistrationNumber('KA03MN9999')).toBe(true);
    });

    it('should accept formatted registration numbers', () => {
      expect(isValidRegistrationNumber('TN 01 AB 1234')).toBe(true);
    });

    it('should accept lowercase', () => {
      expect(isValidRegistrationNumber('tn01ab1234')).toBe(true);
    });

    it('should reject invalid registration numbers', () => {
      expect(isValidRegistrationNumber('T01AB1234')).toBe(false); // Single state code
      expect(isValidRegistrationNumber('TN1AB1234')).toBe(false); // Single digit RTO
      expect(isValidRegistrationNumber('TN01A1234')).toBe(false); // Single letter series
      expect(isValidRegistrationNumber('TN01AB123')).toBe(false); // Short number
      expect(isValidRegistrationNumber('TN01ABC1234')).toBe(false); // Three letters
    });
  });

  describe('isValidLicenseNumber', () => {
    it('should validate correct license numbers', () => {
      expect(isValidLicenseNumber('TN0120230001234')).toBe(true);
      expect(isValidLicenseNumber('MH1220200005678')).toBe(true);
    });

    it('should accept formatted license numbers', () => {
      expect(isValidLicenseNumber('TN 01 2023 0001234')).toBe(true);
    });

    it('should accept lowercase', () => {
      expect(isValidLicenseNumber('tn0120230001234')).toBe(true);
    });

    it('should reject invalid license numbers', () => {
      expect(isValidLicenseNumber('T0120230001234')).toBe(false); // Single state code
      expect(isValidLicenseNumber('TN120230001234')).toBe(false); // Short
      expect(isValidLicenseNumber('TN01202300012345')).toBe(false); // Long
      expect(isValidLicenseNumber('TN01ABCD0001234')).toBe(false); // Letters in number
    });
  });

  describe('isValidCoordinates', () => {
    it('should validate correct coordinates', () => {
      expect(isValidCoordinates(13.0827, 80.2707)).toBe(true);
      expect(isValidCoordinates(0, 0)).toBe(true);
      expect(isValidCoordinates(90, 180)).toBe(true);
      expect(isValidCoordinates(-90, -180)).toBe(true);
    });

    it('should reject invalid coordinates', () => {
      expect(isValidCoordinates(91, 80)).toBe(false); // Lat > 90
      expect(isValidCoordinates(-91, 80)).toBe(false); // Lat < -90
      expect(isValidCoordinates(13, 181)).toBe(false); // Lng > 180
      expect(isValidCoordinates(13, -181)).toBe(false); // Lng < -180
    });
  });

  describe('isFutureDate', () => {
    it('should identify future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(isFutureDate(futureDate)).toBe(true);
    });

    it('should identify past dates as not future', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isFutureDate(pastDate)).toBe(false);
    });

    it('should handle string dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(isFutureDate(futureDate.toISOString())).toBe(true);
    });
  });

  describe('isPastDate', () => {
    it('should identify past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isPastDate(pastDate)).toBe(true);
    });

    it('should identify future dates as not past', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(isPastDate(futureDate)).toBe(false);
    });

    it('should handle string dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isPastDate(pastDate.toISOString())).toBe(true);
    });
  });
});

