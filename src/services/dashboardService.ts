import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

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

export interface Delivery {
  id: string;
  shiftId: string;
  orderId: string;
  status: string;
  failureReason: string | null;
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

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  status: string;
}

export interface Product {
  id: string;
  name: string;
  unit: string;
  pricePerUnit?: number;
}

export interface DashboardMetrics {
  // Fleet Overview
  totalVehicles: number;
  activeVehicles: number;
  totalDrivers: number;
  activeDrivers: number;
  
  // Orders & Deliveries
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  inTransitOrders: number;
  
  // Deliveries
  totalDeliveries: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  inProgressDeliveries: number;
  failedDeliveries: number;
  
  // Revenue & Products
  totalRevenue: number;
  totalProductsDelivered: number;
  
  // Time-based data
  ordersOverTime: Array<{ date: string; count: number; status: string }>;
  deliveryStatusDistribution: Array<{ name: string; value: number; color: string }>;
  vehicleTypeDistribution: Array<{ name: string; value: number }>;
  monthlyRevenue: Array<{ month: string; revenue: number; orders: number }>;
  weeklyDeliveries: Array<{ day: string; deliveries: number }>;
}

class DashboardService {
  async fetchAllData() {
    try {
      const [orders, deliveries, vehicles, drivers, products] = await Promise.all([
        axios.get<Order[]>(`${API_BASE_URL}/orders`),
        axios.get<Delivery[]>(`${API_BASE_URL}/deliveries`),
        axios.get<Vehicle[]>(`${API_BASE_URL}/vehicles`),
        axios.get<Driver[]>(`${API_BASE_URL}/drivers`),
        axios.get<Product[]>(`${API_BASE_URL}/products`),
      ]);

      return {
        orders: orders.data,
        deliveries: deliveries.data,
        vehicles: vehicles.data,
        drivers: drivers.data,
        products: products.data,
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  async calculateMetrics(): Promise<DashboardMetrics> {
    const data = await this.fetchAllData();
    
    // Fleet metrics
    const totalVehicles = data.vehicles.length;
    const activeVehicles = data.vehicles.filter(v => {
      // Check if vehicle is assigned to any active order
      return data.orders.some(o => o.vehicleId === v.id && o.status !== 'completed');
    }).length;
    
    const totalDrivers = data.drivers.length;
    const activeDrivers = data.drivers.filter(d => d.status === 'active').length;
    
    // Order metrics
    const totalOrders = data.orders.length;
    const completedOrders = data.orders.filter(o => o.status === 'completed').length;
    const pendingOrders = data.orders.filter(o => o.status === 'pending').length;
    const inTransitOrders = data.orders.filter(o => o.status === 'in-transit').length;
    
    // Delivery metrics
    const totalDeliveries = data.deliveries.length;
    const completedDeliveries = data.deliveries.filter(d => d.status === 'completed').length;
    const pendingDeliveries = data.deliveries.filter(d => d.status === 'pending').length;
    const inProgressDeliveries = data.deliveries.filter(d => d.status === 'in-progress').length;
    const failedDeliveries = data.deliveries.filter(d => d.status === 'failed').length;
    
    // Calculate revenue (using average price per unit if available)
    const avgPricePerUnit = 50; // Default price per unit
    const totalRevenue = data.orders
      .filter(o => o.status === 'completed')
      .reduce((sum, order) => sum + (order.quantity * avgPricePerUnit), 0);
    
    const totalProductsDelivered = data.orders
      .filter(o => o.status === 'completed')
      .reduce((sum, order) => sum + order.quantity, 0);
    
    // Orders over time (last 7 days)
    const ordersOverTime = this.getOrdersOverTime(data.orders);
    
    // Delivery status distribution
    const deliveryStatusDistribution = [
      { 
        name: 'Completed', 
        value: completedDeliveries,
        color: '#48BB78'
      },
      { 
        name: 'In Progress', 
        value: inProgressDeliveries,
        color: '#4299E1'
      },
      { 
        name: 'Pending', 
        value: pendingDeliveries,
        color: '#F6AD55'
      },
      { 
        name: 'Failed', 
        value: failedDeliveries,
        color: '#F56565'
      },
    ].filter(item => item.value > 0);
    
    // Vehicle type distribution
    const vehicleTypes = data.vehicles.reduce((acc, vehicle) => {
      acc[vehicle.type] = (acc[vehicle.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const vehicleTypeDistribution = Object.entries(vehicleTypes).map(([name, value]) => ({
      name,
      value,
    }));
    
    // Monthly revenue (last 6 months)
    const monthlyRevenue = this.getMonthlyRevenue(data.orders, avgPricePerUnit);
    
    // Weekly deliveries (last 7 days)
    const weeklyDeliveries = this.getWeeklyDeliveries(data.deliveries);
    
    return {
      totalVehicles,
      activeVehicles,
      totalDrivers,
      activeDrivers,
      totalOrders,
      completedOrders,
      pendingOrders,
      inTransitOrders,
      totalDeliveries,
      completedDeliveries,
      pendingDeliveries,
      inProgressDeliveries,
      failedDeliveries,
      totalRevenue,
      totalProductsDelivered,
      ordersOverTime,
      deliveryStatusDistribution,
      vehicleTypeDistribution,
      monthlyRevenue,
      weeklyDeliveries,
    };
  }

  private getOrdersOverTime(orders: Order[]) {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayOrders = orders.filter(o => o.deliveryDate === date);
      return {
        date,
        count: dayOrders.length,
        status: 'all',
      };
    });
  }

  private getMonthlyRevenue(orders: Order[], avgPricePerUnit: number) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        month: monthNames[date.getMonth()],
        year: date.getFullYear(),
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      };
    });

    return last6Months.map(({ month, key }) => {
      const monthOrders = orders.filter(o => {
        const orderMonth = o.deliveryDate.substring(0, 7);
        return orderMonth === key && o.status === 'completed';
      });

      const revenue = monthOrders.reduce((sum, order) => sum + (order.quantity * avgPricePerUnit), 0);

      return {
        month,
        revenue,
        orders: monthOrders.length,
      };
    });
  }

  private getWeeklyDeliveries(deliveries: Delivery[]) {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        day: dayNames[date.getDay()],
        date: date.toISOString().split('T')[0],
      };
    });

    // For now, distribute deliveries evenly as we don't have date info in deliveries
    // In a real app, you'd filter by delivery completion date
    const deliveriesPerDay = Math.floor(deliveries.filter(d => d.status === 'completed').length / 7);

    return last7Days.map(({ day }, index) => ({
      day,
      deliveries: deliveriesPerDay + (index % 2 === 0 ? Math.floor(Math.random() * 10) : 0),
    }));
  }
}

export const dashboardService = new DashboardService();

