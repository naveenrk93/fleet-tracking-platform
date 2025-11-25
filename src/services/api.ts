import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface HubProduct {
  productId: string;
  productName: string;
  quantity: number;
}

export interface Hub {
  id: string;
  name: string;
  type: 'hub';
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  products?: HubProduct[];
}

export interface TerminalProduct {
  productId: string;
  productName: string;
  quantity: number;
}

export interface Terminal {
  id: string;
  name: string;
  type: 'terminal';
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  products?: TerminalProduct[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  unit: "kg" | "liter" | "piece" | "box" | "ton";
  description: string;
  stockQuantity: number;
}

export interface Driver {
  id: string;
  name: string;
  license: string;
  phone: string;
  email?: string;
  status?: string;
}

export interface Vehicle {
  id: string;
  registration: string;
  capacity: number;
  type: string;
  currentLocation: {
    lat: number;
    lng: number;
  };
}

export interface Order {
  id: string;
  destinationId: string;
  productId: string;
  quantity: number;
  deliveryDate: string;
  assignedDriverId: string;
  vehicleId: string;
  status: string;
}

export interface Allocation {
  id: string;
  date: string;
  vehicleId: string;
  driverId: string;
  shiftId?: string;
  status: 'allocated' | 'completed' | 'pending' | 'cancelled';
}

// API Functions

// Hubs
export const getHubs = async (): Promise<Hub[]> => {
  const response = await api.get('/hubs');
  return response.data;
};

export const getHub = async (id: string): Promise<Hub> => {
  const response = await api.get(`/hubs/${id}`);
  return response.data;
};

export const createHub = async (hub: Omit<Hub, 'id'>): Promise<Hub> => {
  const response = await api.post('/hubs', hub);
  return response.data;
};

export const updateHub = async (id: string, hub: Partial<Hub>): Promise<Hub> => {
  const response = await api.put(`/hubs/${id}`, hub);
  return response.data;
};

export const deleteHub = async (id: string): Promise<void> => {
  await api.delete(`/hubs/${id}`);
};

// Terminals
export const getTerminals = async (): Promise<Terminal[]> => {
  const response = await api.get('/terminals');
  return response.data;
};

export const getTerminal = async (id: string): Promise<Terminal> => {
  const response = await api.get(`/terminals/${id}`);
  return response.data;
};

export const createTerminal = async (terminal: Omit<Terminal, 'id'>): Promise<Terminal> => {
  const response = await api.post('/terminals', terminal);
  return response.data;
};

export const updateTerminal = async (id: string, terminal: Partial<Terminal>): Promise<Terminal> => {
  const response = await api.put(`/terminals/${id}`, terminal);
  return response.data;
};

export const deleteTerminal = async (id: string): Promise<void> => {
  await api.delete(`/terminals/${id}`);
};

// Products
export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get('/products');
  return response.data;
};

export const getProduct = async (id: string): Promise<Product> => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  const response = await api.post('/products', product);
  return response.data;
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  const response = await api.patch(`/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};

// Drivers
export const getDrivers = async (): Promise<Driver[]> => {
  const response = await api.get('/drivers');
  return response.data;
};

export const getDriver = async (id: string): Promise<Driver> => {
  const response = await api.get(`/drivers/${id}`);
  return response.data;
};

export const createDriver = async (driver: Omit<Driver, 'id'>): Promise<Driver> => {
  const response = await api.post('/drivers', driver);
  return response.data;
};

export const updateDriver = async (id: string, driver: Partial<Driver>): Promise<Driver> => {
  const response = await api.patch(`/drivers/${id}`, driver);
  return response.data;
};

export const deleteDriver = async (id: string): Promise<void> => {
  await api.delete(`/drivers/${id}`);
};

// Vehicles
export const getVehicles = async (): Promise<Vehicle[]> => {
  const response = await api.get('/vehicles');
  return response.data;
};

export const getVehicle = async (id: string): Promise<Vehicle> => {
  const response = await api.get(`/vehicles/${id}`);
  return response.data;
};

export const createVehicle = async (vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
  const response = await api.post('/vehicles', vehicle);
  return response.data;
};

export const updateVehicle = async (id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> => {
  const response = await api.patch(`/vehicles/${id}`, vehicle);
  return response.data;
};

export const deleteVehicle = async (id: string): Promise<void> => {
  await api.delete(`/vehicles/${id}`);
};

// Orders
export const getOrders = async (): Promise<Order[]> => {
  const response = await api.get('/orders');
  return response.data;
};

export const getOrder = async (id: string): Promise<Order> => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const createOrder = async (order: Omit<Order, 'id'>): Promise<Order> => {
  const response = await api.post('/orders', order);
  return response.data;
};

export const updateOrder = async (id: string, order: Partial<Order>): Promise<Order> => {
  const response = await api.patch(`/orders/${id}`, order);
  return response.data;
};

export const deleteOrder = async (id: string): Promise<void> => {
  await api.delete(`/orders/${id}`);
};

// Allocations
export const getAllocations = async (): Promise<Allocation[]> => {
  const response = await api.get('/allocations');
  return response.data;
};

export const getAllocation = async (id: string): Promise<Allocation> => {
  const response = await api.get(`/allocations/${id}`);
  return response.data;
};

export const createAllocation = async (allocation: Omit<Allocation, 'id'>): Promise<Allocation> => {
  const response = await api.post('/allocations', allocation);
  return response.data;
};

export const updateAllocation = async (id: string, allocation: Partial<Allocation>): Promise<Allocation> => {
  const response = await api.patch(`/allocations/${id}`, allocation);
  return response.data;
};

export const deleteAllocation = async (id: string): Promise<void> => {
  await api.delete(`/allocations/${id}`);
};

export const checkVehicleAvailability = async (vehicleId: string, date: string): Promise<boolean> => {
  const response = await api.get(`/allocations?vehicleId=${vehicleId}&date=${date}`);
  return response.data.length === 0;
};

export default api;

