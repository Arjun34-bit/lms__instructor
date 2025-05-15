import { z } from "zod";

export const addClassSchema = z
  .object({
    title: z
      .string()
      .min(5, { message: "Title is required (Min length of 5)" })
      .max(250, { message: "Title must be less than 250 characters" }),
      
      description: z
      .string()
      .min(30, { message: "Description is required. (Min length of 30)" }),

    courseId: z
      .string()
      .min(1, { message: "Course is required" }),

    startDate: z
      .date({ message: "Start date and time are required" })
      .refine((date) => date >= new Date(), {
        message: "Start date and time must be in the future",
      }),

    endDate: z
      .date({ message: "End date and time are required" }),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End time must be after the start time",
    path: ["endDate"],
  });