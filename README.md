# Fleet Tracking Platform

A modern, comprehensive fleet management system built with React, TypeScript, Chakra UI, and Redux Toolkit. Features separate interfaces for administrators and drivers with real-time tracking capabilities.

## ✨ Features

### Admin Features
- 📊 **Interactive Dashboard** - Beautiful analytics cards with real-time data visualization
- 🗺️ **Live Fleet Tracking** - Real-time vehicle location tracking with Mapbox
- 📦 **Master Data Management** - Hubs, terminals, products, drivers, and vehicles
- 📋 **Order Management** - Create, assign, and track delivery orders
- 🚛 **Vehicle Allocation** - Assign vehicles to drivers with availability checking
- 📊 **Inventory Dashboard** - Track product inventory across hubs and terminals
- 🎨 **Modern UI** - Built with Chakra UI for a sleek, responsive design
- 🌓 **Dark/Light Theme** - Toggle between eye-friendly themes
- 📈 **Charts & Visualizations** - Custom SVG charts for earnings and revenue tracking

### Driver Features
- 🚗 **Shift Management** - Start/end shifts with assigned vehicle information
- 🗺️ **Live Map View** - GPS tracking and navigation with route optimization
- 📦 **Delivery Management** - View, complete, or mark deliveries as failed
- 📜 **Shift History** - Review past shifts and delivery performance

### Technical Features
- 🔄 **State Management** - Redux Toolkit for efficient state management
- 🔐 **Role-Based Access** - Automatic role switching based on routes
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- ⚡ **Fast Development** - Vite for lightning-fast HMR and builds
- 🎯 **Type-Safe** - Full TypeScript coverage with strict mode

## 🛠️ Tech Stack

### Core Technologies
- **React 19** - Latest React with new features and performance improvements
- **TypeScript 5.9** - Type-safe development with strict mode
- **Vite 7** - Lightning-fast build tool and dev server
- **Redux Toolkit 2.11** - Powerful state management with minimal boilerplate

### UI & Styling
- **Chakra UI 2.10** - Accessible component library with built-in dark mode
- **Framer Motion 12** - Smooth animations and transitions
- **React Icons 5** - Comprehensive icon library

### Routing & Forms
- **React Router 7** - Type-safe client-side routing
- **React Hook Form 7** - Performant form management
- **Zod 4** - Schema validation with TypeScript inference

### Maps & Data
- **Mapbox GL 3** - Professional real-time mapping solution
- **Axios 1** - Promise-based HTTP client
- **JSON Server** - Mock REST API for development

### Development Tools
- **ESLint 9** - Code linting with TypeScript support
- **Concurrently** - Run multiple development servers

### Testing
- **Vitest 4** - Fast unit testing framework
- **React Testing Library** - Component testing utilities
- **MSW 2** - API mocking for integration tests
- **113 Tests** - Comprehensive test coverage (Unit, Component, Integration)

## 🚀 Getting Started

### Testing

This project includes comprehensive testing with **113 passing tests**:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

**Test Coverage:**
- ✅ **69 Unit Tests**: Utility functions (formatters, validators, calculations)
- ✅ **15 Component Tests**: UI components (Header, RoleGuard, StatCard)
- ✅ **29 Integration Tests**: API operations and workflows

See [TESTING.md](docs/TESTING.md) and [TESTING_SUMMARY.md](docs/TESTING_SUMMARY.md) for detailed documentation.

### Prerequisites

- **Node.js 18+** 
- **npm or yarn**
- **Mapbox Access Token** (for map features - free tier available)

### Installation

```bash
# Install dependencies
npm install

# Start development server (runs both Vite and JSON Server)
npm run dev
```

The application will be available at:
- **Frontend:** `http://localhost:5173`
- **API (JSON Server):** `http://localhost:3001`

### Alternative: Run Servers Separately

