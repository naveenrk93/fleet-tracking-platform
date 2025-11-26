import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface DeliveryWithDetails {
  id: string;
  shiftId: string;
  orderId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  failureReason: string | null;
  // Additional details from joined data
  order?: {
    id: string;
    destinationId: string;
    productId: string;
    quantity: number;
    deliveryDate: string;
  };
  destination?: {
    id: string;
    name: string;
    address: string;
    type: 'hub' | 'terminal';
  };
  product?: {
    id: string;
    name: string;
    sku: string;
    unit: string;
  };
}

interface DeliveriesState {
  deliveries: DeliveryWithDetails[];
  loading: boolean;
  error: string | null;
}

const initialState: DeliveriesState = {
  deliveries: [],
  loading: false,
  error: null,
};

const deliveriesSlice = createSlice({
  name: "deliveries",
  initialState,
  reducers: {
    setDeliveries: (state, action: PayloadAction<DeliveryWithDetails[]>) => {
      state.deliveries = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateDeliveryStatus: (
      state,
      action: PayloadAction<{
        deliveryId: string;
        status: DeliveryWithDetails["status"];
        failureReason?: string;
      }>
    ) => {
      const delivery = state.deliveries.find(
        (d) => d.id === action.payload.deliveryId
      );
      if (delivery) {
        delivery.status = action.payload.status;
        if (action.payload.failureReason) {
          delivery.failureReason = action.payload.failureReason;
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setDeliveries,
  updateDeliveryStatus,
  setLoading,
  setError,
} = deliveriesSlice.actions;

export default deliveriesSlice.reducer;

