import type { Course, CourseInput } from "../model/types";

/**
 * The only contract the rest of the app knows about.
 * Swapping the mock for a real backend means writing another implementation of this type
 * (e.g. fetch + multipart upload) and changing the export in `./index.ts`.
 */
export type CourseService = {
  /** All courses in display order: featured first (oldest featured first), then newest first. */
  list(): Promise<Course[]>;
  /** Throws `ApiError` with code `NOT_FOUND` if the course does not exist. */
  get(id: string): Promise<Course>;
  create(input: CourseInput): Promise<Course>;
  update(id: string, input: CourseInput): Promise<Course>;
  remove(id: string): Promise<void>;
};

export type ApiErrorCode = "NOT_FOUND" | "SERVER_ERROR";

export class ApiError extends Error {
  readonly code: ApiErrorCode;

  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

export const isNotFound = (error: unknown) => error instanceof ApiError && error.code === "NOT_FOUND";
