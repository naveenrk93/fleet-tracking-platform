import { describe, it, expect, vi, beforeEach } from 'vitest';
import driversReducer, {
  setDrivers,
  addDriver,
  updateDriver,
  deleteDriver,
  setSelectedDriver,
  setLoading,
  setError,
  fetchDrivers,
  type Driver,
} from '../driversSlice';
import { getDrivers } from '../../services/api';

// Mock the API
vi.mock('../../services/api', () => ({
  getDrivers: vi.fn(),
}));

describe('driversSlice', () => {
  const mockDriver: Driver = {
    id: '1',
    name: 'John Doe',
    license: 'DL123456',
    phone: '1234567890',
  };

  const initialState = {
    drivers: [],
    loading: false,
    error: null,
    selectedDriver: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the initial state', () => {
    expect(driversReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setDrivers', () => {
    it('should set drivers array and clear loading and error', () => {
      const drivers = [mockDriver, { ...mockDriver, id: '2', name: 'Jane Doe' }];
      const state = { ...initialState, loading: true, error: 'Some error' };
      const actual = driversReducer(state, setDrivers(drivers));
      
      expect(actual.drivers).toEqual(drivers);
      expect(actual.loading).toBe(false);
      expect(actual.error).toBe(null);
    });
  });

  describe('addDriver', () => {
    it('should add a new driver to the list', () => {
      const actual = driversReducer(initialState, addDriver(mockDriver));
      expect(actual.drivers).toHaveLength(1);
      expect(actual.drivers[0]).toEqual(mockDriver);
    });

    it('should append driver to existing list', () => {
      const state = { ...initialState, drivers: [mockDriver] };
      const newDriver = { ...mockDriver, id: '2', name: 'Jane Doe' };
      const actual = driversReducer(state, addDriver(newDriver));
      
      expect(actual.drivers).toHaveLength(2);
      expect(actual.drivers[1]).toEqual(newDriver);
    });
  });

  describe('updateDriver', () => {
    it('should update an existing driver', () => {
      const state = { ...initialState, drivers: [mockDriver] };
      const updatedDriver = { ...mockDriver, name: 'John Smith' };
      const actual = driversReducer(state, updateDriver(updatedDriver));
      
      expect(actual.drivers[0].name).toBe('John Smith');
    });

    it('should not update if driver is not found', () => {
      const state = { ...initialState, drivers: [mockDriver] };
      const nonExistentDriver = { ...mockDriver, id: '999', name: 'Jane Doe' };
      const actual = driversReducer(state, updateDriver(nonExistentDriver));
      
      expect(actual.drivers).toEqual([mockDriver]);
    });
  });

  describe('deleteDriver', () => {
    it('should delete a driver by id', () => {
      const state = { 
        ...initialState, 
        drivers: [mockDriver, { ...mockDriver, id: '2', name: 'Jane Doe' }] 
      };
      const actual = driversReducer(state, deleteDriver('1'));
      
      expect(actual.drivers).toHaveLength(1);
      expect(actual.drivers[0].id).toBe('2');
    });

    it('should not change state if driver id not found', () => {
      const state = { ...initialState, drivers: [mockDriver] };
      const actual = driversReducer(state, deleteDriver('999'));
      
      expect(actual.drivers).toEqual([mockDriver]);
    });
  });

  describe('setSelectedDriver', () => {
    it('should set selected driver', () => {
      const actual = driversReducer(initialState, setSelectedDriver(mockDriver));
      expect(actual.selectedDriver).toEqual(mockDriver);
    });

    it('should clear selected driver when null is passed', () => {
      const state = { ...initialState, selectedDriver: mockDriver };
      const actual = driversReducer(state, setSelectedDriver(null));
      expect(actual.selectedDriver).toBe(null);
    });
  });

  describe('setLoading', () => {
    it('should set loading to true', () => {
      const actual = driversReducer(initialState, setLoading(true));
      expect(actual.loading).toBe(true);
    });

    it('should set loading to false', () => {
      const state = { ...initialState, loading: true };
      const actual = driversReducer(state, setLoading(false));
      expect(actual.loading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error and clear loading', () => {
      const state = { ...initialState, loading: true };
      const actual = driversReducer(state, setError('Failed to load drivers'));
      
      expect(actual.error).toBe('Failed to load drivers');
      expect(actual.loading).toBe(false);
    });

    it('should clear error when null is passed', () => {
      const state = { ...initialState, error: 'Some error' };
      const actual = driversReducer(state, setError(null));
      expect(actual.error).toBe(null);
    });
  });

  describe('fetchDrivers async thunk', () => {
    it('should handle pending state', () => {
      const action = { type: fetchDrivers.pending.type };
      const state = driversReducer(initialState, action);
      
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle fulfilled state', () => {
      const drivers = [mockDriver];
      const action = { 
        type: fetchDrivers.fulfilled.type, 
        payload: drivers 
      };
      const state = { ...initialState, loading: true };
      const actual = driversReducer(state, action);
      
      expect(actual.loading).toBe(false);
      expect(actual.drivers).toEqual(drivers);
    });

    it('should handle rejected state', () => {
      const action = { 
        type: fetchDrivers.rejected.type, 
        error: { message: 'Network error' } 
      };
      const state = { ...initialState, loading: true };
      const actual = driversReducer(state, action);
      
      expect(actual.loading).toBe(false);
      expect(actual.error).toBe('Network error');
    });

    it('should handle rejected state with default error message', () => {
      const action = { 
        type: fetchDrivers.rejected.type, 
        error: {} 
      };
      const state = { ...initialState, loading: true };
      const actual = driversReducer(state, action);
      
      expect(actual.loading).toBe(false);
      expect(actual.error).toBe('Failed to fetch drivers');
    });
  });
});

