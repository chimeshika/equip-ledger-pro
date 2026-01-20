import { z } from 'zod';

// Equipment validation schema
export const equipmentSchema = z.object({
  item_name: z.string().trim().min(1, "Item name is required").max(200, "Item name must be less than 200 characters"),
  category: z.string().min(1, "Category is required").max(100, "Category must be less than 100 characters"),
  brand: z.string().trim().min(1, "Brand is required").max(200, "Brand must be less than 200 characters"),
  serial_number: z.string().trim().min(1, "Serial number is required").max(100, "Serial number must be less than 100 characters"),
  price: z.number().positive("Price must be positive").max(100000000, "Price seems too high for LKR").optional().nullable(),
  notes: z.string().max(2000, "Notes must be less than 2000 characters").optional().nullable(),
  location: z.string().max(200, "Location must be less than 200 characters").optional().nullable(),
  assigned_to: z.string().max(200, "Assigned to must be less than 200 characters").optional().nullable(),
  supplier: z.string().max(200, "Supplier must be less than 200 characters").optional().nullable(),
  warranty_period: z.string().max(100, "Warranty period must be less than 100 characters").optional().nullable(),
  condition: z.enum(["Excellent", "Good", "Fair", "Poor", "Out of Service"], {
    required_error: "Condition is required"
  }),
});

// Repair validation schema
export const repairSchema = z.object({
  description: z.string().trim().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
  repair_cost: z.number().positive("Repair cost must be positive").max(10000000, "Repair cost seems too high for LKR"),
  repair_date: z.string().refine(date => !isNaN(Date.parse(date)), "Invalid date format"),
  notes: z.string().max(2000, "Notes must be less than 2000 characters").optional().nullable(),
  equipment_id: z.string().uuid("Invalid equipment ID"),
});

// Auth validation schemas
export const signUpSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password must be less than 100 characters"),
  firstName: z.string().trim().min(1, "First name is required").max(100, "First name must be less than 100 characters"),
  lastName: z.string().trim().min(1, "Last name is required").max(100, "Last name must be less than 100 characters"),
  phone: z.string().trim().max(20, "Phone must be less than 20 characters").optional().or(z.literal('')),
});

export const signInSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  password: z.string().min(1, "Password is required"),
});

// Profile update validation
export const profileUpdateSchema = z.object({
  full_name: z.string().trim().max(200, "Full name must be less than 200 characters").optional(),
  phone: z.string().trim().max(20, "Phone must be less than 20 characters").optional().nullable(),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters").optional(),
  avatar_url: z.string().url("Invalid URL").max(500, "URL must be less than 500 characters").optional().nullable(),
});
