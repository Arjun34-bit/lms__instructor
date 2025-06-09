import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    ),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+91[6-9]\d{9}$/, {
      message: "Phone number must be a valid Indian number starting with +91",
    }),
  departmentId: z.string().optional(),
});
