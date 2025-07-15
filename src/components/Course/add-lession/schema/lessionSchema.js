import { z } from "zod";

export const lessionSchema = z.object({
  lectures: z.array(
    z.object({
      courseId: z.string(),
      lectureName: z.string().min(4, { message: "Lecture name is required" }),
      description: z.string().min(10, { message: "Description is required" }),
      isFreePreview: z.boolean().optional(),
      videos: z.array(
        z.object({
          title: z.string().min(1, { message: "Title is required" }),
          description: z.string().optional(),
          file: z.any(),
        })
      ),
    })
  ),
});
