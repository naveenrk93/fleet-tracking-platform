import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { getHubs as apiGetHubs } from "../services/api";

export interface HubProduct {
  productId: string;
  productName: string;
  quantity: number;
}

export interface Hub {
  id: string;
  name: string;
  type: "hub";
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  products: HubProduct[];
}

interface HubsState {
  hubs: Hub[];
  loading: boolean;
  error: string | null;
  selectedHub: Hub | null;
}

const initialState: HubsState = {
  hubs: [],
  loading: false,
  error: null,
  selectedHub: null,
};

// Async thunks
export const fetchHubs = createAsyncThunk(
  'hubs/fetchHubs',
  async () => {
    const response = await apiGetHubs();
    return response;
  }
);

const hubsSlice = createSlice({
  name: "hubs",
  initialState,
  reducers: {
    setHubs: (state, action: PayloadAction<Hub[]>) => {
      state.hubs = action.payload;
      state.loading = false;
      state.error = null;
    },
    addHub: (state, action: PayloadAction<Hub>) => {
      state.hubs.push(action.payload);
    },
    updateHub: (state, action: PayloadAction<Hub>) => {
      const index = state.hubs.findIndex((hub) => hub.id === action.payload.id);
      if (index !== -1) {
        state.hubs[index] = action.payload;
      }
    },
    deleteHub: (state, action: PayloadAction<string>) => {
      state.hubs = state.hubs.filter((hub) => hub.id !== action.payload);
    },
    setSelectedHub: (state, action: PayloadAction<Hub | null>) => {
      state.selectedHub = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateHubProducts: (
      state,
      action: PayloadAction<{
        hubId: string;
        products: HubProduct[];
      }>
    ) => {
      const hub = state.hubs.find((hub) => hub.id === action.payload.hubId);
      if (hub) {
        hub.products = action.payload.products;
      }
    },
    addProductToHub: (
      state,
      action: PayloadAction<{
        hubId: string;
        product: HubProduct;
      }>
    ) => {
      const hub = state.hubs.find((hub) => hub.id === action.payload.hubId);
      if (hub) {
        const existingProduct = hub.products.find(
          (p) => p.productId === action.payload.product.productId
        );
        if (existingProduct) {
          existingProduct.quantity += action.payload.product.quantity;
        } else {
          hub.products.push(action.payload.product);
        }
      }
    },
    removeProductFromHub: (
      state,
      action: PayloadAction<{
        hubId: string;
        productId: string;
      }>
    ) => {
      const hub = state.hubs.find((hub) => hub.id === action.payload.hubId);
      if (hub) {
        hub.products = hub.products.filter(
          (p) => p.productId !== action.payload.productId
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHubs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHubs.fulfilled, (state, action) => {
        state.loading = false;
        state.hubs = action.payload.map((hub: any) => ({
          ...hub,
          products: hub.products || []
        })) as any;
      })
      .addCase(fetchHubs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch hubs';
      });
  },
});

export const {
  setHubs,
  addHub,
  updateHub,
  deleteHub,
  setSelectedHub,
  setLoading,
  setError,
  updateHubProducts,
  addProductToHub,
  removeProductFromHub,
} = hubsSlice.actions;

export default hubsSlice.reducer;

