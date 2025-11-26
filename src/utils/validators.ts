/**
 * Validate Indian phone number
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate Indian vehicle registration number
 */
export function isValidRegistrationNumber(regNo: string): boolean {
  const cleaned = regNo.replace(/\s+/g, '').toUpperCase();
  // Format: XX00XX0000 (e.g., TN01AB1234) - requires exactly 2 letters at the end
  return /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/.test(cleaned);
}

/**
 * Validate license number
 */
export function isValidLicenseNumber(license: string): boolean {
  const cleaned = license.replace(/\s+/g, '').toUpperCase();
  // Indian DL format: XX0000000000000
  return /^[A-Z]{2}\d{13}$/.test(cleaned);
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Validate if date is in the future
 */
export function isFutureDate(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d > new Date();
}

/**
 * Validate if date is in the past
 */
export function isPastDate(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < new Date();
}

