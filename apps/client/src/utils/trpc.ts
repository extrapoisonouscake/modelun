import type { AppRouter } from "@repo/api";

import { createTRPCClient, httpBatchLink } from "@trpc/client";

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: import.meta.env.VITE_TRPC_URL || "http://localhost:3002/trpc",
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
});
