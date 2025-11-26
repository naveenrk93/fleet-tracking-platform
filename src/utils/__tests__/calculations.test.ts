import { describe, it, expect } from 'vitest';
import {
  calculateDistance,
  calculateETA,
  calculateOrderTotal,
  calculateUtilization,
  calculatePercentageChange,
  calculateAverage,
} from '../calculations';

describe('calculations', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
      // Chennai to Bangalore approximate distance
      const distance = calculateDistance(13.0827, 80.2707, 12.9716, 77.5946);
      expect(distance).toBeGreaterThan(280000); // ~290km
      expect(distance).toBeLessThan(300000);
    });

    it('should return zero for same coordinates', () => {
      const distance = calculateDistance(13.0827, 80.2707, 13.0827, 80.2707);
      expect(distance).toBe(0);
    });

    it('should calculate short distances', () => {
      // Approximately 1km apart
      const distance = calculateDistance(13.0827, 80.2707, 13.0917, 80.2707);
      expect(distance).toBeGreaterThan(900);
      expect(distance).toBeLessThan(1100);
    });
  });

  describe('calculateETA', () => {
    it('should calculate ETA based on distance and default speed', () => {
      const distance = 10000; // 10km
      const eta = calculateETA(distance);
      const now = new Date();
      const diff = eta.getTime() - now.getTime();
      
      // At 40km/h, 10km takes 15 minutes (900000ms)
      expect(diff).toBeGreaterThan(800000);
      expect(diff).toBeLessThan(1000000);
    });

    it('should calculate ETA with custom speed', () => {
      const distance = 10000; // 10km
      const eta = calculateETA(distance, 60); // 60 km/h
      const now = new Date();
      const diff = eta.getTime() - now.getTime();
      
      // At 60km/h, 10km takes 10 minutes (600000ms)
      expect(diff).toBeGreaterThan(500000);
      expect(diff).toBeLessThan(700000);
    });

    it('should handle zero distance', () => {
      const eta = calculateETA(0);
      const now = new Date();
      const diff = eta.getTime() - now.getTime();
      expect(diff).toBeLessThan(1000); // Should be almost immediate
    });
  });

  describe('calculateOrderTotal', () => {
    it('should calculate total for multiple items', () => {
      const items = [
        { quantity: 2, price: 100 },
        { quantity: 3, price: 50 },
        { quantity: 1, price: 200 },
      ];
      expect(calculateOrderTotal(items)).toBe(550);
    });

    it('should handle empty array', () => {
      expect(calculateOrderTotal([])).toBe(0);
    });

    it('should handle single item', () => {
      const items = [{ quantity: 5, price: 100 }];
      expect(calculateOrderTotal(items)).toBe(500);
    });

    it('should handle decimal prices', () => {
      const items = [
        { quantity: 2, price: 99.99 },
        { quantity: 1, price: 50.50 },
      ];
      expect(calculateOrderTotal(items)).toBeCloseTo(250.48);
    });
  });

  describe('calculateUtilization', () => {
    it('should calculate utilization percentage', () => {
      expect(calculateUtilization(50, 100)).toBe(50);
      expect(calculateUtilization(75, 100)).toBe(75);
      expect(calculateUtilization(100, 100)).toBe(100);
    });

    it('should cap at 100%', () => {
      expect(calculateUtilization(150, 100)).toBe(100);
    });

    it('should handle zero capacity', () => {
      expect(calculateUtilization(50, 0)).toBe(0);
    });

    it('should handle zero usage', () => {
      expect(calculateUtilization(0, 100)).toBe(0);
    });

    it('should round to nearest integer', () => {
      expect(calculateUtilization(33, 100)).toBe(33);
      expect(calculateUtilization(66, 100)).toBe(66);
    });
  });

  describe('calculatePercentageChange', () => {
    it('should calculate positive change', () => {
      expect(calculatePercentageChange(150, 100)).toBe(50);
      expect(calculatePercentageChange(200, 100)).toBe(100);
    });

    it('should calculate negative change', () => {
      expect(calculatePercentageChange(50, 100)).toBe(-50);
      expect(calculatePercentageChange(25, 100)).toBe(-75);
    });

    it('should handle zero previous value', () => {
      expect(calculatePercentageChange(100, 0)).toBe(100);
      expect(calculatePercentageChange(0, 0)).toBe(0);
    });

    it('should handle same values', () => {
      expect(calculatePercentageChange(100, 100)).toBe(0);
    });
  });

  describe('calculateAverage', () => {
    it('should calculate average of numbers', () => {
      expect(calculateAverage([10, 20, 30])).toBe(20);
      expect(calculateAverage([5, 10, 15, 20])).toBe(12.5);
    });

    it('should handle empty array', () => {
      expect(calculateAverage([])).toBe(0);
    });

    it('should handle single number', () => {
      expect(calculateAverage([42])).toBe(42);
    });

    it('should handle negative numbers', () => {
      expect(calculateAverage([-10, 0, 10])).toBe(0);
      expect(calculateAverage([-5, -10, -15])).toBe(-10);
    });

    it('should handle decimals', () => {
      expect(calculateAverage([1.5, 2.5, 3.5])).toBeCloseTo(2.5);
    });
  });
});

