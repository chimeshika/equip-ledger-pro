import { z } from 'zod';

/**
 * Schema for validating QR code data to prevent injection attacks.
 * Ensures serial_number is a safe, bounded string.
 */
export const qrCodeSchema = z.object({
  serial_number: z.string().trim().min(1).max(100),
});

/**
 * Safely parse QR code result and extract a validated serial number.
 * Returns the serial number string or null if invalid.
 */
export const parseQrResult = (rawResult: string): string | null => {
  try {
    const parsed = JSON.parse(rawResult);
    const validated = qrCodeSchema.safeParse(parsed);
    if (validated.success) {
      return validated.data.serial_number;
    }
  } catch {
    // Not JSON — treat as plain text serial, with length limit
  }
  // Fallback: use raw result truncated to 100 chars
  const trimmed = rawResult.trim().substring(0, 100);
  return trimmed.length > 0 ? trimmed : null;
};
