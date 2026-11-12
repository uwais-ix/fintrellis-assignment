import { z } from "zod";

export const postFormSchema = z.object({
  title: z.string().trim().min(1, "Enter a title.").max(160, "Use at most 160 characters."),
  content: z
    .string()
    .trim()
    .min(1, "Write some content.")
    .max(20000, "Use at most 20,000 characters."),
});

export type PostFormValues = z.infer<typeof postFormSchema>;
