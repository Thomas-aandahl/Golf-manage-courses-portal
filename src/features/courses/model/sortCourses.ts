
import type { Course } from "./types";

const time = (iso:string|null)=>
    iso? Date.parse(iso) :Number.MAX_SAFE_INTEGER;

export function sortCourses(courses: readonly Course[]): Course[] {
    const featured = courses
    .filter((c) => c.featured)
    .sort((a, b) =>time(a.featuredAt) - time(b.featuredAt));

    const rest = courses
    .filter((c) => !c.featured)
    .sort((a, b) => time(b.createdAt) -time(a.createdAt));

    return [...featured,...rest];
}