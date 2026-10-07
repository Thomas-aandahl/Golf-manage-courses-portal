import { describe, it, expect } from "vitest";
import { sortCourses } from "./sortCourses";
import type { Course } from "./types";

const make = (o: Partial<Course> & { id: string }): Course => ({
  name: o.id,
  city: "Copenhagen",
  country: "DK",
  par: 72,
  difficulty: 3,
  teeLengthMen: null,
  teeLengthWomen: null,
  imageUrl: null,
  featured: false,
  featuredAt: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  ...o,
});

const ids = (cs: Course[]) => cs.map((c) => c.id);

describe("sortCourses", () => {
  it("puts featured first, oldest featuredAt first", () => {
    const result = sortCourses([
      make({ id: "f2", featured: true, featuredAt: "2026-03-01T00:00:00Z" }),
      make({ id: "plain", createdAt: "2026-05-01T00:00:00Z" }),
      make({ id: "f1", featured: true, featuredAt: "2026-02-01T00:00:00Z" }),
    ]);
    expect(ids(result)).toEqual(["f1", "f2", "plain"]);
  });

  it("orders non-featured newest first", () => {
    const result = sortCourses([
      make({ id: "old", createdAt: "2026-01-01T00:00:00Z" }),
      make({ id: "new", createdAt: "2026-06-01T00:00:00Z" }),
      make({ id: "mid", createdAt: "2026-03-01T00:00:00Z" }),
    ]);
    expect(ids(result)).toEqual(["new", "mid", "old"]);
  });

  it("appends a newly featured course after the existing featured ones", () => {
    const result = sortCourses([
      make({ id: "f1", featured: true, featuredAt: "2026-02-01T00:00:00Z" }),
      make({ id: "f2", featured: true, featuredAt: "2026-03-01T00:00:00Z" }),
      make({ id: "f3", featured: true, featuredAt: "2026-04-01T00:00:00Z" }),
      make({ id: "f4", featured: true, featuredAt: "2026-05-01T00:00:00Z" }),
      make({ id: "rest" }),
    ]);
    expect(ids(result)).toEqual(["f1", "f2", "f3", "f4", "rest"]);
  });

  it("does not mutate the input", () => {
    const input = [make({ id: "a" }), make({ id: "b", featured: true, featuredAt: "2026-02-01T00:00:00Z" })];
    const copy = [...input];
    sortCourses(input);
    expect(input).toEqual(copy);
  });
});