```bash
# Terminal 1: Start Vite dev server
npm run dev:vite

# Terminal 2: Start JSON Server API
npm run dev:api
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Accessing Different Views

- **Admin Dashboard:** Navigate to `/admin` or `/admin/dashboard`
- **Driver Dashboard:** Navigate to `/driver` or `/driver/shift-view`
- The application automatically switches roles based on the URL path

## 📖 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

- **[COMPONENTS.md](./docs/COMPONENTS.md)** - Component hierarchy and responsibilities
- **[STATE_MANAGEMENT.md](./docs/STATE_MANAGEMENT.md)** - Redux state management guide
- **[DECISIONS.md](./docs/DECISIONS.md)** - Technical decisions and rationale
- **[docs/README.md](./docs/README.md)** - Documentation navigation guide

## 🎯 Key Features

### Admin Dashboard

#### 📊 Analytics Dashboard
- Real-time KPI metrics and statistics
- Revenue tracking with trend indicators
- Weekly earnings visualization
- Support ticket tracking with progress indicators
- Custom SVG charts and visualizations

#### 🗂️ Master Data Management
- **Hubs** - Distribution center management with inventory
- **Terminals** - Delivery terminal locations and stock
- **Products** - Catalog management with SKU, pricing, and stock
- **Drivers** - Driver roster with license and contact info
- **Vehicles** - Fleet management with capacity and location tracking

#### 📦 Operations
- **Orders** - Create, assign, and track delivery orders
- **Vehicle Allocation** - Assign vehicles to drivers by date
- **Inventory Dashboard** - Real-time stock levels across locations
- **Live Fleet Map** - Real-time vehicle tracking with Mapbox

### Driver Dashboard

#### 🚗 Shift Management
- View current shift details and assigned vehicle
- Start/end shift controls
- Delivery list for active shift
- Shift performance metrics

#### 🗺️ Live Tracking
- Real-time GPS location on Mapbox
- Delivery destinations visualization
- Route optimization
- GPS simulation for development

#### 📦 Delivery Execution
- View assigned deliveries
- Mark deliveries as completed
- Report failed deliveries with reason
- Destination and product details

#### 📜 History
- Past shift records
- Delivery completion statistics
- Performance analytics

## 📁 Project Structure

```
fleet-tracking-platform/
├── src/
│   ├── app/
│   │   ├── App.tsx                    # Main application layout
│   │   └── routes.tsx                 # Route configuration
│   ├── components/
│   │   ├── Header.tsx                 # Top navigation bar
│   │   ├── Sidebar.tsx                # Role-based sidebar menu
│   │   ├── RoleAutoSwitch.tsx         # Automatic role switching
│   │   ├── RoleGuard.tsx              # Protected route wrapper
│   │   ├── RoleBasedRedirect.tsx      # Default route redirects
│   │   └── dashboard/                 # Dashboard widgets
│   │       ├── StatCard.tsx
│   │       ├── EarningReportsCard.tsx
│   │       ├── RevenueGeneratedCard.tsx
│   │       ├── WebsiteAnalyticsCard.tsx
│   │       └── SupportTrackerCard.tsx
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── admin/                     # Admin pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── MasterData/            # CRUD pages for master data
│   │   │   ├── Orders/                # Order management
│   │   │   ├── VehicleAllocation/     # Vehicle assignment
│   │   │   ├── Inventory/             # Inventory dashboard
│   │   │   └── LiveFleet/             # Fleet tracking map
│   │   └── driver/                    # Driver pages
│   │       ├── ShiftViewPage.tsx
│   │       ├── DriverLiveMapPage.tsx
│   │       ├── DeliveryManagementPage.tsx
│   │       └── ShiftHistoryPage.tsx
│   ├── store/                         # Redux state management
│   │   ├── dashboardSlice.ts
│   │   ├── userSlice.ts
│   │   ├── themeSlice.ts
│   │   ├── ordersSlice.ts
│   │   ├── hubsSlice.ts
│   │   ├── terminalsSlice.ts
│   │   ├── productsSlice.ts
│   │   ├── driversSlice.ts
│   │   ├── vehiclesSlice.ts
│   │   ├── vehicleAllocationsSlice.ts
│   │   ├── fleetTrackingSlice.ts
│   │   ├── deliveriesSlice.ts
│   │   ├── hooks.ts                   # Typed Redux hooks
│   │   └── index.ts                   # Centralized exports
│   ├── services/
│   │   └── api.ts                     # API service layer
│   ├── main.tsx                       # Application entry point
│   └── store.ts                       # Redux store configuration
├── docs/                              # Comprehensive documentation
│   ├── README.md                      # Documentation guide
│   ├── COMPONENTS.md                  # Component architecture
│   ├── STATE_MANAGEMENT.md            # State management guide
│   └── DECISIONS.md                   # Technical decisions
├── db.json                            # JSON Server database
└── package.json                       # Dependencies and scripts
```

## ✅ Implementation Status

### Completed Features

**Core Infrastructure:**
- ✅ React 19 + TypeScript setup with Vite
- ✅ Redux Toolkit state management (12 slices)
- ✅ Chakra UI theming with dark/light mode
- ✅ Role-based routing and access control
- ✅ API service layer with type safety
- ✅ JSON Server mock backend

**Admin Features:**
- ✅ Analytics dashboard with charts
- ✅ Master data CRUD (Hubs, Terminals, Products, Drivers, Vehicles)
- ✅ Order management with driver assignment
- ✅ Vehicle allocation system
- ✅ Inventory dashboard
- ✅ Live fleet tracking with Mapbox

**Driver Features:**
- ✅ Shift view and management
- ✅ Live map with GPS tracking
- ✅ Delivery management (complete/fail)
- ✅ Shift history

**UI/UX:**
- ✅ Responsive sidebar navigation
- ✅ Top header with search, notifications, user menu
- ✅ Dark/light theme toggle
- ✅ Smooth animations and transitions
- ✅ Modal-based CRUD forms
- ✅ Form validation with Zod
- ✅ Comprehensive error boundaries (page, section, map, form)

### Future Enhancements

- 🔲 User authentication and authorization
- 🔲 Real-time WebSocket updates
- 🔲 Advanced analytics and reporting
- 🔲 Export functionality (PDF, Excel)
- 🔲 Email notifications
- 🔲 Mobile responsive optimizations
- 🔲 Unit and integration tests
- 🔲 Performance optimizations (lazy loading, virtualization)
- 🔲 Progressive Web App (PWA) support
- 🔲 Multi-language support (i18n)

## 🏗️ Architecture

### State Management Flow

```
User Action → Component → Redux Action → API Call → Backend
                ↓                                      ↓
            Re-render ← State Update ← Response ← Backend
