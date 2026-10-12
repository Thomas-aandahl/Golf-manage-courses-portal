import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Course } from "../model/types";
import { courseKeys } from "./courseKeys";
import { useDeleteCourse } from "./courseMutations";

// Mock at the service boundary: React Query and the hook run for real.
const service = vi.hoisted(() => ({
  list: vi.fn<() => Promise<Course[]>>(),
  remove: vi.fn<(id: string) => Promise<void>>(),
}));
vi.mock("../api", () => ({ courseService: service }));

const course = (id: string, createdAt: string): Course => ({
  id,
  name: id,
  city: "Copenhagen",
  country: "DK",
  par: 72,
  difficulty: 3,
  teeLengthMen: null,
  teeLengthWomen: null,
  featured: false,
  featuredAt: null,
  imageUrl: null,
  createdAt,
  updatedAt: createdAt,
});

// Newest first, so this is also the order sortCourses produces.
const a = course("a", "2026-03-01T00:00:00.000Z");
const b = course("b", "2026-02-01T00:00:00.000Z");
const c = course("c", "2026-01-01T00:00:00.000Z");
const initialList = [a, b, c];

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  queryClient.setQueryData(courseKeys.list(), initialList);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useDeleteCourse(), { wrapper });
  const listIds = () => queryClient.getQueryData<Course[]>(courseKeys.list())?.map((c) => c.id);
  const isInvalidated = () => queryClient.getQueryState(courseKeys.list())?.isInvalidated;
  return { result, listIds, isInvalidated };
}

/** A promise we resolve or reject from the test, so we can look at the cache while the request is in flight. */
function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("useDeleteCourse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    service.list.mockResolvedValue(initialList);
  });

  it("removes the course immediately and restores it in place when the delete fails", async () => {
    const request = deferred();
    service.remove.mockReturnValue(request.promise);
    const { result, listIds } = setup();

    act(() => result.current.mutate({ id: "b", name: "b" }));

    // Optimistic: gone before the "server" has answered.
    await waitFor(() => expect(listIds()).toEqual(["a", "c"]));

    await act(async () => request.reject(new Error("Server error")));

    // Rolled back to the exact previous order.
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(listIds()).toEqual(["a", "b", "c"]);
  });

  it("keeps the course removed when the delete succeeds", async () => {
    service.remove.mockResolvedValue(undefined);
    service.list.mockResolvedValue([a, c]);
    const { result, listIds } = setup();

    act(() => result.current.mutate({ id: "b", name: "b" }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(listIds()).toEqual(["a", "c"]);
  });

  it("restores only the failed course when two deletes overlap", async () => {
    const deleteB = deferred();
    const deleteC = deferred();
    service.remove.mockImplementation((id) => (id === "b" ? deleteB.promise : deleteC.promise));
    const { result, listIds, isInvalidated } = setup();

    act(() => result.current.mutate({ id: "b", name: "b" }));
    await waitFor(() => expect(listIds()).toEqual(["a", "c"]));
    act(() => result.current.mutate({ id: "c", name: "c" }));
    await waitFor(() => expect(listIds()).toEqual(["a"]));

    await act(async () => deleteB.reject(new Error("Server error")));

    // b comes back; c, still being deleted, does not – and the list is not refetched while c is in flight.
    await waitFor(() => expect(listIds()).toEqual(["a", "b"]));
    expect(isInvalidated()).toBe(false);

    await act(async () => deleteC.resolve());

    // The last delete to settle invalidates the list, so it is refetched from the server.
    await waitFor(() => expect(isInvalidated()).toBe(true));
    expect(listIds()).toEqual(["a", "b"]);
  });
});
