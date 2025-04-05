import { API_URL } from "@/constants";
import type { AppRouter } from "@repo/api";

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { toast } from "sonner";

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${API_URL}/trpc`,
      async fetch(url, options) {
        try {
          const response = await fetch(url, {
            ...options,
            credentials: "include",
          });
          if (!response.ok) {
            const error = await response.json();
            toast.error(error.message);
          }
          return response;
        } catch (e: any) {
          toast.error(e.message);
          throw e;
        }
      },
    }),
  ],
});
