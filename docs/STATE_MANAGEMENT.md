# State Management

## Overview

The Fleet Tracking Platform uses **Redux Toolkit** for centralized state management. This document explains the state architecture, slice structure, and data flow patterns.

---

## Architecture

### Store Configuration

**Location:** `src/store.ts`

The Redux store is configured using `configureStore` from Redux Toolkit with the following slices:

```typescript
{
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
}
```

### Types Export

```typescript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

## Custom Hooks

**Location:** `src/store/hooks.ts`

Typed hooks for TypeScript safety:

```typescript
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

**Usage:**
```typescript
// Instead of useDispatch and useSelector
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const dispatch = useAppDispatch();
const data = useAppSelector((state) => state.orders.orders);
```

---

## State Slices

### 1. User Slice

**Location:** `src/store/userSlice.ts`

**Purpose:** Manages current user role and authentication state.

**State Shape:**
```typescript
{
  role: "admin" | "driver",
  name: string,
  email: string,
  userId: string | null  // driverId for drivers, null/adminId for admin
}
```

**Actions:**
- `setUserRole(role)` - Set user role
- `setUserId(userId)` - Set user identifier
- `toggleUserRole()` - Switch between admin/driver (development)

**Usage Example:**
```typescript
const { role, userId } = useAppSelector((state) => state.user);
dispatch(setUserRole('driver'));
```

---

### 2. Theme Slice

**Location:** `src/store/themeSlice.ts`

**Purpose:** Manages application theme (light/dark mode).

**State Shape:**
```typescript
{
  colorMode: "light" | "dark"
}
```

**Actions:**
- `toggleColorMode()` - Switch between light/dark mode

**Persistence:**
- Reads from and writes to `localStorage`
- Key: `chakra-ui-color-mode`

**Usage Example:**
```typescript
const { colorMode } = useAppSelector((state) => state.theme);
dispatch(toggleColorMode());
```

---

### 3. Dashboard Slice

**Location:** `src/store/dashboardSlice.ts`

**Purpose:** Stores dashboard statistics and analytics data.

**State Shape:**
```typescript
{
  stats: {
    totalRevenue: number,
    activeVehicles: number,
    completedDeliveries: number,
    // ... other metrics
  },
  loading: boolean,
  error: string | null
}
```

---

### 4. Orders Slice

**Location:** `src/store/ordersSlice.ts`

**Purpose:** Manages order state and operations.

**State Shape:**
```typescript
{
  orders: Order[],
  loading: boolean,
  error: string | null,
  selectedOrder: Order | null
}

interface Order {
  id: string,
  destinationId: string,
  productId: string,
  quantity: number,
  deliveryDate: string,
  assignedDriverId?: string,
  vehicleId?: string,
  status: "pending" | "assigned" | "in-transit" | "completed" | "cancelled"
}
```

**Actions:**
- `setOrders(orders)` - Set all orders
- `addOrder(order)` - Add new order
- `updateOrder(order)` - Update existing order
- `deleteOrder(orderId)` - Remove order
- `setSelectedOrder(order)` - Set currently selected order
- `updateOrderStatus({ orderId, status })` - Update order status
- `setLoading(boolean)` - Set loading state
- `setError(message)` - Set error message

**Usage Pattern:**
```typescript
// In component
useEffect(() => {
  dispatch(setLoading(true));
  getOrders()
    .then(orders => dispatch(setOrders(orders)))
    .catch(err => dispatch(setError(err.message)));
}, []);
```

---

### 5. Hubs Slice

**Location:** `src/store/hubsSlice.ts`

**Purpose:** Manages hub master data and inventory.

**State Shape:**
```typescript
{
  hubs: Hub[],
  loading: boolean,
  error: string | null,
  selectedHub: Hub | null
}

interface Hub {
  id: string,
  name: string,
  type: "hub",
  address: string,
  coordinates: { lat: number, lng: number },
  products?: HubProduct[]
}

interface HubProduct {
  productId: string,
  productName: string,
  quantity: number
}
```

**Actions:**
- `fetchHubs()` - Async thunk to fetch hubs
- `setHubs(hubs)` - Set all hubs
- `addHub(hub)` - Add new hub
- `updateHub(hub)` - Update existing hub
- `deleteHub(hubId)` - Remove hub
- `setSelectedHub(hub)` - Set selected hub
- `updateHubProducts({ hubId, products })` - Update hub inventory
- `addProductToHub({ hubId, product })` - Add product to hub
- `removeProductFromHub({ hubId, productId })` - Remove product from hub

