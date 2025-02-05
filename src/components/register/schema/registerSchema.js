import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),

  email: z
    .string()
    .email({ message: "Invalid email address" })
    .min(1, { message: "Email is required" }),

  phoneNumber: z
    .string()
    .min(12, {
      message: "Phone number must be at least 12 characters (including +)",
    })
    .max(16, {
      message: "Phone number must be at most 16 characters (including +)",
    })
    .regex(/^\+?[0-9]{10,15}$/, {
      message:
        "Phone number must be in the format +[country_code][phone_number]",
    }),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(20, { message: "Password must be at most 20 characters" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[\W_]/, {
      message: "Password must contain at least one special character",
    }),

  departmentId: z.string().optional(),
});
