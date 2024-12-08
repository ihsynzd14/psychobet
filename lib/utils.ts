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