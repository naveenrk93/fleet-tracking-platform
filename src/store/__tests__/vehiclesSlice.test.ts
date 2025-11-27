import { describe, it, expect, vi, beforeEach } from 'vitest';
import vehiclesReducer, {
  setVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  setSelectedVehicle,
  setLoading,
  setError,
  updateVehicleLocation,
  fetchVehicles,
  type Vehicle,
} from '../vehiclesSlice';

// Mock the API
vi.mock('../../services/api', () => ({
  getVehicles: vi.fn(),
}));

describe('vehiclesSlice', () => {
  const mockVehicle: Vehicle = {
    id: '1',
    registration: 'ABC123',
    capacity: 1000,
    type: 'Truck',
    currentLocation: {
      lat: 40.7128,
      lng: -74.006,
    },
  };

  const initialState = {
    vehicles: [],
    loading: false,
    error: null,
    selectedVehicle: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the initial state', () => {
    expect(vehiclesReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setVehicles', () => {
    it('should set vehicles array and clear loading and error', () => {
      const vehicles = [mockVehicle, { ...mockVehicle, id: '2', registration: 'XYZ789' }];
      const state = { ...initialState, loading: true, error: 'Some error' };
      const actual = vehiclesReducer(state, setVehicles(vehicles));
      
      expect(actual.vehicles).toEqual(vehicles);
      expect(actual.loading).toBe(false);
      expect(actual.error).toBe(null);
    });
  });

  describe('addVehicle', () => {
    it('should add a new vehicle to the list', () => {
      const actual = vehiclesReducer(initialState, addVehicle(mockVehicle));
      expect(actual.vehicles).toHaveLength(1);
      expect(actual.vehicles[0]).toEqual(mockVehicle);
    });
  });

  describe('updateVehicle', () => {
    it('should update an existing vehicle', () => {
      const state = { ...initialState, vehicles: [mockVehicle] };
      const updatedVehicle = { ...mockVehicle, capacity: 2000 };
      const actual = vehiclesReducer(state, updateVehicle(updatedVehicle));
      
      expect(actual.vehicles[0].capacity).toBe(2000);
    });

    it('should not update if vehicle is not found', () => {
      const state = { ...initialState, vehicles: [mockVehicle] };
      const nonExistentVehicle = { ...mockVehicle, id: '999' };
      const actual = vehiclesReducer(state, updateVehicle(nonExistentVehicle));
      
      expect(actual.vehicles).toEqual([mockVehicle]);
    });
  });

  describe('deleteVehicle', () => {
    it('should delete a vehicle by id', () => {
      const state = { 
        ...initialState, 
        vehicles: [mockVehicle, { ...mockVehicle, id: '2', registration: 'XYZ789' }] 
      };
      const actual = vehiclesReducer(state, deleteVehicle('1'));
      
      expect(actual.vehicles).toHaveLength(1);
      expect(actual.vehicles[0].id).toBe('2');
    });
  });

  describe('setSelectedVehicle', () => {
    it('should set selected vehicle', () => {
      const actual = vehiclesReducer(initialState, setSelectedVehicle(mockVehicle));
      expect(actual.selectedVehicle).toEqual(mockVehicle);
    });

    it('should clear selected vehicle when null is passed', () => {
      const state = { ...initialState, selectedVehicle: mockVehicle };
      const actual = vehiclesReducer(state, setSelectedVehicle(null));
      expect(actual.selectedVehicle).toBe(null);
    });
  });

  describe('setLoading', () => {
    it('should set loading to true', () => {
      const actual = vehiclesReducer(initialState, setLoading(true));
      expect(actual.loading).toBe(true);
    });
  });

  describe('setError', () => {
    it('should set error and clear loading', () => {
      const state = { ...initialState, loading: true };
      const actual = vehiclesReducer(state, setError('Failed to load vehicles'));
      
      expect(actual.error).toBe('Failed to load vehicles');
      expect(actual.loading).toBe(false);
    });
  });

  describe('updateVehicleLocation', () => {
    it('should update vehicle location', () => {
      const state = { ...initialState, vehicles: [mockVehicle] };
      const newLocation = { lat: 51.5074, lng: -0.1278 };
      const actual = vehiclesReducer(
        state,
        updateVehicleLocation({ vehicleId: '1', location: newLocation })
      );
      
      expect(actual.vehicles[0].currentLocation).toEqual(newLocation);
    });

    it('should not update if vehicle is not found', () => {
      const state = { ...initialState, vehicles: [mockVehicle] };
      const newLocation = { lat: 51.5074, lng: -0.1278 };
      const actual = vehiclesReducer(
        state,
        updateVehicleLocation({ vehicleId: '999', location: newLocation })
      );
      
      expect(actual.vehicles[0].currentLocation).toEqual(mockVehicle.currentLocation);
    });
  });

  describe('fetchVehicles async thunk', () => {
    it('should handle pending state', () => {
      const action = { type: fetchVehicles.pending.type };
      const state = vehiclesReducer(initialState, action);
      
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle fulfilled state', () => {
      const vehicles = [mockVehicle];
      const action = { 
        type: fetchVehicles.fulfilled.type, 
        payload: vehicles 
      };
      const state = { ...initialState, loading: true };
      const actual = vehiclesReducer(state, action);
      
      expect(actual.loading).toBe(false);
      expect(actual.vehicles).toEqual(vehicles);
    });

    it('should handle rejected state', () => {
      const action = { 
        type: fetchVehicles.rejected.type, 
        error: { message: 'Network error' } 
      };
      const state = { ...initialState, loading: true };
      const actual = vehiclesReducer(state, action);
      
      expect(actual.loading).toBe(false);
      expect(actual.error).toBe('Network error');
    });
  });
});

