import { z } from "zod";
import { COUNTRY_CODES } from "./countries";

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

// Used on its own by the dropzone so an invalid file is rejected before it reaches the form.
export const imageFileSchema = z
  .instanceof(File)
  .refine((file) => (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type), {
    error: "Only JPG, PNG or WebP images allowed",
  })
  .refine((file) => file.size <= MAX_IMAGE_BYTES, { error: "Image must be 10 MB or smaller" });

// Text that isn't a number arrives as NaN (see CourseForm); an empty field arrives as undefined/null.
const teeLength = z
  .number({ error: "Enter a length in metres" })
  .int("Use whole metres")
  .min(1000, "Must be at least 1 000 m")
  .max(8000, "Must be at most 8 000 m")
  .nullable();

export const courseFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  city: z.string().trim().min(1, "City is required"),
  country: z.enum(COUNTRY_CODES, { error: "Select a country" }),
  par: z
    .number({ error: (issue) => (issue.input === undefined ? "Par required" : "Par must be a number") })
    .int("Par must be a whole number")
    .min(30, "Par must be at least 30")
    .max(90, "Par must be at most 90"),
  difficulty: z.number({ error: "Select a difficulty" }).int().min(1).max(5),
  featured: z.boolean(),
  teeLengthMen: teeLength,
  teeLengthWomen: teeLength,
  // Only set when the user picks a new file. Undefined means "keep the current image".
  image: imageFileSchema.optional(),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;
