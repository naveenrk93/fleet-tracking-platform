import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type UserRole = "admin" | "driver";

interface UserState {
  role: UserRole;
  name: string;
  email: string;
  userId: string | null; // driverId for driver role, adminId for admin role
}

const initialState: UserState = {
  role: "admin",
  name: "Naveen Ramkumar",
  email: "naveen.driver@gmail.com",
  userId: "driver-2",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserRole: (state, action: PayloadAction<UserRole>) => {
      state.role = action.payload;
    },
    setUserId: (state, action: PayloadAction<string | null>) => {
      state.userId = action.payload;
    },
    toggleUserRole: (state) => {
      state.role = state.role === "admin" ? "driver" : "admin";
      // Set a default driver ID for testing when switching to driver role
      state.userId = state.role === "driver" ? "driver-1" : null;
    },
  },
});

export const { setUserRole, setUserId, toggleUserRole } = userSlice.actions;
export default userSlice.reducer;

