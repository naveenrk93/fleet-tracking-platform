import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getFleetLocations, FleetLocation } from '../services/api';

export interface FleetTrackingState {
  locations: FleetLocation[];
  filteredLocations: FleetLocation[];
  filters: {
    driverId: string | null;
    vehicleId: string | null;
    status: string | null;
  };
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  autoRefresh: boolean;
}

const initialState: FleetTrackingState = {
  locations: [],
  filteredLocations: [],
  filters: {
    driverId: null,
    vehicleId: null,
    status: null,
  },
  loading: false,
  error: null,
  lastUpdated: null,
  autoRefresh: true,
};

// Async thunks
export const fetchFleetLocations = createAsyncThunk(
  'fleetTracking/fetchLocations',
  async () => {
    const response = await getFleetLocations();
    return response;
  }
);

const fleetTrackingSlice = createSlice({
  name: 'fleetTracking',
  initialState,
  reducers: {
    setDriverFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.driverId = action.payload;
      applyFilters(state);
    },
    setVehicleFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.vehicleId = action.payload;
      applyFilters(state);
    },
    setStatusFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.status = action.payload;
      applyFilters(state);
    },
    clearFilters: (state) => {
      state.filters = {
        driverId: null,
        vehicleId: null,
        status: null,
      };
      state.filteredLocations = state.locations;
    },
    toggleAutoRefresh: (state) => {
      state.autoRefresh = !state.autoRefresh;
    },
    setAutoRefresh: (state, action: PayloadAction<boolean>) => {
      state.autoRefresh = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFleetLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFleetLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = action.payload;
        state.lastUpdated = new Date().toISOString();
        applyFilters(state);
      })
      .addCase(fetchFleetLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch fleet locations';
      });
  },
});

// Helper function to apply filters
function applyFilters(state: FleetTrackingState) {
  let filtered = state.locations;

  if (state.filters.driverId) {
    filtered = filtered.filter((loc) => loc.driverId === state.filters.driverId);
  }

  if (state.filters.vehicleId) {
    filtered = filtered.filter((loc) => loc.vehicleId === state.filters.vehicleId);
  }

  if (state.filters.status) {
    filtered = filtered.filter((loc) => loc.status === state.filters.status);
  }

  state.filteredLocations = filtered;
}

export const {
  setDriverFilter,
  setVehicleFilter,
  setStatusFilter,
  clearFilters,
  toggleAutoRefresh,
  setAutoRefresh,
} = fleetTrackingSlice.actions;

export default fleetTrackingSlice.reducer;

