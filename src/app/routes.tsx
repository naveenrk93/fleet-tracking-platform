import { type RouteObject, Navigate } from "react-router-dom";
import { DashboardPage } from "../pages/DashboardPage";
import { RoleBasedRedirect } from "../components/RoleBasedRedirect";

// Admin Pages
import { AdminDashboard } from "../pages/admin/Dashboard/Dashboard.tsx";
import { HubsPage } from "../pages/admin/MasterData/HubsPage";
import { TerminalsPage } from "../pages/admin/MasterData/TerminalsPage";
import { ProductsPage } from "../pages/admin/MasterData/ProductsPage";
import { DriversPage } from "../pages/admin/MasterData/DriversPage";
import { VehiclesPage } from "../pages/admin/MasterData/VehiclesPage";
import { OrdersPage } from "../pages/admin/Orders/OrdersPage";
import { OrderForm } from "../pages/admin/Orders/OrderForm";
import { OrderDetailPage } from "../pages/admin/Orders/OrderDetailPage";
import { VehicleAllocationPage } from "../pages/admin/VehicleAllocation/VehicleAllocationPage";
import { InventoryDashboardPage } from "../pages/admin/Inventory/InventoryDashboardPage";
import { LiveFleetMapPage } from "../pages/admin/LiveFleet/LiveFleetMapPage";

// Driver Pages
import { ShiftViewPage } from "../pages/driver/ShiftView/ShiftViewPage.tsx";
import { DriverLiveMapPage } from "../pages/driver/DriverLiveMap/DriverLiveMapPage.tsx";
import { DeliveryManagementPage } from "../pages/driver/DeliveryManagement/DeliveryManagementPage.tsx";
import { ShiftHistoryPage } from "../pages/driver/ShiftHistory/ShiftHistoryPage.tsx";

// Route configuration
export const routes: RouteObject[] = [
    {
        path: "/dashboard",
        element: <DashboardPage />,
    },
    // Admin Routes
    {
        path: "/admin",
        element: <Navigate to="/admin/dashboard" replace />,
    },
    {
        path: "/admin/dashboard",
        element: <AdminDashboard />,
    },
    // Master Data Routes
    {
        path: "/admin/master-data/hubs",
        element: <HubsPage />,
    },
    {
        path: "/admin/master-data/terminals",
        element: <TerminalsPage />,
    },
    {
        path: "/admin/master-data/products",
        element: <ProductsPage />,
    },
    {
        path: "/admin/master-data/drivers",
        element: <DriversPage />,
    },
    {
        path: "/admin/master-data/vehicles",
        element: <VehiclesPage />,
    },
    // Orders Routes
    {
        path: "/admin/orders",
        element: <OrdersPage />,
    },
    {
        path: "/admin/orders/new",
        element: <OrderForm />,
    },
    {
        path: "/admin/orders/:id",
        element: <OrderDetailPage />,
    },
    {
        path: "/admin/orders/edit/:id",
        element: <OrderForm />,
    },
    // Vehicle Allocation
    {
        path: "/admin/vehicle-allocation",
        element: <VehicleAllocationPage />,
    },
    // Inventory
    {
        path: "/admin/inventory",
        element: <InventoryDashboardPage />,
    },
    // Live Fleet
    {
        path: "/admin/live-fleet",
        element: <LiveFleetMapPage />,
    },
    // Driver Routes
    {
        path: "/driver",
        element: <Navigate to="/driver/shift-view" replace />,
    },
    {
        path: "/driver/shift-view",
        element: <ShiftViewPage />,
    },
    {
        path: "/driver/live-map",
        element: <DriverLiveMapPage />,
    },
    {
        path: "/driver/delivery-management",
        element: <DeliveryManagementPage />,
    },
    {
        path: "/driver/shift-history",
        element: <ShiftHistoryPage />,
    },
    {
        path: "/",
        element: <RoleBasedRedirect />,
    },
    {
        path: "*",
        element: <RoleBasedRedirect />,
    },
];

// Route paths for easy reference
export const ROUTE_PATHS = {
    DASHBOARD: "/dashboard",
    // Admin paths
    ADMIN: {
        DASHBOARD: "/admin/dashboard",
        MASTER_DATA: {
            HUBS: "/admin/master-data/hubs",
            TERMINALS: "/admin/master-data/terminals",
            PRODUCTS: "/admin/master-data/products",
            DRIVERS: "/admin/master-data/drivers",
            VEHICLES: "/admin/master-data/vehicles",
        },
        ORDERS: "/admin/orders",
        ORDER_NEW: "/admin/orders/new",
        VEHICLE_ALLOCATION: "/admin/vehicle-allocation",
        INVENTORY: "/admin/inventory",
        LIVE_FLEET: "/admin/live-fleet",
    },
    // Driver paths
    DRIVER: {
        SHIFT_VIEW: "/driver/shift-view",
        LIVE_MAP: "/driver/live-map",
        DELIVERY_MANAGEMENT: "/driver/delivery-management",
        SHIFT_HISTORY: "/driver/shift-history",
    },
} as const;

