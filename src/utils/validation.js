/**
 * Clean & sanitize roll numbers entered by students
 */
export function sanitizeRollNumber(input) {
  if (!input) return '';
  return String(input).replace(/[^a-zA-Z0-9]/g, '').trim();
}

/**
 * Format timestamp into readable time string (e.g. 7:12 PM)
 */
export function formatTime(timestamp) {
  if (!timestamp) return 'Just now';
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch (e) {
    return 'Just now';
  }
}

/**
 * Format timestamp into readable date & time string
 */
export function formatDateTime(timestamp) {
  if (!timestamp) return '';
  try {
    const date = new Date(timestamp);
    return date.toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  } catch (e) {
    return '';
  }
}