**Async Operations:**
```typescript
// Using createAsyncThunk
export const fetchHubs = createAsyncThunk(
  'hubs/fetchHubs',
  async () => {
    return await getHubs();
  }
);

// In component
dispatch(fetchHubs());
```

---

### 6. Terminals Slice

**Location:** `src/store/terminalsSlice.ts`

**Purpose:** Manages terminal locations and inventory.

Similar structure to Hubs Slice.

**State Shape:**
```typescript
{
  terminals: Terminal[],
  loading: boolean,
  error: string | null,
  selectedTerminal: Terminal | null
}
```

---

### 7. Products Slice

**Location:** `src/store/productsSlice.ts`

**Purpose:** Product catalog and stock management.

**State Shape:**
```typescript
{
  products: Product[],
  loading: boolean,
  error: string | null,
  selectedProduct: Product | null
}

interface Product {
  id: string,
  name: string,
  sku: string,
  category: string,
  price: number,
  unit: "kg" | "liter" | "piece" | "box" | "ton",
  description: string,
  stockQuantity: number
}
```

**Actions:**
- `setProducts(products)`
- `addProduct(product)`
- `updateProduct(product)`
- `deleteProduct(productId)`
- `setSelectedProduct(product)`
- `updateStockQuantity({ productId, quantity })` - Set stock level
- `decrementStock({ productId, amount })` - Decrease stock
- `incrementStock({ productId, amount })` - Increase stock

---

### 8. Drivers Slice

**Location:** `src/store/driversSlice.ts`

**Purpose:** Driver roster and profile management.

**State Shape:**
```typescript
{
  drivers: Driver[],
  loading: boolean,
  error: string | null,
  selectedDriver: Driver | null
}

interface Driver {
  id: string,
  name: string,
  license: string,
  phone: string,
  email?: string,
  status?: string
}
```

---

### 9. Vehicles Slice

**Location:** `src/store/vehiclesSlice.ts`

**Purpose:** Fleet vehicle management and location tracking.

**State Shape:**
```typescript
{
  vehicles: Vehicle[],
  loading: boolean,
  error: string | null,
  selectedVehicle: Vehicle | null
}

interface Vehicle {
  id: string,
  registration: string,
  capacity: number,
  type: string,
  currentLocation: { lat: number, lng: number }
}
```

**Special Actions:**
- `updateVehicleLocation({ vehicleId, location })` - Update GPS coordinates

---

### 10. Vehicle Allocations Slice

**Location:** `src/store/vehicleAllocationsSlice.ts`

**Purpose:** Vehicle-to-driver allocation management.

**State Shape:**
```typescript
{
  allocations: VehicleAllocation[],
  loading: boolean,
  error: string | null,
  selectedAllocation: VehicleAllocation | null
}

interface VehicleAllocation {
  id: string,
  date: string,
  vehicleId: string,
  driverId: string,
  shiftId?: string,
  status: "allocated" | "completed" | "pending" | "cancelled"
}
```

**Selectors:**
- `getAllocationByVehicle(vehicleId)` - Get allocations for vehicle
- `getAllocationByDriver(driverId)` - Get allocations for driver

**Actions:**
- `updateAllocationStatus({ allocationId, status })` - Update status

---

### 11. Fleet Tracking Slice

**Location:** `src/store/fleetTrackingSlice.ts`

**Purpose:** Real-time fleet location tracking and filtering.

**State Shape:**
```typescript
{
  locations: FleetLocation[],
  filteredLocations: FleetLocation[],
  filters: {
    driverId: string | null,
    vehicleId: string | null,
    status: string | null
  },
  loading: boolean,
  error: string | null,
  lastUpdated: string | null,
  autoRefresh: boolean
}

interface FleetLocation {
  id: string,
  vehicleId: string,
  vehicleRegistration: string,
  vehicleType: string,
  driverId: string,
  driverName: string,
  driverPhone: string,
  currentLocation: { lat: number, lng: number },
  status: "active" | "idle" | "offline",
  lastUpdated: string,
  speed?: number,
  allocationId?: string,
  shiftId?: string
}
```

**Async Thunks:**
```typescript
export const fetchFleetLocations = createAsyncThunk(
  'fleetTracking/fetchLocations',
  async () => {
    return await getFleetLocations();
  }
);
```

