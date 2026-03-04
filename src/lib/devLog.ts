/**
 * Development-only error logging utility.
 * In production, console.error calls are suppressed to prevent
 * information leakage (database schemas, RLS details, internal paths).
 */
export const devError = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    console.error(...args);
  }
};
