import { describe, it, expect } from 'vitest';
import userReducer, { setUserRole, setUserId, toggleUserRole } from '../userSlice';
import type { UserRole } from '../userSlice';

describe('userSlice', () => {
  const initialState = {
    role: 'admin' as UserRole,
    name: 'Naveen Ramkumar',
    email: 'naveen.driver@gmail.com',
    userId: 'driver-2',
  };

  it('should return the initial state', () => {
    expect(userReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setUserRole', () => {
    it('should set user role to admin', () => {
      const actual = userReducer(initialState, setUserRole('admin'));
      expect(actual.role).toBe('admin');
    });

    it('should set user role to driver', () => {
      const actual = userReducer(initialState, setUserRole('driver'));
      expect(actual.role).toBe('driver');
    });
  });

  describe('setUserId', () => {
    it('should set user ID', () => {
      const actual = userReducer(initialState, setUserId('driver-123'));
      expect(actual.userId).toBe('driver-123');
    });

    it('should set user ID to null', () => {
      const actual = userReducer(initialState, setUserId(null));
      expect(actual.userId).toBe(null);
    });
  });

  describe('toggleUserRole', () => {
    it('should toggle from admin to driver', () => {
      const state = { ...initialState, role: 'admin' as UserRole, userId: null };
      const actual = userReducer(state, toggleUserRole());
      expect(actual.role).toBe('driver');
      expect(actual.userId).toBe('driver-1');
    });

    it('should toggle from driver to admin', () => {
      const state = { ...initialState, role: 'driver' as UserRole, userId: 'driver-1' };
      const actual = userReducer(state, toggleUserRole());
      expect(actual.role).toBe('admin');
      expect(actual.userId).toBe(null);
    });
  });
});

