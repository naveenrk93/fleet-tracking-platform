import axios from 'axios';

const API_BASE_URL = 'https://json-server-fleet.onrender.com';

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

export interface Shift {
  id: string;
  driverId: string;
  vehicleId: string;
  date: string;
  status: 'pending' | 'active' | 'completed';
  startTime: string | null;
  endTime: string | null;
}

export interface Delivery {
  id: string;
  shiftId: string;
  orderId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  failureReason: string | null;
}

export interface FleetLocation {
  id: string;
  vehicleId: string;
  vehicleRegistration: string;
  vehicleType: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  currentLocation: {
    lat: number;
    lng: number;
  };
  status: 'active' | 'idle' | 'offline';
  lastUpdated: string;
  speed?: number;
  allocationId?: string;
  shiftId?: string;
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

/**
 * Creates a new order and automatically creates a shift if a driver is assigned
 * and has a vehicle allocated on the delivery date.
 */
export const createOrder = async (order: Omit<Order, 'id'>): Promise<Order> => {
  // Create the order first
  const response = await api.post('/orders', order);
  const createdOrder = response.data;
  
  // If a driver is assigned, check for vehicle allocation and create shift
  if (createdOrder.assignedDriverId && createdOrder.deliveryDate) {
    const allocation = await getDriverVehicleAllocation(createdOrder.assignedDriverId, createdOrder.deliveryDate);
    
    if (allocation) {
      // Check if a shift already exists for this driver/vehicle/date combination
      const existingShifts = await api.get(`/shifts?driverId=${createdOrder.assignedDriverId}&vehicleId=${allocation.vehicleId}&date=${createdOrder.deliveryDate}`);
      
      let shift;
      if (existingShifts.data.length > 0) {
        // Use existing shift
        shift = existingShifts.data[0];
      } else {
        // Create new shift
        const shiftData = {
          driverId: createdOrder.assignedDriverId,
          vehicleId: allocation.vehicleId,
          date: createdOrder.deliveryDate,
          status: 'pending',
          startTime: null,
          endTime: null,
        };
        const shiftResponse = await api.post('/shifts', shiftData);
        shift = shiftResponse.data;
      }
      
      // Create delivery linking the order to the shift
      const deliveryData = {
        id: `delivery-${Date.now()}`,
        shiftId: shift.id,
        orderId: createdOrder.id,
        status: 'pending',
        failureReason: null,
      };
      await api.post('/deliveries', deliveryData);
      
      // Update the allocation with shiftId if not already set
      if (!allocation.shiftId) {
        await api.patch(`/allocations/${allocation.id}`, { shiftId: shift.id });
      }
    }
  }
  
  return createdOrder;
};

/**
 * Updates an order and creates/updates shift if driver assignment changed
 * and the driver has a vehicle allocated on the delivery date.
 */
export const updateOrder = async (id: string, order: Partial<Order>): Promise<Order> => {
  // Get the existing order
  const existingOrder = await getOrder(id);
  
  // Update the order
  const response = await api.patch(`/orders/${id}`, order);
  const updatedOrder = response.data;
  
  // Check if driver or delivery date changed and a driver is now assigned
  const driverChanged = order.assignedDriverId && order.assignedDriverId !== existingOrder.assignedDriverId;
  const dateChanged = order.deliveryDate && order.deliveryDate !== existingOrder.deliveryDate;
  
  if ((driverChanged || dateChanged) && updatedOrder.assignedDriverId && updatedOrder.deliveryDate) {
    const allocation = await getDriverVehicleAllocation(updatedOrder.assignedDriverId, updatedOrder.deliveryDate);
    
    if (allocation) {
      // Check if a shift already exists for this driver/vehicle/date combination
      const existingShifts = await api.get(`/shifts?driverId=${updatedOrder.assignedDriverId}&vehicleId=${allocation.vehicleId}&date=${updatedOrder.deliveryDate}`);
      
      let shift;
      if (existingShifts.data.length > 0) {
        // Use existing shift
        shift = existingShifts.data[0];
      } else {
        // Create new shift
        const shiftData = {
          driverId: updatedOrder.assignedDriverId,
          vehicleId: allocation.vehicleId,
          date: updatedOrder.deliveryDate,
          status: 'pending',
          startTime: null,
          endTime: null,
        };
        const shiftResponse = await api.post('/shifts', shiftData);
        shift = shiftResponse.data;
      }
      
      // Check if delivery already exists for this order
      const existingDeliveries = await api.get(`/deliveries?orderId=${updatedOrder.id}`);
      
      if (existingDeliveries.data.length > 0) {
        // Update existing delivery
        await api.patch(`/deliveries/${existingDeliveries.data[0].id}`, {
          shiftId: shift.id,
        });
      } else {
        // Create new delivery
        const deliveryData = {
          id: `delivery-${Date.now()}`,
          shiftId: shift.id,
          orderId: updatedOrder.id,
          status: 'pending',
          failureReason: null,
        };
        await api.post('/deliveries', deliveryData);
      }
      
      // Update the allocation with shiftId if not already set
      if (!allocation.shiftId) {
        await api.patch(`/allocations/${allocation.id}`, { shiftId: shift.id });
      }
    }
  }
  
  return updatedOrder;
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

/**
 * Creates a new vehicle allocation.
 * Only allocates a vehicle to a driver on a specific date.
 * Shifts are created when orders are assigned to drivers.
 */
export const createAllocation = async (allocation: Omit<Allocation, 'id'>): Promise<Allocation> => {
  const response = await api.post('/allocations', allocation);
  return response.data;
};

/**
 * Updates a vehicle allocation.
 */
export const updateAllocation = async (id: string, allocation: Partial<Allocation>): Promise<Allocation> => {
  const response = await api.patch(`/allocations/${id}`, allocation);
  return response.data;
};

/**
 * Deletes a vehicle allocation.
 */
export const deleteAllocation = async (id: string): Promise<void> => {
  await api.delete(`/allocations/${id}`);
};

export const checkVehicleAvailability = async (vehicleId: string, date: string): Promise<boolean> => {
  const response = await api.get(`/allocations?vehicleId=${vehicleId}&date=${date}`);
  return response.data.length === 0;
};

/**
 * Gets the vehicle allocation for a specific driver on a specific date.
 * Returns the allocation if found, null otherwise.
 */
export const getDriverVehicleAllocation = async (driverId: string, date: string): Promise<Allocation | null> => {
  const response = await api.get(`/allocations?driverId=${driverId}&date=${date}`);
  const allocations = response.data.filter((a: Allocation) => a.status !== 'cancelled');
  return allocations.length > 0 ? allocations[0] : null;
};

// Shifts
export const getShifts = async (): Promise<Shift[]> => {
  const response = await api.get('/shifts');
  return response.data;
};

export const getShift = async (id: string): Promise<Shift> => {
  const response = await api.get(`/shifts/${id}`);
  return response.data;
};

export const createShift = async (shift: Omit<Shift, 'id'>): Promise<Shift> => {
  const response = await api.post('/shifts', shift);
  return response.data;
};

export const updateShift = async (id: string, shift: Partial<Shift>): Promise<Shift> => {
  const response = await api.patch(`/shifts/${id}`, shift);
  return response.data;
};

export const deleteShift = async (id: string): Promise<void> => {
  await api.delete(`/shifts/${id}`);
};

// Deliveries
export const getDeliveries = async (): Promise<Delivery[]> => {
  const response = await api.get('/deliveries');
  return response.data;
};

export const getDelivery = async (id: string): Promise<Delivery> => {
  const response = await api.get(`/deliveries/${id}`);
  return response.data;
};

export const updateDelivery = async (id: string, delivery: Partial<Delivery>): Promise<Delivery> => {
  const response = await api.patch(`/deliveries/${id}`, delivery);
  return response.data;
};

/**
 * Gets deliveries for a specific shift with full details including order, product, and destination
 */
export const getShiftDeliveriesWithDetails = async (shiftId: string): Promise<any[]> => {
  try {
    // Get deliveries for this shift
    const deliveriesResponse = await api.get(`/deliveries?shiftId=${shiftId}`);
    const deliveries = deliveriesResponse.data;

    // Get all required data
    const [orders, hubs, terminals, products] = await Promise.all([
      getOrders(),
      getHubs(),
      getTerminals(),
      getProducts(),
    ]);

    // Combine all destinations
    const allDestinations = [...hubs, ...terminals];

    // Enrich deliveries with details
    const deliveriesWithDetails = deliveries.map((delivery: Delivery) => {
      const order = orders.find((o) => o.id === delivery.orderId);
      const destination = allDestinations.find((d) => d.id === order?.destinationId);
      const product = products.find((p) => p.id === order?.productId);

      return {
        ...delivery,
        order: order ? {
          id: order.id,
          destinationId: order.destinationId,
          productId: order.productId,
          quantity: order.quantity,
          deliveryDate: order.deliveryDate,
        } : undefined,
        destination: destination ? {
          id: destination.id,
          name: destination.name,
          address: destination.address,
          type: destination.type,
        } : undefined,
        product: product ? {
          id: product.id,
          name: product.name,
          sku: product.sku,
          unit: product.unit,
        } : undefined,
      };
    });

    return deliveriesWithDetails;
  } catch (error) {
    console.error('Error fetching shift deliveries with details:', error);
    throw error;
  }
};

/**
 * Marks a delivery as completed and updates inventory
 */
export const completeDelivery = async (deliveryId: string): Promise<Delivery> => {
  try {
    // Get delivery details
    const delivery = await getDelivery(deliveryId);
    const order = await getOrder(delivery.orderId);

    // Update delivery status
    const updatedDelivery = await updateDelivery(deliveryId, {
      status: 'completed',
    });

    // Update order status
    await updateOrder(order.id, { status: 'completed' });

    // Update destination inventory (add product)
    const destination = await getTerminal(order.destinationId).catch(() => null) ||
                       await getHub(order.destinationId).catch(() => null);
    
    if (destination) {
      const existingProduct = destination.products?.find(
        (p: any) => p.productId === order.productId
      );

      let updatedProducts;
      if (existingProduct) {
        // Update existing product quantity
        updatedProducts = destination.products?.map((p: any) =>
          p.productId === order.productId
            ? { ...p, quantity: p.quantity + order.quantity }
            : p
        );
      } else {
        // Add new product to destination
        const product = await getProduct(order.productId);
        updatedProducts = [
          ...(destination.products || []),
          {
            productId: product.id,
            productName: product.name,
            quantity: order.quantity,
          },
        ];
      }

      // Update the destination
      if (destination.type === 'terminal') {
        await updateTerminal(destination.id, { products: updatedProducts });
      } else {
        await updateHub(destination.id, { products: updatedProducts });
      }
    }

    return updatedDelivery;
  } catch (error) {
    console.error('Error completing delivery:', error);
    throw error;
  }
};

/**
 * Marks a delivery as failed with a reason
 */
export const failDelivery = async (deliveryId: string, failureReason: string): Promise<Delivery> => {
  try {
    const delivery = await getDelivery(deliveryId);
    
    // Update delivery status
    const updatedDelivery = await updateDelivery(deliveryId, {
      status: 'failed',
      failureReason,
    });

    // Update order status
    await updateOrder(delivery.orderId, { status: 'cancelled' });

    return updatedDelivery;
  } catch (error) {
    console.error('Error failing delivery:', error);
    throw error;
  }
};

/**
 * Ends a shift and marks all pending deliveries as failed
 */
export const endShift = async (shiftId: string): Promise<Shift> => {
  try {
    // Get all deliveries for this shift
    const deliveriesResponse = await api.get(`/deliveries?shiftId=${shiftId}`);
    const deliveries = deliveriesResponse.data;

    // Mark any pending deliveries as failed
    const pendingDeliveries = deliveries.filter(
      (d: Delivery) => d.status === 'pending' || d.status === 'in-progress'
    );

    await Promise.all(
      pendingDeliveries.map((delivery: Delivery) =>
        updateDelivery(delivery.id, {
          status: 'failed',
          failureReason: 'Shift ended without completion',
        })
      )
    );

    // Update shift status
    const updatedShift = await updateShift(shiftId, {
      status: 'completed',
      endTime: new Date().toISOString(),
    });

    return updatedShift;
  } catch (error) {
    console.error('Error ending shift:', error);
    throw error;
  }
};

// Fleet Tracking
export const getFleetLocations = async (): Promise<FleetLocation[]> => {
  try {
    // Fetch allocations, vehicles, and drivers to build fleet location data
    const [allocations, vehicles, drivers, shifts] = await Promise.all([
      getAllocations(),
      getVehicles(),
      getDrivers(),
      getShifts(),
    ]);

    const today = new Date().toISOString().split('T')[0];

    // Filter active shifts for today (this ensures only active drivers are shown)
    const activeShifts = shifts.filter(
      (shift) => shift.date === today && shift.status === 'active'
    );

    // Build fleet location data from active shifts
    const fleetLocations = activeShifts
      .map((shift): FleetLocation | null => {
        const vehicle = vehicles.find((v) => v.id === shift.vehicleId);
        const driver = drivers.find((d) => d.id === shift.driverId);
        const allocation = allocations.find((a) => a.shiftId === shift.id);

        if (!vehicle || !driver) {
          return null;
        }

        // Determine status based on vehicle and shift data
        let status: 'active' | 'idle' | 'offline' = 'active';
        if (!vehicle.currentLocation) {
          status = 'offline';
        }

        return {
          id: `fleet-${shift.id}`,
          vehicleId: vehicle.id,
          vehicleRegistration: vehicle.registration,
          vehicleType: vehicle.type,
          driverId: driver.id,
          driverName: driver.name,
          driverPhone: driver.phone,
          currentLocation: vehicle.currentLocation || { lat: 40.712, lng: -74.006 },
          status,
          lastUpdated: new Date().toISOString(),
          allocationId: allocation?.id,
          shiftId: shift.id,
        };
      })
      .filter((loc): loc is FleetLocation => loc !== null);

    return fleetLocations;
  } catch (error) {
    console.error('Error fetching fleet locations:', error);
    return [];
  }
};

// Update vehicle location (used for GPS tracking simulation)
export const updateVehicleLocation = async (
  vehicleId: string,
  location: { lat: number; lng: number }
): Promise<Vehicle> => {
  const vehicle = await getVehicle(vehicleId);
  const updatedVehicle = {
    ...vehicle,
    currentLocation: location,
  };
  const response = await api.put(`/vehicles/${vehicleId}`, updatedVehicle);
  return response.data;
};

// Add GPS tracking entry (for historical tracking)
export const addGPSTracking = async (data: {
  vehicleId: string;
  driverId: string;
  coordinates: { lat: number; lng: number };
}): Promise<any> => {
  const gpsEntry = {
    id: `gps-${Date.now()}`,
    vehicleId: data.vehicleId,
    driverId: data.driverId,
    timestamp: new Date().toISOString(),
    coordinates: data.coordinates,
  };
  const response = await api.post('/gpsUpdates', gpsEntry);
  return response.data;
};

export default api;

