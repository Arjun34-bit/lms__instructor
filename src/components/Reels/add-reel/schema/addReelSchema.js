import { z } from "zod";

export const addReelSchema = z.object({
  title: z
    .string()
    .max(250, { message: "Title must be less than 250 characters" }),
  description: z
    .string()
    .min(30, { message: "Description is required. (Min length of 30)" }),
  tags: z.array(z.string()).min(1, { message: "At least one tag is required" }),
  courseId: z.string(),
  courseLessionId: z.string(),
  video: z
    .instanceof(File, { message: "Video is required" })
    .refine(
      (file) => file.size < 50 * 1024 * 1024,
      "File must be less than 50MB"
    ),
});
