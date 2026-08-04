/**
 * Format connection errors with a human-readable message.
 *
 * When the Supabase server is down or unreachable, fetch requests fail
 * with network errors like "Failed to fetch", "NetworkError", "timeout",
 * or AbortError. These are distinct from HTTP errors (permission denied,
 * RLS violations, bad data) which come back with a specific message.
 *
 * Route all hook error strings through this helper so users see a clear
 * "server down" message instead of a cryptic browser error.
 */

// Patterns that indicate a network/connection error, not an app error.
const NETWORK_ERROR_PATTERNS = [
  'failed to fetch',
  'networkerror',
  'network error',
  'network request failed',
  'timeout',
  'timed out',
  'aborted',
  'err_connection',
  'err_network',
  'err_internet_disconnected',
  'err_name_not_resolved',
  'err_address_unreachable',
  'load failed',
  'connection refused',
  'connection reset',
  'socket hang up',
];

export function formatConnectionError(rawError: string | null): string | null {
  if (!rawError) return null;

  const lower = rawError.toLowerCase();

  for (const pattern of NETWORK_ERROR_PATTERNS) {
    if (lower.includes(pattern)) {
      return "Can't reach the server. It may be down or you may be offline.";
    }
  }

  // Not a network error — return the original message unchanged.
  return rawError;
}
