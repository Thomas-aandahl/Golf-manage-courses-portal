import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Fresh for 30 s, so list → editor → list doesn't refetch every time.
        staleTime: 30_000,
        // One retry covers a flaky request without hiding a real failure for long.
        retry: 1,
        // Refetching on tab focus would make the mock's deliberate failures appear out of nowhere.
        refetchOnWindowFocus: false,
      },
    },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  // Lazy initial state: one client (and one cache) for the app's lifetime, not one per render.
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="bottom-right" richColors closeButton />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
