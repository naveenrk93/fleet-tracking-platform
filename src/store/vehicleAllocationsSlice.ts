import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface VehicleAllocation {
  id: string;
  vehicleId: string;
  driverId: string;
  status: "allocated" | "available" | "in-use";
  allocationDate: string;
}

interface VehicleAllocationsState {
  allocations: VehicleAllocation[];
  loading: boolean;
  error: string | null;
  selectedAllocation: VehicleAllocation | null;
}

const initialState: VehicleAllocationsState = {
  allocations: [],
  loading: false,
  error: null,
  selectedAllocation: null,
};

const vehicleAllocationsSlice = createSlice({
  name: "vehicleAllocations",
  initialState,
  reducers: {
    setVehicleAllocations: (
      state,
      action: PayloadAction<VehicleAllocation[]>
    ) => {
      state.allocations = action.payload;
      state.loading = false;
      state.error = null;
    },
    addVehicleAllocation: (state, action: PayloadAction<VehicleAllocation>) => {
      state.allocations.push(action.payload);
    },
    updateVehicleAllocation: (
      state,
      action: PayloadAction<VehicleAllocation>
    ) => {
      const index = state.allocations.findIndex(
        (allocation) => allocation.id === action.payload.id
      );
      if (index !== -1) {
        state.allocations[index] = action.payload;
      }
    },
    deleteVehicleAllocation: (state, action: PayloadAction<string>) => {
      state.allocations = state.allocations.filter(
        (allocation) => allocation.id !== action.payload
      );
    },
    setSelectedAllocation: (
      state,
      action: PayloadAction<VehicleAllocation | null>
    ) => {
      state.selectedAllocation = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateAllocationStatus: (
      state,
      action: PayloadAction<{
        allocationId: string;
        status: VehicleAllocation["status"];
      }>
    ) => {
      const allocation = state.allocations.find(
        (a) => a.id === action.payload.allocationId
      );
      if (allocation) {
        allocation.status = action.payload.status;
      }
    },
    getAllocationByVehicle: (state, action: PayloadAction<string>) => {
      const allocation = state.allocations.find(
        (a) => a.vehicleId === action.payload
      );
      state.selectedAllocation = allocation || null;
    },
    getAllocationByDriver: (state, action: PayloadAction<string>) => {
      const allocation = state.allocations.find(
        (a) => a.driverId === action.payload
      );
      state.selectedAllocation = allocation || null;
    },
  },
});

export const {
  setVehicleAllocations,
  addVehicleAllocation,
  updateVehicleAllocation,
  deleteVehicleAllocation,
  setSelectedAllocation,
  setLoading,
  setError,
  updateAllocationStatus,
  getAllocationByVehicle,
  getAllocationByDriver,
} = vehicleAllocationsSlice.actions;

export default vehicleAllocationsSlice.reducer;

