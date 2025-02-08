import { z } from "zod";

export const addCourseSchema = z
  .object({
    title: z
      .string()
      .min(5, { message: "Title is required (Min length of 5)" })
      .max(250, { message: "Title must be less than 250 characters" }),

    description: z
      .string()
      .min(30, { message: "Description is required. (Min length of 30)" }),

    level: z.enum(["Begineer", "Intermediate", "Advanced"]),

    languageId: z.string().min(1, { message: "Language is required" }),

    categoryId: z.string().min(1, { message: "Category is required" }),

    departmentId: z.string().min(1, { message: "Department is required" }),

    subjectId: z.string().min(1, { message: "Subject is required" }),

    startDate: z.date(),

    endDate: z.date(),

    price: z.number(),

    thumbnail: z
      .instanceof(File, { message: "Thumbnail is required" })
      .refine(
        (file) => file.size < 5 * 1024 * 1024,
        "File must be less than 5MB"
      ),
  })
  .refine((data) => data.startDate >= new Date(), {
    message: "Start date must be today or later",
    path: ["startDate"], // Specifies the error field
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after the start date",
    path: ["endDate"], // Specifies the error field
  });
