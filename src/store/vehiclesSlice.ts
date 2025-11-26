import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { getVehicles as apiGetVehicles } from "../services/api";

export interface Vehicle {
  id: string;
  registration: string;
  capacity: number;
  type: string;
  currentLocation: {
    lat: number;
    lng: number;
  };
}

interface VehiclesState {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  selectedVehicle: Vehicle | null;
}

const initialState: VehiclesState = {
  vehicles: [],
  loading: false,
  error: null,
  selectedVehicle: null,
};

// Async thunks
export const fetchVehicles = createAsyncThunk(
  'vehicles/fetchVehicles',
  async () => {
    const response = await apiGetVehicles();
    return response;
  }
);

const vehiclesSlice = createSlice({
  name: "vehicles",
  initialState,
  reducers: {
    setVehicles: (state, action: PayloadAction<Vehicle[]>) => {
      state.vehicles = action.payload;
      state.loading = false;
      state.error = null;
    },
    addVehicle: (state, action: PayloadAction<Vehicle>) => {
      state.vehicles.push(action.payload);
    },
    updateVehicle: (state, action: PayloadAction<Vehicle>) => {
      const index = state.vehicles.findIndex(
        (vehicle) => vehicle.id === action.payload.id
      );
      if (index !== -1) {
        state.vehicles[index] = action.payload;
      }
    },
    deleteVehicle: (state, action: PayloadAction<string>) => {
      state.vehicles = state.vehicles.filter(
        (vehicle) => vehicle.id !== action.payload
      );
    },
    setSelectedVehicle: (state, action: PayloadAction<Vehicle | null>) => {
      state.selectedVehicle = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateVehicleLocation: (
      state,
      action: PayloadAction<{
        vehicleId: string;
        location: { lat: number; lng: number };
      }>
    ) => {
      const vehicle = state.vehicles.find(
        (v) => v.id === action.payload.vehicleId
      );
      if (vehicle) {
        vehicle.currentLocation = action.payload.location;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch vehicles';
      });
  },
});

export const {
  setVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  setSelectedVehicle,
  setLoading,
  setError,
  updateVehicleLocation,
} = vehiclesSlice.actions;

export default vehiclesSlice.reducer;

