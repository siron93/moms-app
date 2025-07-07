/**
 * Date utilities for consistent timezone handling
 * All dates are stored as UTC timestamps and displayed in user's local timezone
 */

/**
 * Get current UTC timestamp
 */
export const getUTCTimestamp = (): number => {
  return Date.now(); // Date.now() always returns UTC milliseconds
};

/**
 * Convert a local date/time to UTC timestamp
 * @param year Local year
 * @param month Local month (0-11)
 * @param day Local day
 * @param hours Local hours (default 0)
 * @param minutes Local minutes (default 0)
 */
export const localDateToUTC = (
  year: number,
  month: number,
  day: number,
  hours = 0,
  minutes = 0
): number => {
  return new Date(year, month, day, hours, minutes).getTime();
};

/**
 * Format a UTC timestamp to local date string
 * @param timestamp UTC timestamp
 * @param options Intl.DateTimeFormat options
 */
export const formatLocalDate = (
  timestamp: number,
  options?: Intl.DateTimeFormatOptions
): string => {
  return new Date(timestamp).toLocaleDateString(undefined, options);
};

/**
 * Format a UTC timestamp to local time string
 * @param timestamp UTC timestamp
 * @param options Intl.DateTimeFormat options
 */
export const formatLocalTime = (
  timestamp: number,
  options?: Intl.DateTimeFormatOptions
): string => {
  return new Date(timestamp).toLocaleTimeString(undefined, options);
};

/**
 * Format a UTC timestamp to local date and time string
 * @param timestamp UTC timestamp
 * @param options Intl.DateTimeFormat options
 */
export const formatLocalDateTime = (
  timestamp: number,
  options?: Intl.DateTimeFormatOptions
): string => {
  return new Date(timestamp).toLocaleString(undefined, options);
};

/**
 * Get the start of day in local timezone as UTC timestamp
 * @param timestamp UTC timestamp
 */
export const getLocalDayStart = (timestamp: number): number => {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

/**
 * Get the timezone offset in minutes
 */
export const getTimezoneOffset = (): number => {
  return new Date().getTimezoneOffset();
};

/**
 * Get timezone abbreviation (e.g., "PST", "EDT")
 */
export const getTimezoneAbbreviation = (): string => {
  const date = new Date();
  const timeString = date.toLocaleTimeString('en-US', { timeZoneName: 'short' });
  const parts = timeString.split(' ');
  return parts[parts.length - 1] || '';
};