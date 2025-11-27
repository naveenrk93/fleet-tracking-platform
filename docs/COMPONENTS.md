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
**Location:** `src/components/ErrorBoundary/ErrorBoundary.tsx`

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
**Location:** `src/components/FormErrorBoundary/FormErrorBoundary.tsx`

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
**Location:** `src/components/MapErrorBoundary/MapErrorBoundary.tsx`

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
**Location:** `src/components/Sidebar/Sidebar.tsx`

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
**Location:** `src/components/Header/Header.tsx`

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
**Location:** `src/components/RoleAutoSwitch/RoleAutoSwitch.tsx`

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
**Location:** `src/utils/RoleBasedRedirect.tsx`

**Responsibility:** Redirects users to appropriate dashboard based on role.

**Features:**
- Redirects admin → `/admin/dashboard`
- Redirects driver → `/driver/shift-view`
- Used for root path and 404 handling

---

### `RoleGuard.tsx`
**Location:** `src/components/RoleGuard/RoleGuard.tsx`

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

## Reusable UI Components

### `DataTable.tsx`
**Location:** `src/components/DataTable/datatable.tsx`

**Responsibility:** Reusable data table component with sorting, pagination, and actions.

**Features:**
- Column-based configuration
- Sort by column (ascending/descending)
- Row actions (Edit, Delete)
- Loading skeleton states
- Responsive design
- TypeScript generic support

**Props:**
- `data: T[]` - Array of data objects
- `columns: Column<T>[]` - Column definitions
- `onEdit?: (item: T) => void` - Edit handler
- `onDelete?: (item: T) => void` - Delete handler
- `isLoading?: boolean` - Loading state

**Usage:**
```tsx
<DataTable
  data={hubs}
  columns={[
    { key: 'name', label: 'Hub Name', sortable: true },
    { key: 'address', label: 'Address', sortable: false }
  ]}
  onEdit={(hub) => openEditModal(hub)}
  onDelete={(hub) => handleDelete(hub.id)}
  isLoading={loading}
/>
```

---

### `SearchInput.tsx`
**Location:** `src/components/SearchInput/SearchInput.tsx`

**Responsibility:** Reusable search input with debouncing and clear functionality.

**Features:**
- Debounced search (configurable delay)
- Clear button
- Search icon
- Customizable placeholder
- TypeScript support

**Props:**
- `value: string` - Current search value
- `onChange: (value: string) => void` - Change handler
- `placeholder?: string` - Input placeholder
- `debounceMs?: number` - Debounce delay (default: 300ms)

**Usage:**
```tsx
<SearchInput
  value={searchTerm}
  onChange={setSearchTerm}
  placeholder="Search hubs..."
  debounceMs={500}
/>
```

---

### `StatusBadge.tsx`
**Location:** `src/components/StatusBadge/StatusBadge.tsx`

**Responsibility:** Display status with appropriate color coding.

**Features:**
- Color-coded badges
- Predefined status mappings
- Customizable colors
- Responsive sizing

**Props:**
- `status: string` - Status value
- `colorScheme?: string` - Override color scheme

**Status Colors:**
- `pending` / `allocated` → yellow
- `completed` / `active` → green
- `cancelled` / `failed` → red
- `in-progress` / `in-transit` → blue

**Usage:**
```tsx
<StatusBadge status="completed" />
<StatusBadge status="pending" colorScheme="purple" />
```

---

### `PageHeader.tsx`
**Location:** `src/components/PageHeader/PageHeader.tsx`

**Responsibility:** Consistent page header with title and action buttons.

**Features:**
- Page title display
- Action button area
- Breadcrumb support
- Responsive layout

**Props:**
- `title: string` - Page title
- `actions?: ReactNode` - Action buttons/components
- `breadcrumbs?: ReactNode` - Optional breadcrumb navigation

**Usage:**
```tsx
<PageHeader
  title="Hubs Management"
  actions={
    <Button onClick={handleAdd}>Add New Hub</Button>
  }
/>
```

---

### `ConfirmDialog.tsx`
**Location:** `src/components/ConfirmDialog/ConfirmDialog.tsx`

