import { configureStore } from "@reduxjs/toolkit";
import dashboardReducer from "./store/dashboardSlice";
import themeReducer from "./store/themeSlice";
import userReducer from "./store/userSlice";

export const store = configureStore({
    reducer: {
        dashboard: dashboardReducer,
        theme: themeReducer,
        user: userReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
