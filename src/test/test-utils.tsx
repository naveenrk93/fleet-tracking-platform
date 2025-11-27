import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { RootState } from '../store';
import dashboardReducer from '../store/dashboardSlice';
import themeReducer from '../store/themeSlice';
import userReducer from '../store/userSlice';
import ordersReducer from '../store/ordersSlice';
import hubsReducer from '../store/hubsSlice';
import terminalsReducer from '../store/terminalsSlice';
import productsReducer from '../store/productsSlice';
import driversReducer from '../store/driversSlice';
import vehiclesReducer from '../store/vehiclesSlice';
import vehicleAllocationsReducer from '../store/vehicleAllocationsSlice';
import fleetTrackingReducer from '../store/fleetTrackingSlice';
import deliveriesReducer from '../store/deliveriesSlice';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: ReturnType<typeof configureStore>;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        dashboard: dashboardReducer as any,
        theme: themeReducer as any,
        user: userReducer as any,
        orders: ordersReducer as any,
        hubs: hubsReducer as any,
        terminals: terminalsReducer as any,
        products: productsReducer as any,
        drivers: driversReducer as any,
        vehicles: vehiclesReducer as any,
        vehicleAllocations: vehicleAllocationsReducer as any,
        fleetTracking: fleetTrackingReducer as any,
        deliveries: deliveriesReducer as any,
      },
      preloadedState,
    }),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <ChakraProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </ChakraProvider>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

export * from '@testing-library/react';
export { renderWithProviders as render };

