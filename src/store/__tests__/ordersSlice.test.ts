import { describe, it, expect } from 'vitest';
import ordersReducer, {
  setOrders,
  addOrder,
  updateOrder,
  deleteOrder,
  setSelectedOrder,
  setLoading,
  setError,
  updateOrderStatus,
  type Order,
} from '../ordersSlice';

describe('ordersSlice', () => {
  const mockOrder: Order = {
    id: '1',
    destinationId: 'terminal-1',
    productId: 'product-1',
    quantity: 100,
    deliveryDate: '2024-01-15',
    assignedDriverId: 'driver-1',
    vehicleId: 'vehicle-1',
    status: 'pending',
  };

  const initialState = {
    orders: [],
    loading: false,
    error: null,
    selectedOrder: null,
  };

  it('should return the initial state', () => {
    expect(ordersReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setOrders', () => {
    it('should set orders array and clear loading and error', () => {
      const orders = [mockOrder];
      const state = { ...initialState, loading: true, error: 'Some error' };
      const actual = ordersReducer(state, setOrders(orders));
      
      expect(actual.orders).toEqual(orders);
      expect(actual.loading).toBe(false);
      expect(actual.error).toBe(null);
    });
  });

  describe('addOrder', () => {
    it('should add a new order', () => {
      const actual = ordersReducer(initialState, addOrder(mockOrder));
      expect(actual.orders).toHaveLength(1);
      expect(actual.orders[0]).toEqual(mockOrder);
    });
  });

  describe('updateOrder', () => {
    it('should update an existing order', () => {
      const state = { ...initialState, orders: [mockOrder] };
      const updatedOrder = { ...mockOrder, quantity: 200 };
      const actual = ordersReducer(state, updateOrder(updatedOrder));
      
      expect(actual.orders[0].quantity).toBe(200);
    });

    it('should not update if order not found', () => {
      const state = { ...initialState, orders: [mockOrder] };
      const nonExistentOrder = { ...mockOrder, id: '999' };
      const actual = ordersReducer(state, updateOrder(nonExistentOrder));
      
      expect(actual.orders).toEqual([mockOrder]);
    });
  });

  describe('deleteOrder', () => {
    it('should delete an order by id', () => {
      const state = { ...initialState, orders: [mockOrder] };
      const actual = ordersReducer(state, deleteOrder('1'));
      
      expect(actual.orders).toHaveLength(0);
    });
  });

  describe('setSelectedOrder', () => {
    it('should set selected order', () => {
      const actual = ordersReducer(initialState, setSelectedOrder(mockOrder));
      expect(actual.selectedOrder).toEqual(mockOrder);
    });

    it('should clear selected order', () => {
      const state = { ...initialState, selectedOrder: mockOrder };
      const actual = ordersReducer(state, setSelectedOrder(null));
      expect(actual.selectedOrder).toBe(null);
    });
  });

  describe('setLoading', () => {
    it('should set loading state', () => {
      const actual = ordersReducer(initialState, setLoading(true));
      expect(actual.loading).toBe(true);
    });
  });

  describe('setError', () => {
    it('should set error and clear loading', () => {
      const state = { ...initialState, loading: true };
      const actual = ordersReducer(state, setError('Failed to load'));
      
      expect(actual.error).toBe('Failed to load');
      expect(actual.loading).toBe(false);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', () => {
      const state = { ...initialState, orders: [mockOrder] };
      const actual = ordersReducer(
        state,
        updateOrderStatus({ orderId: '1', status: 'completed' })
      );
      
      expect(actual.orders[0].status).toBe('completed');
    });

    it('should not update if order not found', () => {
      const state = { ...initialState, orders: [mockOrder] };
      const actual = ordersReducer(
        state,
        updateOrderStatus({ orderId: '999', status: 'completed' })
      );
      
      expect(actual.orders[0].status).toBe('pending');
    });
  });
});

