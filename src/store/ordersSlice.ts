import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Order {
  id: string;
  destinationId: string;
  productId: string;
  quantity: number;
  deliveryDate: string;
  assignedDriverId?: string;
  vehicleId?: string;
  status: "pending" | "assigned" | "in-transit" | "completed" | "cancelled";
}

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  selectedOrder: Order | null;
}

const initialState: OrdersState = {
  orders: [],
  loading: false,
  error: null,
  selectedOrder: null,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
      state.loading = false;
      state.error = null;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.push(action.payload);
    },
    updateOrder: (state, action: PayloadAction<Order>) => {
      const index = state.orders.findIndex(
        (order) => order.id === action.payload.id
      );
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },
    deleteOrder: (state, action: PayloadAction<string>) => {
      state.orders = state.orders.filter(
        (order) => order.id !== action.payload
      );
    },
    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateOrderStatus: (
      state,
      action: PayloadAction<{
        orderId: string;
        status: Order["status"];
      }>
    ) => {
      const order = state.orders.find(
        (order) => order.id === action.payload.orderId
      );
      if (order) {
        order.status = action.payload.status;
      }
    },
  },
});

export const {
  setOrders,
  addOrder,
  updateOrder,
  deleteOrder,
  setSelectedOrder,
  setLoading,
  setError,
  updateOrderStatus,
} = ordersSlice.actions;

export default ordersSlice.reducer;

