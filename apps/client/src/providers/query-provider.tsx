import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../utils/trpc";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
