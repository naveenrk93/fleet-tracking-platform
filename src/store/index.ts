// Export all slice actions and types for easy importing
export * from "./dashboardSlice";
export * from "./themeSlice";
export * from "./userSlice";
export * from "./hooks";

// Export orders slice with namespaced actions to avoid conflicts
export type { Order } from "./ordersSlice";
export {
  setOrders,
  addOrder,
  updateOrder,
  deleteOrder,
  setSelectedOrder,
  updateOrderStatus,
  setLoading as setOrdersLoading,
  setError as setOrdersError,
} from "./ordersSlice";

// Export hubs slice with namespaced actions to avoid conflicts
export type { Hub, HubProduct } from "./hubsSlice";
export {
  fetchHubs,
  setHubs,
  addHub,
  updateHub,
  deleteHub,
  setSelectedHub,
  updateHubProducts,
  addProductToHub,
  removeProductFromHub,
  setLoading as setHubsLoading,
  setError as setHubsError,
} from "./hubsSlice";

// Export terminals slice with namespaced actions to avoid conflicts
export type { Terminal } from "./terminalsSlice";
export {
  fetchTerminals,
  setTerminals,
  addTerminal,
  updateTerminal,
  deleteTerminal,
  setSelectedTerminal,
  setLoading as setTerminalsLoading,
  setError as setTerminalsError,
} from "./terminalsSlice";

// Export products slice with namespaced actions to avoid conflicts
export type { Product } from "./productsSlice";
export {
  setProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  setSelectedProduct,
  updateStockQuantity,
  decrementStock,
  incrementStock,
  setLoading as setProductsLoading,
  setError as setProductsError,
} from "./productsSlice";

// Export drivers slice with namespaced actions to avoid conflicts
export type { Driver } from "./driversSlice";
export {
  fetchDrivers,
  setDrivers,
  addDriver,
  updateDriver,
  deleteDriver,
  setSelectedDriver,
  setLoading as setDriversLoading,
  setError as setDriversError,
} from "./driversSlice";

// Export vehicles slice with namespaced actions to avoid conflicts
export type { Vehicle } from "./vehiclesSlice";
export {
  fetchVehicles,
  setVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  setSelectedVehicle,
  updateVehicleLocation,
  setLoading as setVehiclesLoading,
  setError as setVehiclesError,
} from "./vehiclesSlice";

// Export vehicle allocations slice with namespaced actions to avoid conflicts
export type { VehicleAllocation } from "./vehicleAllocationsSlice";
export {
  setVehicleAllocations,
  addVehicleAllocation,
  updateVehicleAllocation,
  deleteVehicleAllocation,
  setSelectedAllocation,
  updateAllocationStatus,
  getAllocationByVehicle,
  getAllocationByDriver,
  setLoading as setAllocationsLoading,
  setError as setAllocationsError,
} from "./vehicleAllocationsSlice";

// Export fleet tracking slice (no conflicts)
export * from "./fleetTrackingSlice";

// Export deliveries slice with namespaced actions to avoid conflicts
export type { DeliveryWithDetails } from "./deliveriesSlice";
export {
  setDeliveries,
  updateDeliveryStatus,
  setLoading as setDeliveriesLoading,
  setError as setDeliveriesError,
} from "./deliveriesSlice";

