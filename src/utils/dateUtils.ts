// Date formatting utilities for consistent display across the app

/**
 * Format a date string (YYYY-MM-DD) to a readable format
 * Uses 'T00:00:00' to prevent timezone shifts
 */
export function formatDate(dateString: string | undefined, format: 'short' | 'long' = 'short'): string {
  if (!dateString) return 'Not set';
  
  try {
    // Add T00:00:00 to prevent timezone shifting
    const date = new Date(dateString + 'T00:00:00');
    
    if (isNaN(date.getTime())) return 'Not set';
    
    if (format === 'long') {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    
    // Short format: "Mar 9, 2026"
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } catch {
    return 'Not set';
  }
}

/**
 * Format a date range (start - end)
 */
export function formatDateRange(startDate: string | undefined, endDate: string | undefined, format: 'short' | 'long' = 'short'): string | null {
  if (!startDate && !endDate) return null;
  
  const start = formatDate(startDate, format);
  const end = formatDate(endDate, format);
  
  return `${start} - ${end}`;
}

/**
 * Format a timestamp (ISO string) to a readable date
 */
export function formatTimestamp(timestamp: string | undefined, format: 'short' | 'long' = 'short'): string {
  if (!timestamp) return 'Not set';
  
  try {
    const date = new Date(timestamp);
    
    if (isNaN(date.getTime())) return 'Not set';
    
    if (format === 'long') {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } catch {
    return 'Not set';
  }
}