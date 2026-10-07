import { createMockCourseService } from "./mockCourseService";

// The single place that decides which implementation the app uses.
export const courseService = createMockCourseService();

export { ApiError, isNotFound, type CourseService } from "./courseService";
export { mockFailures, type FailureKey } from "./mockFailures";
