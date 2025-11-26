import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { getDrivers as apiGetDrivers } from "../services/api";

export interface Driver {
  id: string;
  name: string;
  license: string;
  phone: string;
}

interface DriversState {
  drivers: Driver[];
  loading: boolean;
  error: string | null;
  selectedDriver: Driver | null;
}

const initialState: DriversState = {
  drivers: [],
  loading: false,
  error: null,
  selectedDriver: null,
};

// Async thunks
export const fetchDrivers = createAsyncThunk(
  'drivers/fetchDrivers',
  async () => {
    const response = await apiGetDrivers();
    return response;
  }
);

const driversSlice = createSlice({
  name: "drivers",
  initialState,
  reducers: {
    setDrivers: (state, action: PayloadAction<Driver[]>) => {
      state.drivers = action.payload;
      state.loading = false;
      state.error = null;
    },
    addDriver: (state, action: PayloadAction<Driver>) => {
      state.drivers.push(action.payload);
    },
    updateDriver: (state, action: PayloadAction<Driver>) => {
      const index = state.drivers.findIndex(
        (driver) => driver.id === action.payload.id
      );
      if (index !== -1) {
        state.drivers[index] = action.payload;
      }
    },
    deleteDriver: (state, action: PayloadAction<string>) => {
      state.drivers = state.drivers.filter(
        (driver) => driver.id !== action.payload
      );
    },
    setSelectedDriver: (state, action: PayloadAction<Driver | null>) => {
      state.selectedDriver = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDrivers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers = action.payload;
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch drivers';
      });
  },
});

export const {
  setDrivers,
  addDriver,
  updateDriver,
  deleteDriver,
  setSelectedDriver,
  setLoading,
  setError,
} = driversSlice.actions;

export default driversSlice.reducer;

