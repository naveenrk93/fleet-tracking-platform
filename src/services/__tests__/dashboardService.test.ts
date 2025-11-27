import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { dashboardService } from '../dashboardService';
import type { Order, Delivery, Vehicle, Driver, Product } from '../dashboardService';

vi.mock('axios');
const mockedAxios = axios as any;

describe('DashboardService', () => {
  const mockOrders: Order[] = [
    {
      id: '1',
      destinationId: 'dest-1',
      productId: 'prod-1',
      quantity: 100,
      deliveryDate: '2024-01-15',
      assignedDriverId: 'driver-1',
      vehicleId: 'vehicle-1',
      status: 'completed',
    },
    {
      id: '2',
      destinationId: 'dest-2',
      productId: 'prod-2',
      quantity: 50,
      deliveryDate: '2024-01-16',
      assignedDriverId: 'driver-2',
      vehicleId: 'vehicle-2',
      status: 'pending',
    },
    {
      id: '3',
      destinationId: 'dest-3',
      productId: 'prod-3',
      quantity: 75,
      deliveryDate: '2024-01-17',
      assignedDriverId: 'driver-3',
      vehicleId: 'vehicle-1',
      status: 'in-transit',
    },
  ];

  const mockDeliveries: Delivery[] = [
    { id: '1', shiftId: 'shift-1', orderId: '1', status: 'completed', failureReason: null },
    { id: '2', shiftId: 'shift-2', orderId: '2', status: 'pending', failureReason: null },
    { id: '3', shiftId: 'shift-3', orderId: '3', status: 'in-progress', failureReason: null },
    { id: '4', shiftId: 'shift-4', orderId: '4', status: 'failed', failureReason: 'Customer not available' },
  ];

  const mockVehicles: Vehicle[] = [
    {
      id: 'vehicle-1',
      registration: 'ABC123',
      capacity: 1000,
      type: 'Truck',
      currentLocation: { lat: 40.7128, lng: -74.006 },
    },
    {
      id: 'vehicle-2',
      registration: 'XYZ789',
      capacity: 500,
      type: 'Van',
      currentLocation: { lat: 34.0522, lng: -118.2437 },
    },
  ];

  const mockDrivers: Driver[] = [
    { id: 'driver-1', name: 'John Doe', licenseNumber: 'DL123', phone: '1234567890', status: 'active' },
    { id: 'driver-2', name: 'Jane Smith', licenseNumber: 'DL456', phone: '0987654321', status: 'active' },
    { id: 'driver-3', name: 'Bob Johnson', licenseNumber: 'DL789', phone: '5555555555', status: 'inactive' },
  ];

  const mockProducts: Product[] = [
    { id: 'prod-1', name: 'Product A', unit: 'kg', pricePerUnit: 50 },
    { id: 'prod-2', name: 'Product B', unit: 'liters', pricePerUnit: 30 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchAllData', () => {
    it('should fetch all data successfully', async () => {
      mockedAxios.get.mockImplementation((url: string) => {
        if (url.includes('/orders')) return Promise.resolve({ data: mockOrders });
        if (url.includes('/deliveries')) return Promise.resolve({ data: mockDeliveries });
        if (url.includes('/vehicles')) return Promise.resolve({ data: mockVehicles });
        if (url.includes('/drivers')) return Promise.resolve({ data: mockDrivers });
        if (url.includes('/products')) return Promise.resolve({ data: mockProducts });
        return Promise.reject(new Error('Unknown endpoint'));
      });

      const result = await dashboardService.fetchAllData();

      expect(result.orders).toEqual(mockOrders);
      expect(result.deliveries).toEqual(mockDeliveries);
      expect(result.vehicles).toEqual(mockVehicles);
      expect(result.drivers).toEqual(mockDrivers);
      expect(result.products).toEqual(mockProducts);
    });

    it('should throw error when fetch fails', async () => {
      const error = new Error('Network error');
      mockedAxios.get.mockRejectedValue(error);

      await expect(dashboardService.fetchAllData()).rejects.toThrow('Network error');
    });
  });

  describe('calculateMetrics', () => {
    beforeEach(() => {
      mockedAxios.get.mockImplementation((url: string) => {
        if (url.includes('/orders')) return Promise.resolve({ data: mockOrders });
        if (url.includes('/deliveries')) return Promise.resolve({ data: mockDeliveries });
        if (url.includes('/vehicles')) return Promise.resolve({ data: mockVehicles });
        if (url.includes('/drivers')) return Promise.resolve({ data: mockDrivers });
        if (url.includes('/products')) return Promise.resolve({ data: mockProducts });
        return Promise.reject(new Error('Unknown endpoint'));
      });
    });

    it('should calculate fleet metrics correctly', async () => {
      const metrics = await dashboardService.calculateMetrics();

      expect(metrics.totalVehicles).toBe(2);
      expect(metrics.activeVehicles).toBe(2); // Both vehicles are assigned to orders
      expect(metrics.totalDrivers).toBe(3);
      expect(metrics.activeDrivers).toBe(2);
    });

    it('should calculate order metrics correctly', async () => {
      const metrics = await dashboardService.calculateMetrics();

      expect(metrics.totalOrders).toBe(3);
      expect(metrics.completedOrders).toBe(1);
      expect(metrics.pendingOrders).toBe(1);
      expect(metrics.inTransitOrders).toBe(1);
    });

    it('should calculate delivery metrics correctly', async () => {
      const metrics = await dashboardService.calculateMetrics();

      expect(metrics.totalDeliveries).toBe(4);
      expect(metrics.completedDeliveries).toBe(1);
      expect(metrics.pendingDeliveries).toBe(1);
      expect(metrics.inProgressDeliveries).toBe(1);
      expect(metrics.failedDeliveries).toBe(1);
    });

    it('should calculate revenue correctly', async () => {
      const metrics = await dashboardService.calculateMetrics();

      // Only completed orders: 1 order with 100 quantity * 50 per unit = 5000
      expect(metrics.totalRevenue).toBe(5000);
      expect(metrics.totalProductsDelivered).toBe(100);
    });

    it('should calculate delivery status distribution', async () => {
      const metrics = await dashboardService.calculateMetrics();

      expect(metrics.deliveryStatusDistribution).toHaveLength(4);
      expect(metrics.deliveryStatusDistribution.find(d => d.name === 'Completed')?.value).toBe(1);
      expect(metrics.deliveryStatusDistribution.find(d => d.name === 'Pending')?.value).toBe(1);
      expect(metrics.deliveryStatusDistribution.find(d => d.name === 'In Progress')?.value).toBe(1);
      expect(metrics.deliveryStatusDistribution.find(d => d.name === 'Failed')?.value).toBe(1);
    });

    it('should calculate vehicle type distribution', async () => {
      const metrics = await dashboardService.calculateMetrics();

      expect(metrics.vehicleTypeDistribution).toHaveLength(2);
      expect(metrics.vehicleTypeDistribution.find(v => v.name === 'Truck')?.value).toBe(1);
      expect(metrics.vehicleTypeDistribution.find(v => v.name === 'Van')?.value).toBe(1);
    });

    it('should return orders over time data', async () => {
      const metrics = await dashboardService.calculateMetrics();

      expect(metrics.ordersOverTime).toHaveLength(7);
      expect(metrics.ordersOverTime[0]).toHaveProperty('date');
      expect(metrics.ordersOverTime[0]).toHaveProperty('count');
      expect(metrics.ordersOverTime[0]).toHaveProperty('status');
    });

    it('should return monthly revenue data', async () => {
      const metrics = await dashboardService.calculateMetrics();

      expect(metrics.monthlyRevenue).toHaveLength(6);
      expect(metrics.monthlyRevenue[0]).toHaveProperty('month');
      expect(metrics.monthlyRevenue[0]).toHaveProperty('revenue');
      expect(metrics.monthlyRevenue[0]).toHaveProperty('orders');
    });

    it('should return weekly deliveries data', async () => {
      const metrics = await dashboardService.calculateMetrics();

      expect(metrics.weeklyDeliveries).toHaveLength(7);
      expect(metrics.weeklyDeliveries[0]).toHaveProperty('day');
      expect(metrics.weeklyDeliveries[0]).toHaveProperty('deliveries');
    });
  });
});

