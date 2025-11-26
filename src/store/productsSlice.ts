import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  unit: string;
  description: string;
  stockQuantity: number;
}

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  selectedProduct: Product | null;
}

const initialState: ProductsState = {
  products: [],
  loading: false,
  error: null,
  selectedProduct: null,
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
      state.loading = false;
      state.error = null;
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.push(action.payload);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex(
        (product) => product.id === action.payload.id
      );
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter(
        (product) => product.id !== action.payload
      );
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateStockQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      const product = state.products.find(
        (p) => p.id === action.payload.productId
      );
      if (product) {
        product.stockQuantity = action.payload.quantity;
      }
    },
    decrementStock: (
      state,
      action: PayloadAction<{ productId: string; amount: number }>
    ) => {
      const product = state.products.find(
        (p) => p.id === action.payload.productId
      );
      if (product) {
        product.stockQuantity = Math.max(
          0,
          product.stockQuantity - action.payload.amount
        );
      }
    },
    incrementStock: (
      state,
      action: PayloadAction<{ productId: string; amount: number }>
    ) => {
      const product = state.products.find(
        (p) => p.id === action.payload.productId
      );
      if (product) {
        product.stockQuantity += action.payload.amount;
      }
    },
  },
});

export const {
  setProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  setSelectedProduct,
  setLoading,
  setError,
  updateStockQuantity,
  decrementStock,
  incrementStock,
} = productsSlice.actions;

export default productsSlice.reducer;

