import { describe, it, expect } from 'vitest';
import * as api from '../../services/api';

describe('Vehicle Allocation Integration', () => {
  describe('Allocation API Operations', () => {
    it('should fetch vehicle allocations from API', async () => {
      const allocations = await api.getAllocations();
      expect(allocations).toBeDefined();
      expect(Array.isArray(allocations)).toBe(true);
    });

    it('should create a new allocation', async () => {
      const newAllocation = {
        vehicleId: '1',
        driverId: '1',
        date: new Date().toISOString().split('T')[0],
        status: 'allocated' as const,
      };

      const created = await api.createAllocation(newAllocation);
      expect(created).toBeDefined();
      expect(created.id).toBeTruthy();
    });

    it('should update allocation', async () => {
      const updated = await api.updateAllocation('1', {
        status: 'completed',
      });
      expect(updated).toBeDefined();
    });

    it('should handle allocation workflow', async () => {
      // Fetch vehicles
      const vehicles = await api.getVehicles();
      expect(vehicles.length).toBeGreaterThan(0);

      // Fetch drivers  
      const drivers = await api.getDrivers();
      expect(drivers.length).toBeGreaterThan(0);

      // Create allocation
      const allocation = await api.createAllocation({
        vehicleId: vehicles[0].id,
        driverId: drivers[0].id,
        date: new Date().toISOString().split('T')[0],
        status: 'allocated' as const,
      });

      expect(allocation.status).toBe('allocated');
    });
  });
});

