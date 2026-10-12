import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./AppShell";
import { RouteError } from "./RouteError";

// Each page is its own chunk: the editor (form, dropzone, schema) is not downloaded until it is opened.
export const router = createBrowserRouter([
  {
    element: <AppShell />,
    // Catches errors thrown while rendering or lazy-loading any child route.
    errorElement: <RouteError />,
    // Shown while the first lazy route loads. It is quick, so a spinner would only flash.
    hydrateFallbackElement: null,
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import("../features/courses/pages/CoursesListPage")).CoursesListPage,
        }),
      },
      {
        path: "courses/new",
        lazy: async () => ({
          Component: (await import("../features/courses/pages/CourseEditorPage")).CourseEditorPage,
        }),
      },
      {
        path: "courses/:courseId/edit",
        lazy: async () => ({
          Component: (await import("../features/courses/pages/CourseEditorPage")).CourseEditorPage,
        }),
      },
      // Any other URL.
      { path: "*", element: <RouteError notFound /> },
    ],
  },
]);
