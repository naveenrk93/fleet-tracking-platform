# Admin Dashboard - Fleet Tracking Platform

A modern, feature-rich admin dashboard built with React, TypeScript, Chakra UI, and Redux Toolkit.

## Features

- 📊 **Interactive Dashboard** - Beautiful analytics cards with real-time data visualization
- 🎨 **Modern UI** - Built with Chakra UI for a sleek, responsive design
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- 🔄 **State Management** - Redux Toolkit for efficient state management
- 🎭 **Dark Theme** - Eye-friendly dark color scheme
- 📈 **Charts & Visualizations** - Custom SVG charts for earnings and revenue tracking
- 🧭 **Navigation** - Intuitive sidebar with multiple menu items and badges

## Tech Stack

- **React 19** - Latest React with new features
- **TypeScript** - Type-safe development
- **Chakra UI** - Component library for modern UI
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Vite** - Fast build tool and dev server
- **React Icons** - Beautiful icon library

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

## Dashboard Components

### 📊 Website Analytics Card
- Displays key metrics: sessions, users, page views, leads, and conversions
- Features a beautiful gradient background with 3D sphere decoration
- Real-time session tracking with trend indicators

### 💰 Revenue & Orders Cards
- Revenue tracking with percentage changes
- Order count monitoring
- Visit statistics with visual icons

### 📈 Earning Reports
- Weekly earnings visualization with bar charts
- Comparison metrics (Earnings, Profit, Expense)
- Trend indicators showing growth percentage

### 🎫 Support Tracker
- Circular progress indicator showing completion rate
- Ticket breakdown by type (New, Open, Response Time)
- Color-coded categories for easy identification

### 📉 Revenue Generated
- Line chart showing monthly revenue trends
- Smooth gradient area fills
- Interactive data points

## Project Structure

```
src/
├── components/
│   ├── Sidebar.tsx           # Left navigation sidebar
│   ├── Header.tsx            # Top header with search and user menu
│   └── dashboard/
│       ├── WebsiteAnalyticsCard.tsx    # Main analytics widget
│       ├── StatCard.tsx                # Reusable stat card component
│       ├── EarningReportsCard.tsx      # Weekly earnings chart
│       ├── SupportTrackerCard.tsx      # Circular progress tracker
│       └── RevenueGeneratedCard.tsx    # Revenue line chart
├── pages/
│   └── DashboardPage.tsx     # Main dashboard page
├── store/
│   └── dashboardSlice.ts     # Redux state management
├── App.tsx                   # Main app component with routing
├── main.tsx                  # App entry point with providers
└── store.ts                  # Redux store configuration
```

## Key Features Implemented

✅ Responsive sidebar navigation with 11 menu items  
✅ Top header with search, notifications, and user profile  
✅ Website Analytics card with gradient design and 3D elements  
✅ Multiple stat cards for Revenue, Orders, and Visits  
✅ Interactive bar chart for weekly earnings  
✅ Circular progress indicator for support tracking  
✅ SVG line chart for revenue trends  
✅ Redux state management for dashboard data  
✅ Dark theme with custom color palette  
✅ Fully responsive grid layout  
✅ Smooth transitions and hover effects

## Expanding the ESLint configuration

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