```

### Component Hierarchy

```
App (Root Layout)
├── RoleAutoSwitch (Role Management)
├── Sidebar (Navigation)
├── Header (Top Bar)
└── Routes
    ├── Admin Pages
    │   ├── Dashboard
    │   ├── Master Data (Hubs, Terminals, etc.)
    │   ├── Orders
    │   ├── Vehicle Allocation
    │   ├── Inventory
    │   └── Live Fleet
    └── Driver Pages
        ├── Shift View
        ├── Live Map
        ├── Delivery Management
        └── Shift History
```

### Key Design Patterns

- **Redux Toolkit Slices** - Feature-based state organization
- **Service Layer** - Centralized API calls in `services/api.ts`
- **Compound Components** - Reusable UI patterns
- **Custom Hooks** - Typed Redux hooks for TypeScript safety
- **Modal-Based CRUD** - Consistent data management UX

## 🧪 Development

### Scripts

```bash
npm run dev          # Start both Vite and JSON Server
npm run dev:vite     # Start only Vite dev server
npm run dev:api      # Start only JSON Server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Environment Variables

Create a `.env` file for configuration:

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

### Code Style

- **TypeScript Strict Mode** - Full type safety
- **ESLint** - Code quality and consistency
- **Prettier Integration** - Automatic formatting (recommended)

## 🤝 Contributing

1. Read the documentation in [`docs/`](./docs/)
2. Follow existing patterns and conventions
3. Update documentation for significant changes
4. Test across both admin and driver views
5. Ensure TypeScript types are properly defined

## 📝 License

This project is for educational and portfolio purposes.

## 🔗 Resources

- [Project Documentation](./docs/README.md)
- [React Documentation](https://react.dev/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Chakra UI Documentation](https://chakra-ui.com/)
- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/)

---

## 📚 Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
