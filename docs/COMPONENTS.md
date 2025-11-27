# Component Hierarchy and Responsibilities

## Overview

The Fleet Tracking Platform follows a hierarchical component structure organized by feature and role (Admin/Driver). This document outlines the component architecture, responsibilities, and relationships.

## Application Structure

```
App (Root)
├── RoleAutoSwitch (Wrapper)
├── Sidebar (Navigation)
├── Header (Top Bar)
└── Routes (Page Container)
    ├── Admin Pages
    └── Driver Pages
```

---

## Core Layout Components

### `App.tsx`
**Location:** `src/app/App.tsx`

**Responsibility:** Root application component that establishes the main layout structure.

**Features:**
- Integrates routing system using React Router
- Provides fixed sidebar and header layout
- Wraps application in RoleAutoSwitch for role-based behavior
- Wraps application in ErrorBoundary for error handling
- Sets up main content area with scrolling

**Children:**
- `ErrorBoundary` - Top-level error catching
- `RoleAutoSwitch` - Role management wrapper
- `Sidebar` - Left navigation panel
- `Header` - Top navigation bar
- Route-based page components

---

### Error Boundaries

#### `ErrorBoundary.tsx`
**Location:** `src/components/ErrorBoundary.tsx`

**Responsibility:** Top-level error boundary for catching and displaying React errors.

**Features:**
- Catches JavaScript errors anywhere in the component tree
- Displays fallback UI when errors occur
- Logs error information for debugging
- Prevents entire app crashes

**Usage:**
```tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

#### `FormErrorBoundary.tsx`
**Location:** `src/components/FormErrorBoundary.tsx`

**Responsibility:** Specialized error boundary for form components.

**Features:**
- Catches form-specific errors
- Provides user-friendly error messages
- Prevents form crashes from breaking entire page
- Can reset error state when form is closed

**Usage:**
```tsx
<FormErrorBoundary>
  <OrderForm />
</FormErrorBoundary>
```

---

#### `MapErrorBoundary.tsx`
**Location:** `src/components/MapErrorBoundary.tsx`

**Responsibility:** Error boundary specifically for Mapbox GL components.

**Features:**
- Catches Mapbox-specific errors (token issues, network failures)
- Displays map-specific fallback UI
- Handles WebGL errors gracefully
- Provides helpful error messages for map issues

**Usage:**
```tsx
<MapErrorBoundary>
  <LiveFleetMap />
