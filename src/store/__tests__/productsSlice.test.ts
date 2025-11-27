import { describe, it, expect } from 'vitest';
import productsReducer, {
  setProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  setSelectedProduct,
  setLoading,
  setError,
  updateStockQuantity,
  decrementStock,
  incrementStock,
  type Product,
} from '../productsSlice';

describe('productsSlice', () => {
  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    sku: 'PROD-001',
    category: 'Electronics',
    price: 99.99,
    unit: 'piece',
    description: 'A test product',
    stockQuantity: 100,
  };

  const initialState = {
    products: [],
    loading: false,
    error: null,
    selectedProduct: null,
  };

  it('should return the initial state', () => {
    expect(productsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setProducts', () => {
    it('should set products array and clear loading and error', () => {
      const products = [mockProduct];
      const state = { ...initialState, loading: true, error: 'Some error' };
      const actual = productsReducer(state, setProducts(products));
      
      expect(actual.products).toEqual(products);
      expect(actual.loading).toBe(false);
      expect(actual.error).toBe(null);
    });
  });

  describe('addProduct', () => {
    it('should add a new product', () => {
      const actual = productsReducer(initialState, addProduct(mockProduct));
      expect(actual.products).toHaveLength(1);
      expect(actual.products[0]).toEqual(mockProduct);
    });
  });

  describe('updateProduct', () => {
    it('should update an existing product', () => {
      const state = { ...initialState, products: [mockProduct] };
      const updatedProduct = { ...mockProduct, price: 149.99 };
      const actual = productsReducer(state, updateProduct(updatedProduct));
      
      expect(actual.products[0].price).toBe(149.99);
    });

    it('should not update if product not found', () => {
      const state = { ...initialState, products: [mockProduct] };
      const nonExistentProduct = { ...mockProduct, id: '999' };
      const actual = productsReducer(state, updateProduct(nonExistentProduct));
      
      expect(actual.products).toEqual([mockProduct]);
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product by id', () => {
      const state = { ...initialState, products: [mockProduct] };
      const actual = productsReducer(state, deleteProduct('1'));
      
      expect(actual.products).toHaveLength(0);
    });
  });

  describe('setSelectedProduct', () => {
    it('should set selected product', () => {
      const actual = productsReducer(initialState, setSelectedProduct(mockProduct));
      expect(actual.selectedProduct).toEqual(mockProduct);
    });

    it('should clear selected product', () => {
      const state = { ...initialState, selectedProduct: mockProduct };
      const actual = productsReducer(state, setSelectedProduct(null));
      expect(actual.selectedProduct).toBe(null);
    });
  });

  describe('setLoading', () => {
    it('should set loading state', () => {
      const actual = productsReducer(initialState, setLoading(true));
      expect(actual.loading).toBe(true);
    });
  });

  describe('setError', () => {
    it('should set error and clear loading', () => {
      const state = { ...initialState, loading: true };
      const actual = productsReducer(state, setError('Failed to load'));
      
      expect(actual.error).toBe('Failed to load');
      expect(actual.loading).toBe(false);
    });
  });

  describe('updateStockQuantity', () => {
    it('should update stock quantity', () => {
      const state = { ...initialState, products: [mockProduct] };
      const actual = productsReducer(
        state,
        updateStockQuantity({ productId: '1', quantity: 150 })
      );
      
      expect(actual.products[0].stockQuantity).toBe(150);
    });

    it('should not update if product not found', () => {
      const state = { ...initialState, products: [mockProduct] };
      const actual = productsReducer(
        state,
        updateStockQuantity({ productId: '999', quantity: 150 })
      );
      
      expect(actual.products[0].stockQuantity).toBe(100);
    });
  });

  describe('decrementStock', () => {
    it('should decrement stock quantity', () => {
      const state = { ...initialState, products: [mockProduct] };
      const actual = productsReducer(
        state,
        decrementStock({ productId: '1', amount: 25 })
      );
      
      expect(actual.products[0].stockQuantity).toBe(75);
    });

    it('should not go below zero', () => {
      const state = { ...initialState, products: [mockProduct] };
      const actual = productsReducer(
        state,
        decrementStock({ productId: '1', amount: 150 })
      );
      
      expect(actual.products[0].stockQuantity).toBe(0);
    });

    it('should not update if product not found', () => {
      const state = { ...initialState, products: [mockProduct] };
      const actual = productsReducer(
        state,
        decrementStock({ productId: '999', amount: 25 })
      );
      
      expect(actual.products[0].stockQuantity).toBe(100);
    });
  });

  describe('incrementStock', () => {
    it('should increment stock quantity', () => {
      const state = { ...initialState, products: [mockProduct] };
      const actual = productsReducer(
        state,
        incrementStock({ productId: '1', amount: 50 })
      );
      
      expect(actual.products[0].stockQuantity).toBe(150);
    });

    it('should not update if product not found', () => {
      const state = { ...initialState, products: [mockProduct] };
      const actual = productsReducer(
        state,
        incrementStock({ productId: '999', amount: 50 })
      );
      
      expect(actual.products[0].stockQuantity).toBe(100);
    });
  });
});

