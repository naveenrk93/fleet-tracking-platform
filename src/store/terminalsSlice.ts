import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { getTerminals as apiGetTerminals } from "../services/api";

export interface Terminal {
  id: string;
  name: string;
  type: "terminal";
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  products: any[];
}

interface TerminalsState {
  terminals: Terminal[];
  loading: boolean;
  error: string | null;
  selectedTerminal: Terminal | null;
}

const initialState: TerminalsState = {
  terminals: [],
  loading: false,
  error: null,
  selectedTerminal: null,
};

// Async thunks
export const fetchTerminals = createAsyncThunk(
  'terminals/fetchTerminals',
  async () => {
    const response = await apiGetTerminals();
    return response;
  }
);

const terminalsSlice = createSlice({
  name: "terminals",
  initialState,
  reducers: {
    setTerminals: (state, action: PayloadAction<Terminal[]>) => {
      state.terminals = action.payload;
      state.loading = false;
      state.error = null;
    },
    addTerminal: (state, action: PayloadAction<Terminal>) => {
      state.terminals.push(action.payload);
    },
    updateTerminal: (state, action: PayloadAction<Terminal>) => {
      const index = state.terminals.findIndex(
        (terminal) => terminal.id === action.payload.id
      );
      if (index !== -1) {
        state.terminals[index] = action.payload;
      }
    },
    deleteTerminal: (state, action: PayloadAction<string>) => {
      state.terminals = state.terminals.filter(
        (terminal) => terminal.id !== action.payload
      );
    },
    setSelectedTerminal: (state, action: PayloadAction<Terminal | null>) => {
      state.selectedTerminal = action.payload;
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
      .addCase(fetchTerminals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTerminals.fulfilled, (state, action) => {
        state.loading = false;
        state.terminals = action.payload;
      })
      .addCase(fetchTerminals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch terminals';
      });
  },
});

export const {
  setTerminals,
  addTerminal,
  updateTerminal,
  deleteTerminal,
  setSelectedTerminal,
  setLoading,
  setError,
} = terminalsSlice.actions;

export default terminalsSlice.reducer;