</MapErrorBoundary>
```

---

### `Sidebar.tsx`
**Location:** `src/components/Sidebar.tsx`

**Responsibility:** Dynamic navigation menu that adapts based on user role.

**Features:**
- Role-based menu items (Admin vs Driver)
- Expandable/collapsible menu sections
- Active route highlighting
- Nested sub-menu support for Admin Dashboard
- Fleet Nitro branding and logo

**Menu Structure:**

**Admin Menu:**
- Admin Dashboard (expandable)
  - Hubs
  - Terminals
  - Products
  - Drivers
  - Vehicles
- Orders
- Vehicle Allocation
- Inventory
- Live Fleet

**Driver Menu:**
- Shift View
- Live Map
- Delivery Management
- Shift History

**Redux Dependencies:**
- Reads: `state.user.role`

---

### `Header.tsx`
**Location:** `src/components/Header.tsx`

**Responsibility:** Top navigation bar with user actions and system controls.

**Features:**
- Page title/breadcrumb display
- Search functionality
- Notification center
- User profile dropdown
- Theme toggle (Light/Dark mode)
- Role switching capability (for development)

**Redux Dependencies:**
- Reads: `state.theme.colorMode`, `state.user.role`
- Dispatches: `toggleColorMode`, `toggleUserRole`

---

## Routing Components

### `routes.tsx`
**Location:** `src/app/routes.tsx`

**Responsibility:** Central route configuration for the application.

**Features:**
- Defines all application routes
- Exports `ROUTE_PATHS` constant for type-safe navigation
- Handles default redirects
- 404 fallback routing

**Route Categories:**
1. **Admin Routes** (`/admin/*`)
   - Dashboard, Master Data, Orders, Allocation, Inventory, Live Fleet
2. **Driver Routes** (`/driver/*`)
   - Shift View, Live Map, Delivery Management, History

---

### `RoleAutoSwitch.tsx`
**Location:** `src/components/RoleAutoSwitch.tsx`

**Responsibility:** Automatically switches user role based on URL path.

**Features:**
- Detects `/admin/*` and `/driver/*` routes
- Updates Redux user role state accordingly
- Sets appropriate user ID for testing
- Seamless role switching without page reload

**Redux Dependencies:**
- Dispatches: `setUserRole`, `setUserId`

---

### `RoleBasedRedirect.tsx`
**Location:** `src/components/RoleBasedRedirect.tsx`

**Responsibility:** Redirects users to appropriate dashboard based on role.

**Features:**
- Redirects admin → `/admin/dashboard`
- Redirects driver → `/driver/shift-view`
- Used for root path and 404 handling

---

### `RoleGuard.tsx`
**Location:** `src/components/RoleGuard.tsx`

**Responsibility:** Protected route wrapper that enforces role-based access.

**Features:**
- Validates user role matches allowed role
- Redirects to appropriate dashboard if unauthorized
- Can be wrapped around any route/component

**Usage:**
```tsx
<RoleGuard allowedRole="admin">
  <AdminOnlyPage />
</RoleGuard>
```

---

## Admin Pages

### Dashboard & Analytics

#### `Dashboard.tsx`
**Location:** `src/pages/admin/Dashboard/Dashboard.tsx`

**Responsibility:** Admin overview with key metrics and analytics.

**Components Used:**
- `StatCard` - Displays KPI metrics
- `EarningReportsCard` - Revenue visualization
- `RevenueGeneratedCard` - Revenue breakdown
- `WebsiteAnalyticsCard` - Traffic and analytics
- `SupportTrackerCard` - Support metrics

**Tests:**
- Component tests may exist in `src/components/dashboard/__tests__/`

---

### Master Data Management

#### `HubsPage/index.tsx`
**Location:** `src/pages/admin/MasterData/HubsPage/index.tsx`

**Responsibility:** CRUD operations for distribution hubs.

**Features:**
- List view with search and filters
- Create/Edit modal via `HubModal.tsx`
- Inventory management per hub
- Coordinate/location management

**Sub-components:**
- `HubModal.tsx` - Form for creating/editing hubs

**Redux Dependencies:**
- Reads: `state.hubs`
- Dispatches: Hub CRUD actions

---

#### `TerminalsPage/index.tsx`
**Location:** `src/pages/admin/MasterData/TerminalsPage/index.tsx`

**Responsibility:** CRUD operations for delivery terminals.

**Features:**
- List view with data table
- Create/Edit modal via `TerminalModal.tsx`
- Location-based terminal management

**Sub-components:**
- `TerminalModal.tsx` - Form for creating/editing terminals

---

#### `ProductsPage/index.tsx`
**Location:** `src/pages/admin/MasterData/ProductsPage/index.tsx`

**Responsibility:** Product catalog management.

**Features:**
- Product listing with categories
- SKU and pricing management
- Stock quantity tracking
- Create/Edit modal via `ProductModal.tsx`

**Sub-components:**
- `ProductModal.tsx` - Form for creating/editing products

---

#### `DriversPage/index.tsx`
**Location:** `src/pages/admin/MasterData/DriversPage/index.tsx`

**Responsibility:** Driver management and profiles.

**Features:**
- Driver roster
- License and contact information
- Status tracking
- Create/Edit modal via `DriverModal.tsx`

**Sub-components:**
- `DriverModal.tsx` - Form for creating/editing drivers

---

#### `VehiclesPage/index.tsx`
**Location:** `src/pages/admin/MasterData/VehiclesPage/index.tsx`

**Responsibility:** Fleet vehicle management.

**Features:**
- Vehicle registry
- Capacity and type management
- Current location tracking
- Create/Edit modal via `VehicleModal.tsx`

**Sub-components:**
- `VehicleModal.tsx` - Form for creating/editing vehicles

---

### Operations Management

#### `OrdersPage.tsx`
**Location:** `src/pages/admin/Orders/OrdersPage.tsx`

**Responsibility:** Order management and tracking.

**Features:**
- Order listing with status filters
- Driver assignment
- Delivery scheduling
- Status workflow management

**Related Pages:**
- `OrderForm.tsx` - Create/Edit orders
- `OrderDetailPage.tsx` - View order details

---

#### `VehicleAllocationPage.tsx`
**Location:** `src/pages/admin/VehicleAllocation/VehicleAllocationPage.tsx`

**Responsibility:** Assign vehicles to drivers for specific dates.

**Features:**
- Calendar-based allocation view
- Availability checking
- Allocation status management
- Create/Edit modal via `AllocationModal.tsx`

**Sub-components:**
- `AllocationModal.tsx` - Form for creating allocations

**Redux Dependencies:**
- Reads: `state.vehicleAllocations`, `state.vehicles`, `state.drivers`

---

#### `InventoryDashboardPage.tsx`
**Location:** `src/pages/admin/Inventory/InventoryDashboardPage.tsx`

**Responsibility:** Hub and terminal inventory overview.

**Features:**
- Real-time inventory levels
- Hub/Terminal inventory breakdown
- Stock alerts and warnings
- Product distribution visualization

---

#### `LiveFleetMapPage.tsx`
**Location:** `src/pages/admin/LiveFleet/LiveFleetMapPage.tsx`

**Responsibility:** Real-time fleet tracking on interactive map.

**Features:**
- Mapbox GL integration
- Vehicle location markers
- Driver information overlays
- Status-based filtering
- Auto-refresh functionality

**Redux Dependencies:**
- Reads: `state.fleetTracking`
- Dispatches: `fetchFleetLocations`

---

## Driver Pages

### `ShiftViewPage.tsx`
**Location:** `src/pages/driver/ShiftView/ShiftViewPage.tsx`

**Responsibility:** Driver's current shift overview and management.

**Features:**
- Shift start/end controls
- Assigned vehicle information
- Delivery list for the shift
- Real-time status updates

**Redux Dependencies:**
- Reads: `state.user.userId`, shift and delivery data
- Dispatches: Shift status updates

---

### `DriverLiveMapPage.tsx`
**Location:** `src/pages/driver/DriverLiveMap/DriverLiveMapPage.tsx`

**Responsibility:** Driver's GPS tracking and navigation view.

**Features:**
- Mapbox GL integration
- Current location tracking
- Delivery destinations
- Route optimization
- GPS simulation (development)

**Redux Dependencies:**
- Reads: Driver's shift and location data

---

### `DeliveryManagementPage.tsx`
**Location:** `src/pages/driver/DeliveryManagement/DeliveryManagementPage.tsx`

**Responsibility:** Delivery execution and status management.

**Features:**
- Active deliveries list
- Mark as completed/failed
- Failure reason capture
- Delivery details (destination, product, quantity)

**Redux Dependencies:**
- Reads: `state.deliveries`, `state.user.userId`
- Dispatches: Delivery status updates

---

### `ShiftHistoryPage.tsx`
**Location:** `src/pages/driver/ShiftHistory/ShiftHistoryPage.tsx`

**Responsibility:** Historical view of past shifts and deliveries.

**Features:**
- Shift list with dates
- Delivery completion statistics
- Performance metrics
- Filter by date range

---

## Reusable Dashboard Components

### `StatCard.tsx`
**Location:** `src/components/dashboard/StatCard.tsx`

**Responsibility:** Display KPI metrics with trend indicators.

**Props:**
- `title`: Metric name
- `value`: Current value
- `change`: Percentage change
- `trend`: "up" | "down"
- `icon`: React Icon component

---

### `EarningReportsCard.tsx`
**Location:** `src/components/dashboard/EarningReportsCard.tsx`

**Responsibility:** Visualize earning trends with charts.

---

### `RevenueGeneratedCard.tsx`
**Location:** `src/components/dashboard/RevenueGeneratedCard.tsx`

**Responsibility:** Show revenue breakdown by category.

---

### `WebsiteAnalyticsCard.tsx`
**Location:** `src/components/dashboard/WebsiteAnalyticsCard.tsx`

**Responsibility:** Display analytics metrics and graphs.

---

### `SupportTrackerCard.tsx`
**Location:** `src/components/dashboard/SupportTrackerCard.tsx`

**Responsibility:** Track support tickets and response times.

---

## Component Design Patterns

### Pattern 1: Modal-Based CRUD
Most master data pages follow this pattern:
1. Main page displays data table/list
2. "Add New" button opens modal
3. Edit button opens modal with populated data
4. Modal uses React Hook Form + Zod validation
5. Submit dispatches Redux action and API call

**Example:** HubsPage + HubModal

---

### Pattern 2: Redux-Connected Pages
Pages connect to Redux for state management:
```tsx
const data = useAppSelector((state) => state.entityName);
const dispatch = useAppDispatch();
```

---

### Pattern 3: Role-Based Rendering
Components adapt based on user role:
```tsx
const { role } = useSelector((state) => state.user);
{role === 'admin' ? <AdminView /> : <DriverView />}
```

---

## Component Communication Flow

```
User Interaction
    ↓
Component Event Handler
    ↓
Redux Action Dispatch
    ↓
API Call (services/api.ts)
    ↓
Backend (json-server)
    ↓
Redux State Update
    ↓
Component Re-render
```

---

## Testing Components

The codebase includes comprehensive testing infrastructure:

### Unit Tests
**Location:** `src/components/__tests__/`

**Test Files:**
- `Header.test.tsx` - Header component tests
- `RoleGuard.test.tsx` - Role-based access control tests
- `src/components/dashboard/__tests__/StatCard.test.tsx` - StatCard component tests

### Integration Tests
**Location:** `src/test/integration/`

**Test Files:**
- `api.test.ts` - API service tests
- `delivery-management.test.tsx` - Delivery workflow tests
- `order-management.test.tsx` - Order management tests
- `vehicle-allocation.test.tsx` - Vehicle allocation tests

### Test Utilities
- `src/test/test-utils.tsx` - Custom render with Redux and Chakra providers
- `src/test/setup.ts` - Test environment configuration
- `src/test/mocks/` - MSW handlers for API mocking

**Running Tests:**
```bash
npm test              # Run tests in watch mode
npm test:ui           # Run tests with UI
npm test:coverage     # Generate coverage report
```

---

## Best Practices

1. **Keep components focused:** Each component has a single responsibility
2. **Reuse common components:** StatCard, modals, tables
3. **Use Chakra UI primitives:** Leverage built-in components and theming
4. **Type safety:** All components use TypeScript interfaces
5. **Redux for shared state:** Local state for UI-only concerns
6. **Async operations:** Handle in Redux thunks or component useEffect
7. **Error boundaries:** Wrap error-prone components in appropriate error boundaries
8. **Test coverage:** Write tests for complex components and user workflows

---

## Adding New Components

To add a new page/component:

1. Create file in appropriate directory (`pages/admin` or `pages/driver`)
2. Define component with TypeScript interface for props
3. Connect to Redux if needed
4. Add route to `routes.tsx`
5. Add menu item to `Sidebar.tsx` if applicable
6. Export from parent index if using subdirectories

---

## Component Dependencies

### External Libraries
- **React Router** - Navigation and routing
- **Chakra UI** - Component library and theming
- **React Redux** - State management connection
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Mapbox GL** - Interactive maps
- **React Icons** - Icon library

### Internal Dependencies
- All pages depend on `src/store` for state management
- All pages depend on `src/services/api.ts` for data fetching
- Modal components depend on parent pages for open/close state
- Navigation components depend on `routes.tsx` for path constants

