import { resolveFeaturedAt } from "../model/featured";
import { sortCourses } from "../model/sortCourses";
import type { Course, CourseInput } from "../model/types";
import { ApiError, type CourseService } from "./courseService";
import { mockFailures, type FailureKey, type Failures } from "./mockFailures";
import { seedCourses } from "./seed";
import {
  createIndexedDbImageStore,
  createLocalStorageCourseStore,
  type CourseStore,
  type ImageStore,
  type StoredCourse,
  type StoredImage,
} from "./storage";

type Options = {
  courseStore?: CourseStore;
  imageStore?: ImageStore;
  /** Random latency range per call, in ms. Use [0, 0] in tests. */
  latencyMs?: readonly [min: number, max: number];
  failures?: () => Failures;
  now?: () => Date;
  createId?: () => string;
};

const FAILURE_MESSAGES: Record<FailureKey, string> = {
  load: "Could not load courses",
  save: "Could not save the course",
  delete: "Could not delete the course",
};

export function createMockCourseService({
  courseStore = createLocalStorageCourseStore(),
  imageStore = createIndexedDbImageStore(),
  latencyMs = [300, 800],
  failures = mockFailures.get,
  now = () => new Date(),
  createId = () => crypto.randomUUID(),
}: Options = {}): CourseService {
  // One object URL per stored image for the lifetime of the page; revoked when the image is replaced or deleted.
  const objectUrls = new Map<string, string>();

  async function simulateNetwork(operation: FailureKey) {
    const [min, max] = latencyMs;
    const ms = min + Math.random() * (max - min);
    if (ms > 0) await new Promise((resolve) => setTimeout(resolve, ms));
    if (failures()[operation]) throw new ApiError("SERVER_ERROR", FAILURE_MESSAGES[operation]);
  }

  function readAll(): StoredCourse[] {
    const stored = courseStore.load();
    if (stored) return stored;
    const seeded = seedCourses();
    courseStore.save(seeded);
    return seeded;
  }

  function findOrThrow(courses: StoredCourse[], id: string): StoredCourse {
    const course = courses.find((c) => c.id === id);
    if (!course) throw new ApiError("NOT_FOUND", "Course not found");
    return course;
  }

  async function resolveImageUrl(image: StoredImage | null): Promise<string | null> {
    if (!image) return null;
    if (image.source === "static") return image.url;

    const cached = objectUrls.get(image.id);
    if (cached) return cached;
    const blob = await imageStore.get(image.id);
    if (!blob) return null; // Storage was cleared: fall back to the placeholder.
    const url = URL.createObjectURL(blob);
    objectUrls.set(image.id, url);
    return url;
  }

  async function saveImage(file: File): Promise<StoredImage> {
    const id = createId();
    await imageStore.put(id, file);
    return { source: "idb", id };
  }

  async function deleteImage(image: StoredImage | null) {
    if (image?.source !== "idb") return;
    await imageStore.remove(image.id);
    const url = objectUrls.get(image.id);
    if (url) URL.revokeObjectURL(url);
    objectUrls.delete(image.id);
  }

  async function toCourse({ image, ...rest }: StoredCourse): Promise<Course> {
    return { ...rest, imageUrl: await resolveImageUrl(image) };
  }

  return {
    async list() {
      await simulateNetwork("load");
      // Ordering is the "server's" job, like an ORDER BY in a real API.
      return sortCourses(await Promise.all(readAll().map(toCourse)));
    },

    async get(id) {
      await simulateNetwork("load");
      return toCourse(findOrThrow(readAll(), id));
    },

    async create({ image, ...fields }: CourseInput) {
      await simulateNetwork("save");
      const timestamp = now().toISOString();
      const created: StoredCourse = {
        ...fields,
        id: createId(),
        image: image ? await saveImage(image) : null,
        featuredAt: resolveFeaturedAt(null, fields.featured, timestamp),
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      courseStore.save([...readAll(), created]);
      return toCourse(created);
    },

    async update(id, { image, ...fields }: CourseInput) {
      await simulateNetwork("save");
      const courses = readAll();
      const existing = findOrThrow(courses, id);
      const timestamp = now().toISOString();

      let nextImage = existing.image;
      if (image) {
        nextImage = await saveImage(image);
        await deleteImage(existing.image);
      }

      const updated: StoredCourse = {
        ...existing,
        ...fields,
        image: nextImage,
        featuredAt: resolveFeaturedAt(existing, fields.featured, timestamp),
        updatedAt: timestamp,
      };
      courseStore.save(courses.map((c) => (c.id === id ? updated : c)));
      return toCourse(updated);
    },

    async remove(id) {
      await simulateNetwork("delete");
      const courses = readAll();
      const existing = findOrThrow(courses, id);
      courseStore.save(courses.filter((c) => c.id !== id));
      await deleteImage(existing.image);
    },
  };
}
