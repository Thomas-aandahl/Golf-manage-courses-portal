// One place for cache keys, so queries, invalidations and optimistic updates can't drift apart.
export const courseKeys = {
  all: ["courses"] as const,
  list: () => [...courseKeys.all, "list"] as const,
  detail: (id: string) => [...courseKeys.all, "detail", id] as const,
};
