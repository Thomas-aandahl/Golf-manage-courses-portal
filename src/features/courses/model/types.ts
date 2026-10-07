import type { CourseFormValues } from "./courseSchema";

/** A course as the app sees it – the shape a real API would return. */
export type Course = Omit<CourseFormValues, "image"> & {
  id: string;
  imageUrl: string | null;
  featuredAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** What create/update accept: the validated form values. `image` undefined = keep the current image. */
export type CourseInput = CourseFormValues;
