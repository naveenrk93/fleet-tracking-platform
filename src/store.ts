import { configureStore } from "@reduxjs/toolkit";
import dashboardReducer from "./store/dashboardSlice";
import themeReducer from "./store/themeSlice";
import userReducer from "./store/userSlice";
import ordersReducer from "./store/ordersSlice";
import hubsReducer from "./store/hubsSlice";
import terminalsReducer from "./store/terminalsSlice";
import productsReducer from "./store/productsSlice";
import driversReducer from "./store/driversSlice";
import vehiclesReducer from "./store/vehiclesSlice";
import vehicleAllocationsReducer from "./store/vehicleAllocationsSlice";
import fleetTrackingReducer from "./store/fleetTrackingSlice";
import deliveriesReducer from "./store/deliveriesSlice";

export const store = configureStore({
    reducer: {
        dashboard: dashboardReducer,
        theme: themeReducer,
        user: userReducer,
        orders: ordersReducer,
        hubs: hubsReducer,
        terminals: terminalsReducer,
        products: productsReducer,
        drivers: driversReducer,
        vehicles: vehiclesReducer,
        vehicleAllocations: vehicleAllocationsReducer,
        fleetTracking: fleetTrackingReducer,
        deliveries: deliveriesReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
