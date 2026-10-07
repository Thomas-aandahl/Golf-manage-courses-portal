import { createStore, del, get, set } from "idb-keyval";
import type { Course } from "../model/types";

/** Where a stored course's image lives. Seed images are static files; uploads are Blobs in IndexedDB. */
export type StoredImage = { source: "idb"; id: string } | { source: "static"; url: string };

/** The persisted record. Differs from `Course` only in how the image is referenced. */
export type StoredCourse = Omit<Course, "imageUrl"> & { image: StoredImage | null };

export type CourseStore = {
  /** Returns null when nothing has been stored yet (first visit). */
  load(): StoredCourse[] | null;
  save(courses: StoredCourse[]): void;
};

export type ImageStore = {
  put(id: string, blob: Blob): Promise<void>;
  get(id: string): Promise<Blob | undefined>;
  remove(id: string): Promise<void>;
};

const COURSES_KEY = "golf-portal:courses:v1";

export function createLocalStorageCourseStore(): CourseStore {
  return {
    load() {
      try {
        const raw = localStorage.getItem(COURSES_KEY);
        return raw ? (JSON.parse(raw) as StoredCourse[]) : null;
      } catch {
        return null; // Corrupt or unavailable storage: fall back to seed data.
      }
    },
    save(courses) {
      localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
    },
  };
}

// localStorage only holds strings and ~5 MB, so image Blobs go to IndexedDB.
export function createIndexedDbImageStore(): ImageStore {
  const store = createStore("golf-portal", "images");
  return {
    put: (id, blob) => set(id, blob, store),
    get: (id) => get<Blob>(id, store),
    remove: (id) => del(id, store),
  };
}

export function createMemoryCourseStore(initial: StoredCourse[] | null = null): CourseStore {
  let courses = initial;
  return {
    load: () => courses,
    save: (next) => {
      courses = next;
    },
  };
}

export function createMemoryImageStore(): ImageStore {
  const blobs = new Map<string, Blob>();
  return {
    put: async (id, blob) => void blobs.set(id, blob),
    get: async (id) => blobs.get(id),
    remove: async (id) => void blobs.delete(id),
  };
}