**Actions:**
- `setDriverFilter(driverId)` - Filter by driver
- `setVehicleFilter(vehicleId)` - Filter by vehicle
- `setStatusFilter(status)` - Filter by status
- `clearFilters()` - Reset all filters
- `toggleAutoRefresh()` - Toggle auto-refresh
- `setAutoRefresh(boolean)` - Set auto-refresh state

**Filter Logic:**
Filters are applied using a helper function that updates `filteredLocations`:
```typescript
function applyFilters(state) {
  let filtered = state.locations;
  
  if (state.filters.driverId) {
    filtered = filtered.filter(loc => loc.driverId === state.filters.driverId);
  }
  // ... apply other filters
  
  state.filteredLocations = filtered;
}
```

---

### 12. Deliveries Slice

**Location:** `src/store/deliveriesSlice.ts`

**Purpose:** Delivery status and management for driver workflow.

**State Shape:**
```typescript
{
  deliveries: DeliveryWithDetails[],
  loading: boolean,
  error: string | null
}

interface DeliveryWithDetails {
  id: string,
  shiftId: string,
  orderId: string,
  status: "pending" | "in-progress" | "completed" | "failed",
  failureReason: string | null,
  // Enriched fields
  order?: OrderDetails,
  destination?: DestinationDetails,
  product?: ProductDetails
}
```

**Actions:**
- `setDeliveries(deliveries)` - Set all deliveries
- `updateDeliveryStatus({ deliveryId, status, failureReason? })` - Update status

---

## State Management Patterns

### Pattern 1: Async Thunks for API Calls

**When to use:** Complex async operations with loading/error states

```typescript
export const fetchHubs = createAsyncThunk(
  'hubs/fetchHubs',
  async () => {
    return await getHubs();
  }
);

// In slice
extraReducers: (builder) => {
  builder
    .addCase(fetchHubs.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchHubs.fulfilled, (state, action) => {
      state.loading = false;
      state.hubs = action.payload;
    })
    .addCase(fetchHubs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
}
```

---

### Pattern 2: Optimistic Updates

**When to use:** Immediate UI feedback before API confirmation

```typescript
// Dispatch update action immediately
dispatch(updateOrder(updatedOrder));

// Then call API
updateOrderAPI(orderId, updatedOrder)
  .catch(error => {
    // Revert on error
    dispatch(setError(error.message));
    dispatch(fetchOrders());
  });
```

---

### Pattern 3: Derived State / Selectors

**When to use:** Computed values based on state

```typescript
// In component
const activeOrders = useAppSelector((state) => 
  state.orders.orders.filter(order => order.status === 'active')
);

// Or create reusable selector
export const selectActiveOrders = (state: RootState) =>
  state.orders.orders.filter(order => order.status === 'active');
```

---

### Pattern 4: Normalized State

**Current approach:** Flat arrays of objects
**Consideration:** For large datasets, consider normalizing:

```typescript
// Instead of: orders: Order[]
{
  orders: {
    byId: { [orderId]: Order },
    allIds: string[]
  }
}
```

---

## Data Flow

### Complete Data Flow Example: Creating an Order

1. **User Action:** Clicks "Create Order" button
2. **Component:** Opens OrderForm modal
3. **Form Submission:** Validates with Zod schema
4. **Dispatch Action:** `dispatch(setLoading(true))`
5. **API Call:** `createOrder(orderData)` in `services/api.ts`
6. **Backend:** json-server creates order
7. **API Response:** Returns created order
8. **Dispatch Success:** `dispatch(addOrder(newOrder))`
9. **State Update:** Redux adds order to `state.orders.orders`
10. **Re-render:** Component reads updated state and displays new order

---

## State Persistence

### LocalStorage Integration

Only `theme.colorMode` is persisted to localStorage:

```typescript
// On init
const initialState = {
  colorMode: localStorage.getItem('chakra-ui-color-mode') || 'light'
};

// On change
toggleColorMode: (state) => {
  state.colorMode = state.colorMode === 'dark' ? 'light' : 'dark';
  localStorage.setItem('chakra-ui-color-mode', state.colorMode);
}
```

**Considerations for future:**
- Persist user authentication
- Cache master data (hubs, terminals, products)
- Save user preferences and filters

---

## Redux DevTools

Redux DevTools is automatically enabled in development mode with Redux Toolkit.

**Usage:**
1. Install Redux DevTools browser extension
2. Open DevTools → Redux tab
3. Inspect state, actions, and time-travel debug

---

## Best Practices

