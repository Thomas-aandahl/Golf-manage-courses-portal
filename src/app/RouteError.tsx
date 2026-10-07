import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";

export function RouteError({ notFound = false }: { notFound?: boolean }) {
  const error = useRouteError();
  const is404 = notFound || (isRouteErrorResponse(error) && error.status === 404);

  return (
    <div role="alert" style={{ padding: "var(--page-gutter)" }}>
      <h2>{is404 ? "Page not found" : "Something went wrong"}</h2>
      <p>
        {is404 ? "The page you are looking for does not exist." : "Try reloading the page."}{" "}
        <Link to="/">Back to courses</Link>
      </p>
    </div>
  );
}
