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

const course = (id: string): Course => ({
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
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

const initialList = [course("a"), course("b"), course("c")];

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  queryClient.setQueryData(courseKeys.list(), initialList);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useDeleteCourse(), { wrapper });
  const listIds = () => queryClient.getQueryData<Course[]>(courseKeys.list())?.map((c) => c.id);
  return { result, listIds };
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
    service.list.mockResolvedValue([course("a"), course("c")]);
    const { result, listIds } = setup();

    act(() => result.current.mutate({ id: "b", name: "b" }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(listIds()).toEqual(["a", "c"]);
  });
});
