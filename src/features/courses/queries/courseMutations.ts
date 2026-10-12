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

const deleteMutationKey = [...courseKeys.all, "delete"] as const;

/**
 * Optimistic delete: the card disappears immediately; if the request fails it is put back
 * where it belongs and the user is told. Safe with several deletes in flight at once.
 */
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: deleteMutationKey,
    mutationFn: (course: Pick<Course, "id" | "name">) => courseService.remove(course.id),

    onMutate: async (course) => {
      // Stop an in-flight refetch from overwriting the optimistic state with stale data.
      await queryClient.cancelQueries({ queryKey: courseKeys.list() });
      const removed = queryClient.getQueryData<Course[]>(courseKeys.list())?.find((c) => c.id === course.id);
      queryClient.setQueryData<Course[]>(courseKeys.list(), (list) => list?.filter((c) => c.id !== course.id));
      return { removed };
    },

    onError: (_error, course, onMutateResult) => {
      // Put back only this course, not a whole-list snapshot, which would also undo other deletes
      // that happened meanwhile. sortCourses gives it the same position it had before.
      const removed = onMutateResult?.removed;
      if (removed) {
        queryClient.setQueryData<Course[]>(courseKeys.list(), (list) =>
          list ? sortCourses([...list.filter((c) => c.id !== removed.id), removed]) : list,
        );
      }
      toast.error(`Could not delete "${course.name}". It has been restored.`);
    },

    onSuccess: (_data, course) => {
      queryClient.removeQueries({ queryKey: courseKeys.detail(course.id) });
      toast.success(`"${course.name}" was deleted`);
    },

    // Refetch so the cache ends up matching the server, but only when the last delete settles,
    // otherwise the refetch could bring back a card whose delete is still in flight.
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: deleteMutationKey }) === 1) {
        return queryClient.invalidateQueries({ queryKey: courseKeys.list() });
      }
    },
  });
}
