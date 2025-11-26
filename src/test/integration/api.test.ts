import { describe, it, expect, beforeEach } from 'vitest';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';
import * as api from '../../services/api';

describe('API Integration Tests', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe('Vehicles API', () => {
    it('should fetch all vehicles', async () => {
      const vehicles = await api.getVehicles();
      expect(vehicles).toHaveLength(1);
      expect(vehicles[0].registrationNumber).toBe('TN01AB1234');
    });

    it('should fetch vehicle by id', async () => {
      const vehicle = await api.getVehicle('1');
      expect(vehicle.id).toBe('1');
      expect(vehicle.registrationNumber).toBe('TN01AB1234');
    });

    it('should create a new vehicle', async () => {
      const newVehicle = {
        registrationNumber: 'TN02CD5678',
        make: 'Mahindra',
        model: 'Bolero',
        capacity: 1500,
        status: 'active' as const,
      };

      const created = await api.createVehicle(newVehicle);
      expect(created.id).toBe('123');
      expect(created.registrationNumber).toBe('TN02CD5678');
    });

    it('should handle API errors', async () => {
      server.use(
        http.get('http://localhost:3001/vehicles', () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          );
        })
      );

      await expect(api.getVehicles()).rejects.toThrow();
    });
  });

  describe('Drivers API', () => {
    it('should fetch all drivers', async () => {
      const drivers = await api.getDrivers();
      expect(drivers).toHaveLength(1);
      expect(drivers[0].name).toBe('John Doe');
    });

    it('should create a new driver', async () => {
      const newDriver = {
        name: 'Jane Smith',
        licenseNumber: 'DL9876543210123',
        phone: '8765432109',
        status: 'available' as const,
      };

      const created = await api.createDriver(newDriver);
      expect(created.id).toBe('123');
      expect(created.name).toBe('Jane Smith');
    });
  });

  describe('Orders API', () => {
    it('should fetch all orders', async () => {
      const orders = await api.getOrders();
      expect(orders).toHaveLength(1);
      expect(orders[0].orderNumber).toBe('ORD-001');
    });

    it('should fetch order by id', async () => {
      const order = await api.getOrder('1');
      expect(order.id).toBe('1');
      expect(order.orderNumber).toBe('ORD-001');
    });

    it('should create a new order', async () => {
      const newOrder = {
        customerId: '2',
        customerName: 'Test Customer 2',
        status: 'pending' as const,
        totalAmount: 3000,
        items: [],
      };

      const created = await api.createOrder(newOrder);
      expect(created.id).toBe('123');
    });

    it('should update order status', async () => {
      const updated = await api.updateOrder('1', { status: 'confirmed' });
      expect(updated.id).toBe('1');
      expect(updated.status).toBe('confirmed');
    });
  });

  describe('Deliveries API', () => {
    it('should fetch deliveries', async () => {
      const deliveries = await api.getDeliveries();
      expect(deliveries).toHaveLength(1);
      expect(deliveries[0].status).toBe('in_transit');
    });

    it('should update delivery status', async () => {
      const updated = await api.updateDelivery('1', { status: 'delivered' });
      expect(updated.id).toBe('1');
      expect(updated.status).toBe('delivered');
    });
  });

  describe('Vehicle Allocations API', () => {
    it('should fetch all allocations', async () => {
      const allocations = await api.getAllocations();
      expect(allocations).toHaveLength(1);
      expect(allocations[0].status).toBe('active');
    });

    it('should create a new allocation', async () => {
      const newAllocation = {
        vehicleId: '2',
        driverId: '2',
        startDate: new Date().toISOString(),
        status: 'active' as const,
      };

      const created = await api.createAllocation(newAllocation);
      expect(created.id).toBe('123');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      server.use(
        http.get('http://localhost:3001/vehicles', () => {
          return HttpResponse.error();
        })
      );

      await expect(api.getVehicles()).rejects.toThrow();
    });

    it('should handle 404 errors', async () => {
      server.use(
        http.get('http://localhost:3001/vehicles/:id', () => {
          return HttpResponse.json(
            { message: 'Not Found' },
            { status: 404 }
          );
        })
      );

      await expect(api.getVehicle('999')).rejects.toThrow();
    });
  });
});

