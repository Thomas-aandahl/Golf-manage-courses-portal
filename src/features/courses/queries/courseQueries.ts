import { useQuery, useQueryClient } from "@tanstack/react-query";
import { courseService, isNotFound } from "../api";
import type { Course } from "../model/types";
import { courseKeys } from "./courseKeys";

export function useCourses() {
  return useQuery({
    queryKey: courseKeys.list(),
    queryFn: () => courseService.list(),
  });
}

export function useCourse(id: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => courseService.get(id),
    // Coming from the list, the course is already in the cache: show it instantly instead of a spinner.
    initialData: () => queryClient.getQueryData<Course[]>(courseKeys.list())?.find((c) => c.id === id),
    initialDataUpdatedAt: () => queryClient.getQueryState(courseKeys.list())?.dataUpdatedAt,
    // A missing course will not appear by retrying.
    retry: (failureCount, error) => !isNotFound(error) && failureCount < 1,
  });
}
