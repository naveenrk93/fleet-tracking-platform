import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type UserRole = "admin" | "driver";

interface UserState {
  role: UserRole;
  name: string;
  email: string;
}

const initialState: UserState = {
  role: "admin",
  name: "John Doe",
  email: "john.doe@example.com",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserRole: (state, action: PayloadAction<UserRole>) => {
      state.role = action.payload;
    },
    toggleUserRole: (state) => {
      state.role = state.role === "admin" ? "driver" : "admin";
    },
  },
});

export const { setUserRole, toggleUserRole } = userSlice.actions;
export default userSlice.reducer;

