# Admin Pages Structure

## Folder Hierarchy

```
src/pages/
├── admin/
│   ├── Dashboard.tsx                           # Main admin dashboard with stats
│   ├── MasterData/
│   │   ├── HubsPage.tsx                       # Hubs management
│   │   ├── TerminalsPage.tsx                  # Terminals management
│   │   ├── ProductsPage.tsx                   # Products management
│   │   ├── DriversPage.tsx                    # Drivers management
│   │   └── VehiclesPage.tsx                   # Vehicles management
│   ├── Orders/
│   │   ├── OrdersPage.tsx                     # Orders list/management
│   │   └── OrderForm.tsx                      # Order creation/editing form
│   ├── VehicleAllocation/
│   │   └── VehicleAllocationPage.tsx          # Vehicle allocation management
│   ├── Inventory/
│   │   └── InventoryDashboardPage.tsx         # Inventory dashboard with stats
│   └── LiveFleet/
│       └── LiveFleetMapPage.tsx               # Live fleet tracking map
└── DashboardPage.tsx                           # Original dashboard (kept)
```

## Routes Configuration

All admin routes are configured with the `/admin` prefix:

- `/admin/dashboard` - Admin Dashboard
- `/admin/master-data/hubs` - Hubs Management
- `/admin/master-data/terminals` - Terminals Management
- `/admin/master-data/products` - Products Management
- `/admin/master-data/drivers` - Drivers Management
- `/admin/master-data/vehicles` - Vehicles Management
- `/admin/orders` - Orders List
- `/admin/orders/new` - Create New Order
- `/admin/orders/edit/:id` - Edit Order
- `/admin/vehicle-allocation` - Vehicle Allocation
- `/admin/inventory` - Inventory Dashboard
- `/admin/live-fleet` - Live Fleet Map

## Sidebar Navigation

The sidebar now includes:

1. **Admin Dashboard** - Main dashboard with fleet statistics
2. **Master Data** (Collapsible Menu)
   - Hubs
   - Terminals
   - Products
   - Drivers
   - Vehicles
3. **Orders** - Order management
4. **Vehicle Allocation** - Allocate vehicles to orders
5. **Inventory** - Inventory tracking and management
6. **Live Fleet** - Real-time fleet tracking on map

## Features Implemented

### Admin Dashboard
- Stats cards showing:
  - Active Vehicles
  - Pending Orders
  - Inventory Items
  - Active Routes

### Master Data Pages
- Consistent layout with page headers
- "Add" buttons for creating new entries
- Card-based content areas ready for tables/lists

### Orders
- OrdersPage: List and manage orders
- OrderForm: Create/edit orders with form fields
- Navigation between list and form views

### Vehicle Allocation
- Split view: Pending Orders | Available Vehicles
- Auto-allocation functionality

### Inventory Dashboard
- Stats for total items, low stock, in stock, and in transit
- Content area for inventory tables/charts

### Live Fleet Map
- Status indicators (Active, Idle, Offline)
- Map integration placeholder
- Real-time tracking preparation

## Next Steps

### For Driver Pages (Not Created Yet)
When ready to implement driver pages:
```
src/pages/driver/
├── ShiftViewPage.tsx
├── DriverLiveMapPage.tsx
├── DeliveryManagementPage.tsx
└── ShiftHistoryPage.tsx
```

### Enhancements to Consider
1. Add data tables to all management pages
2. Implement actual forms with validation
3. Integrate map library (Google Maps/Mapbox) for Live Fleet
4. Add search and filter functionality
5. Implement CRUD operations with backend API
6. Add role-based access control
7. Implement real-time updates for fleet tracking

