import { describe, expect, it } from "vitest";
import { resolveFeaturedAt } from "./featured";

const NOW = "2026-06-01T12:00:00.000Z";
const EARLIER = "2026-02-01T12:00:00.000Z";

describe("resolveFeaturedAt", () => {
  it("uses the save time when a new course is created as featured", () => {
    expect(resolveFeaturedAt(null, true, NOW)).toBe(NOW);
  });

  it("uses the save time when an existing course becomes featured", () => {
    expect(resolveFeaturedAt({ featured: false, featuredAt: null }, true, NOW)).toBe(NOW);
  });

  it("keeps the original time when a featured course is edited", () => {
    expect(resolveFeaturedAt({ featured: true, featuredAt: EARLIER }, true, NOW)).toBe(EARLIER);
  });

  it("clears the time when a course is unfeatured", () => {
    expect(resolveFeaturedAt({ featured: true, featuredAt: EARLIER }, false, NOW)).toBeNull();
  });
});
