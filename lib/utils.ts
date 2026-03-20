import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format as dateFnsFormat } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(timestamp: string | Date | number): string {
  try {
    const date = new Date(timestamp);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '--:--:--';
    }
    return dateFnsFormat(date, 'HH:mm:ss');
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return '--:--:--';
  }
}

/**
 * Removes diacritics (accents) from a string for accent-insensitive matching.
 * e.g. "Athlético" -> "Athletico", "Göteborg" -> "Goteborg"
 */
export function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Normalizes a search term for accent-insensitive, case-insensitive matching.
 * Strips diacritics, lowercases, and trims whitespace.
 */
export function normalizeSearchTerm(str: string): string {
  return removeDiacritics(str.toLowerCase().trim());
}