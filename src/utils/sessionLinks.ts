// Utility functions for generating and managing participant session links

export interface SessionLinkData {
  token: string;
  link: string;
  expiryDate: string;
}

/**
 * Generate a unique token for a session link
 */
export function generateSessionToken(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomStr}`;
}

/**
 * Generate a session link for a participant
 * @param projectId - The project ID
 * @param participantId - The participant ID
 * @param expiryDays - Number of days until the link expires (default: 7)
 * @returns SessionLinkData with token, full link, and expiry date
 */
export function generateSessionLink(
  projectId: string,
  participantId: string,
  expiryDays: number = 7
): SessionLinkData {
  const token = generateSessionToken();
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiryDays);
  
  // Generate the full link - in production, this would use your domain
  const baseUrl = window.location.origin;
  const link = `${baseUrl}/session/${projectId}/${participantId}/${token}`;
  
  return {
    token,
    link,
    expiryDate: expiryDate.toISOString()
  };
}

/**
 * Check if a session link has expired
 */
export function isLinkExpired(expiryDate: string): boolean {
  return new Date(expiryDate) < new Date();
}

/**
 * Format expiry date for display
 */
export function formatExpiryDate(expiryDate: string): string {
  const date = new Date(expiryDate);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
