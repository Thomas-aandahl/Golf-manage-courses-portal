import { describe, expect, it } from "vitest";
import type { CourseInput } from "../model/types";
import { ApiError } from "./courseService";
import type { Failures } from "./mockFailures";
import { createMockCourseService } from "./mockCourseService";
import { createMemoryCourseStore, createMemoryImageStore } from "./storage";

const input = (overrides: Partial<CourseInput> = {}): CourseInput => ({
  name: "Course",
  city: "Copenhagen",
  country: "DK",
  par: 72,
  difficulty: 3,
  featured: false,
  teeLengthMen: null,
  teeLengthWomen: null,
  ...overrides,
});

function setup(failures: Partial<Failures> = {}) {
  let clock = Date.parse("2026-01-01T00:00:00.000Z");
  let nextId = 0;
  const service = createMockCourseService({
    courseStore: createMemoryCourseStore([]),
    imageStore: createMemoryImageStore(),
    latencyMs: [0, 0],
    failures: () => ({ load: false, save: false, delete: false, ...failures }),
    // Every call to now() moves the clock one minute, so each save happens at a distinct time.
    now: () => new Date((clock += 60_000)),
    createId: () => `id-${++nextId}`,
  });
  return service;
}

const names = (courses: { name: string }[]) => courses.map((c) => c.name);

describe("mock course service", () => {
  it("appends a course featured while editing after the already featured ones", async () => {
    const service = setup();
    await service.create(input({ name: "feat1", featured: true }));
    await service.create(input({ name: "plain-old" }));
    await service.create(input({ name: "feat2", featured: true }));
    const later = await service.create(input({ name: "feat3-later" }));
    await service.create(input({ name: "plain-new" }));

    await service.update(later.id, input({ name: "feat3-later", featured: true }));

    expect(names(await service.list())).toEqual(["feat1", "feat2", "feat3-later", "plain-new", "plain-old"]);
  });

  it("moves a re-featured course to the end of the featured group", async () => {
    const service = setup();
    const first = await service.create(input({ name: "first", featured: true }));
    await service.create(input({ name: "second", featured: true }));

    await service.update(first.id, input({ name: "first", featured: false }));
    await service.update(first.id, input({ name: "first", featured: true }));

    expect(names(await service.list())).toEqual(["second", "first"]);
  });

  it("throws NOT_FOUND for an unknown id", async () => {
    await expect(setup().get("missing")).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("leaves data untouched when a simulated delete fails", async () => {
    const service = setup({ delete: true });
    const course = await service.create(input({ name: "keep me" }));

    await expect(service.remove(course.id)).rejects.toBeInstanceOf(ApiError);
    expect(names(await service.list())).toEqual(["keep me"]);
  });

  it("keeps the old image when writing the updated course fails", async () => {
    // jsdom has no object URLs; the service only needs a string back.
    const originalCreateObjectURL = URL.createObjectURL;
    URL.createObjectURL = () => "blob:test";
    try {
      const memory = createMemoryCourseStore([]);
      let failWrites = false;
      const images = createMemoryImageStore();
      let nextId = 0;
      const service = createMockCourseService({
        courseStore: {
          load: memory.load,
          save: (courses) => {
            if (failWrites) throw new Error("QuotaExceededError");
            memory.save(courses);
          },
        },
        imageStore: images,
        latencyMs: [0, 0],
        failures: () => ({ load: false, save: false, delete: false }),
        createId: () => `id-${++nextId}`,
      });

      const oldFile = new File(["old"], "old.png", { type: "image/png" });
      const course = await service.create(input({ image: oldFile }));
      const oldImage = memory.load()?.[0]?.image;

      failWrites = true;
      const newFile = new File(["new"], "new.png", { type: "image/png" });
      await expect(service.update(course.id, input({ image: newFile }))).rejects.toThrow("QuotaExceededError");

      // The record still points at the old image, and that image still exists.
      expect(memory.load()?.[0]?.image).toEqual(oldImage);
      expect(oldImage?.source === "idb" && (await images.get(oldImage.id))).toBeTruthy();
    } finally {
      URL.createObjectURL = originalCreateObjectURL;
    }
  });
});
