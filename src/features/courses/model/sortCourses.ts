import type { Course } from "./types";

// A featured course without `featuredAt` shouldn't happen, but if it does it sorts last.
const time = (iso: string | null) => (iso ? Date.parse(iso) : Number.MAX_SAFE_INTEGER);

/**
 * The display order, and the only place it is defined:
 * featured first, oldest `featuredAt` first (so a newly featured course joins the end of the group),
 * then the rest, newest `createdAt` first.
 */
export function sortCourses(courses: readonly Course[]): Course[] {
  // filter() returns new arrays, so sort() never mutates the caller's list (the React Query cache).
  const featured = courses
    .filter((c) => c.featured)
    .sort((a, b) => time(a.featuredAt) - time(b.featuredAt));

  const rest = courses
    .filter((c) => !c.featured)
    .sort((a, b) => time(b.createdAt) - time(a.createdAt));

  return [...featured, ...rest];
}
