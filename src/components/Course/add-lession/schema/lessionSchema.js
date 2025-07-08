import { z } from "zod";

export const lessionSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  lectureName: z.string().min(1, "Lecture name is required"),
  description: z.string().min(1, "Description is required"),
  videos: z.string().min(1, "Videos field is required"),
});
