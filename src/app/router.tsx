import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./AppShell";
import { RouteError } from "./RouteError";

// Each page is its own chunk: the editor (form, dropzone, schema) is not downloaded until it is opened.
export const router = createBrowserRouter([
  {
    element: <AppShell />,
    errorElement: <RouteError />,
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
      { path: "*", element: <RouteError notFound /> },
    ],
  },
]);