**Responsibility:** Reusable confirmation dialog for destructive actions.

**Features:**
- Customizable title and message
- Confirm/Cancel buttons
- Color-coded confirm button
- Chakra UI Modal integration

**Props:**
- `isOpen: boolean` - Dialog visibility
- `onClose: () => void` - Close handler
- `onConfirm: () => void` - Confirm handler
- `title: string` - Dialog title
- `message: string` - Confirmation message
- `confirmText?: string` - Confirm button text (default: "Confirm")
- `cancelText?: string` - Cancel button text (default: "Cancel")
- `confirmColorScheme?: string` - Button color (default: "red")

**Usage:**
```tsx
<ConfirmDialog
  isOpen={isDeleteOpen}
  onClose={() => setIsDeleteOpen(false)}
  onConfirm={handleDelete}
  title="Delete Hub"
  message="Are you sure you want to delete this hub? This action cannot be undone."
  confirmText="Delete"
  confirmColorScheme="red"
/>
```

---

### `MasterDataModal.tsx`
**Location:** `src/components/MasterDataModal/MasterDataModal.tsx`

**Responsibility:** Generic modal wrapper for master data create/edit forms.

**Features:**
- Consistent modal layout
- Title and close button
- Form content area
- Footer with action buttons
- Responsive sizing

**Props:**
- `isOpen: boolean` - Modal visibility
- `onClose: () => void` - Close handler
- `title: string` - Modal title
- `children: ReactNode` - Form content
- `size?: string` - Modal size (default: "xl")

**Usage:**
```tsx
<MasterDataModal
  isOpen={isOpen}
  onClose={onClose}
  title={editingHub ? "Edit Hub" : "Create Hub"}
  size="2xl"
>
  <HubForm onSubmit={handleSubmit} initialData={editingHub} />
</MasterDataModal>
```

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

1. **Create component folder and file:**
   - For shared components: `src/components/ComponentName/ComponentName.tsx`
   - For pages: `src/pages/admin` or `src/pages/driver`
   
2. **Define component with TypeScript:**
   ```tsx
   interface ComponentNameProps {
     title: string;
     // ... other props
   }
   
   export const ComponentName: React.FC<ComponentNameProps> = ({ title }) => {
     // ... component implementation
   };
   ```

3. **Export from index file:**
   - Add to `src/components/index.ts` for shared components:
     ```typescript
     export { ComponentName } from './ComponentName/ComponentName';
     ```

4. **Connect to Redux if needed:**
   ```tsx
   import { useAppSelector, useAppDispatch } from '@/store/hooks';
   const data = useAppSelector(state => state.entityName);
   const dispatch = useAppDispatch();
   ```

5. **Add route to `routes.tsx` (for pages):**
   ```typescript
   { path: "/admin/new-page", element: <NewPage /> }
   ```

6. **Add menu item to `Sidebar.tsx` (if applicable):**
   ```tsx
   <MenuItem icon={MdIcon} path="/admin/new-page">New Page</MenuItem>
   ```

7. **Add tests:**
   - Unit tests in `__tests__` folder next to component
   - Integration tests in `src/test/integration/`

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
- **Framer Motion** - Animations and transitions

### Internal Dependencies
- All pages depend on `src/store` for state management
- All pages depend on `src/services/api.ts` for data fetching
- Modal components depend on parent pages for open/close state
- Navigation components depend on `routes.tsx` for path constants

### Import Patterns

**Component Imports:**
```typescript
// From centralized exports
import { Header, Sidebar, DataTable, StatusBadge } from '@/components';

// Direct imports (alternative)
import { Header } from '@/components/Header/Header';
import { DataTable } from '@/components/DataTable/datatable';
```

**Store Imports:**
```typescript
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setOrders, addOrder } from '@/store/ordersSlice';
```

**Service Imports:**
```typescript
import { getOrders, createOrder } from '@/services/api';
```

**Import Aliases:**
- `@/` → `src/` (configured in vitest.config.ts for test files)
- Production code can use either relative imports or the `@/` alias
- Test files consistently use `@/` alias for cleaner imports

