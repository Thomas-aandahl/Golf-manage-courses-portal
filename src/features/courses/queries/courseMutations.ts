import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { courseService } from "../api";
import { sortCourses } from "../model/sortCourses";
import type { Course, CourseInput } from "../model/types";
import { courseKeys } from "./courseKeys";

/**
 * Write the saved course straight into the cache so the list is correct the moment we navigate back,
 * then invalidate so the server's version wins if anything differs.
 */
function syncSavedCourse(queryClient: QueryClient, course: Course) {
  queryClient.setQueryData(courseKeys.detail(course.id), course);
  queryClient.setQueryData<Course[]>(courseKeys.list(), (list) =>
    list ? sortCourses([...list.filter((c) => c.id !== course.id), course]) : list,
  );
  void queryClient.invalidateQueries({ queryKey: courseKeys.list() });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CourseInput) => courseService.create(input),
    onSuccess: (course) => {
      syncSavedCourse(queryClient, course);
      toast.success(`"${course.name}" was created`);
    },
  });
}

export function useUpdateCourse(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CourseInput) => courseService.update(id, input),
    onSuccess: (course) => {
      syncSavedCourse(queryClient, course);
      toast.success(`"${course.name}" was updated`);
    },
  });
}

/**
 * Optimistic delete: the card disappears immediately; if the request fails it is put back
 * exactly where it was and the user is told.
 */
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (course: Pick<Course, "id" | "name">) => courseService.remove(course.id),

    onMutate: async (course) => {
      // Stop an in-flight refetch from overwriting the optimistic state with stale data.
      await queryClient.cancelQueries({ queryKey: courseKeys.list() });
      const previous = queryClient.getQueryData<Course[]>(courseKeys.list());
      queryClient.setQueryData<Course[]>(courseKeys.list(), (list) => list?.filter((c) => c.id !== course.id));
      return { previous };
    },

    onError: (_error, course, onMutateResult) => {
      if (onMutateResult?.previous) queryClient.setQueryData(courseKeys.list(), onMutateResult.previous);
      toast.error(`Could not delete "${course.name}". It has been restored.`);
    },

    onSuccess: (_data, course) => {
      queryClient.removeQueries({ queryKey: courseKeys.detail(course.id) });
      toast.success(`"${course.name}" was deleted`);
    },

    // Success or failure, refetch so the cache ends up matching the server.
    onSettled: () => queryClient.invalidateQueries({ queryKey: courseKeys.list() }),
  });
}
