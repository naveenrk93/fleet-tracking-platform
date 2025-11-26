import { describe, it, expect } from 'vitest';
import * as api from '../../services/api';

describe('Order Management Integration', () => {
  describe('Order API Operations', () => {
    it('should fetch orders from API', async () => {
      const orders = await api.getOrders();
      expect(orders).toBeDefined();
      expect(Array.isArray(orders)).toBe(true);
    });

    it('should create a new order', async () => {
      const newOrder = {
        customerId: '1',
        customerName: 'Test Customer',
        status: 'pending' as const,
        totalAmount: 5000,
        items: [],
      };

      const created = await api.createOrder(newOrder);
      expect(created).toBeDefined();
      expect(created.id).toBeTruthy();
    });

    it('should fetch single order by id', async () => {
      const order = await api.getOrder('1');
      expect(order).toBeDefined();
      expect(order.id).toBe('1');
    });

    it('should update order', async () => {
      const updated = await api.updateOrder('1', {
        status: 'confirmed',
      });
      expect(updated).toBeDefined();
      expect(updated.status).toBe('confirmed');
    });

    it('should handle order workflow', async () => {
      // Create order
      const newOrder = await api.createOrder({
        customerId: '1',
        customerName: 'Test Customer',
        status: 'pending' as const,
        totalAmount: 5000,
        items: [],
      });

      expect(newOrder.status).toBe('pending');

      // Update status
      const confirmed = await api.updateOrder(newOrder.id, {
        status: 'confirmed',
      });
      expect(confirmed.status).toBe('confirmed');
    });
  });
});

