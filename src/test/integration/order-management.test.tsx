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
        destinationId: 'terminal-1',
        productId: 'product-1',
        quantity: 100,
        deliveryDate: '2024-01-15',
        assignedDriverId: 'driver-1',
        vehicleId: 'vehicle-1',
        status: 'pending',
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
        destinationId: 'terminal-1',
        productId: 'product-1',
        quantity: 100,
        deliveryDate: '2024-01-15',
        assignedDriverId: 'driver-1',
        vehicleId: 'vehicle-1',
        status: 'pending',
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