### 1. Action Naming Convention
- Use past tense: `setOrders`, `addOrder`, `updateOrder`
- Namespace when exported: `setOrdersLoading` vs `setHubsLoading`

### 2. Async Operations
- Use `createAsyncThunk` for complex operations
- Handle pending, fulfilled, rejected states
- Set loading flags appropriately

### 3. Error Handling
- Store error messages in state
- Display errors in UI via Chakra Toast
- Clear errors on retry

### 4. Component Best Practices
```typescript
// ✅ Good: Use typed hooks
const dispatch = useAppDispatch();
const orders = useAppSelector(state => state.orders.orders);

// ❌ Bad: Use plain hooks
const dispatch = useDispatch();
const orders = useSelector(state => state.orders.orders);
```

### 5. Avoid Over-Fetching
- Fetch data once on mount
- Use cached data when possible
- Implement smart refetch logic

### 6. Keep Slices Focused
- Each slice manages one domain
- Avoid cross-slice dependencies
- Use selectors for computed values

---

## Performance Optimization

### 1. Memoization
Use `reselect` for expensive selectors:
```typescript
import { createSelector } from '@reduxjs/toolkit';

export const selectActiveOrdersCount = createSelector(
  (state: RootState) => state.orders.orders,
  (orders) => orders.filter(o => o.status === 'active').length
);
```

### 2. Splitting Large States
Consider lazy loading slices for large applications.

### 3. Avoiding Unnecessary Re-renders
```typescript
// ✅ Select only what you need
const orderId = useAppSelector(state => state.orders.selectedOrder?.id);

// ❌ Selecting entire object causes re-renders
const selectedOrder = useAppSelector(state => state.orders.selectedOrder);
```

---

## Testing State Management

The project uses **Vitest** and **React Testing Library** for testing Redux state management.

### Test Infrastructure

**Test Utilities:** `src/test/test-utils.tsx`

Custom render function that provides Redux store and Chakra UI:
```typescript
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ChakraProvider } from '@chakra-ui/react';

export function renderWithProviders(ui, { store, ...options } = {}) {
  return render(
    <Provider store={store}>
      <ChakraProvider>
        {ui}
      </ChakraProvider>
    </Provider>,
    options
  );
}
```

**API Mocking:** `src/test/mocks/`
- `handlers.ts` - MSW request handlers for all API endpoints
- `server.ts` - MSW server configuration

### Unit Testing Reducers
```typescript
import { describe, it, expect } from 'vitest';
import reducer, { addOrder } from './ordersSlice';

describe('ordersSlice', () => {
  it('should add order to state', () => {
    const initialState = { orders: [], loading: false, error: null };
    const newOrder = { id: '1', /* ... */ };
    
    const nextState = reducer(initialState, addOrder(newOrder));
    
    expect(nextState.orders).toHaveLength(1);
    expect(nextState.orders[0]).toEqual(newOrder);
  });
});
```

### Integration Testing with Redux

**Location:** `src/test/integration/`

**Example test files:**
- `api.test.ts` - API service and Redux integration
- `order-management.test.tsx` - Order CRUD with Redux
- `delivery-management.test.tsx` - Delivery workflow with Redux
- `vehicle-allocation.test.tsx` - Allocation operations with Redux

**Integration test pattern:**
```typescript
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { renderWithProviders } from '../test-utils';
import { server } from '../mocks/server';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('should update order status', async () => {
  const user = userEvent.setup();
  renderWithProviders(<OrdersPage />);
  
  await user.click(screen.getByText('Mark as Completed'));
  
  await waitFor(() => {
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });
});
```

### Running Tests
```bash
npm test              # Run all tests in watch mode
npm test:ui           # Interactive test UI
npm test:coverage     # Generate coverage report
```

### Coverage Reports
Coverage reports are generated in the `coverage/` directory with:
- HTML reports for visual inspection
- LCOV format for CI/CD integration
- Text summary in terminal

---

## Debugging Tips

1. **Use Redux DevTools:** Inspect every action and state change
2. **Log Actions:** Add console.log in reducers during development
3. **Check Network Tab:** Verify API calls match expectations
4. **Time Travel:** Use DevTools to replay actions and find bugs

---

## Migration Guide (Future)

If migrating to another state management solution:

### Redux Toolkit → Zustand
- Replace slices with Zustand stores
- Remove connect/useSelector
- Simpler API, less boilerplate

### Redux Toolkit → React Query + Context
- Use React Query for server state
- Use Context for UI state
- Better separation of concerns

