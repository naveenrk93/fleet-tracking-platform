/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calculate estimated time of arrival based on distance and speed
 */
export function calculateETA(distanceInMeters: number, speedInKmh: number = 40): Date {
  const hours = distanceInMeters / 1000 / speedInKmh;
  const milliseconds = hours * 60 * 60 * 1000;
  return new Date(Date.now() + milliseconds);
}

/**
 * Calculate total order value
 */
export function calculateOrderTotal(
  items: Array<{ quantity: number; price: number }>
): number {
  return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
}

/**
 * Calculate vehicle utilization percentage
 */
export function calculateUtilization(used: number, capacity: number): number {
  if (capacity === 0) return 0;
  return Math.min(100, Math.round((used / capacity) * 100));
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Calculate average
 */
export function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

