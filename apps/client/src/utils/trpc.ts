import { API_URL } from "@/constants";
import { notifyAllCookiesListeners } from "@/hooks/use-cookie";
import type { AppRouter } from "@repo/api";

import { createTRPCClient, httpBatchLink, TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import { toast } from "sonner";

export const customLink: TRPCLink<AppRouter> = () => {
  // here we just got initialized in the app - this happens once per app
  // useful for storing cache for instance
  return ({ next, op }) => {
    // this is when passing the result to the next link
    // each link needs to return an observable which propagates results
    return observable((observer) => {
      const unsubscribe = next(op).subscribe({
        next(value) {
          observer.next(value);
        },
        error(err) {
          toast.error(err.message);
          observer.error(err);
        },
        complete() {
          observer.complete();
          notifyAllCookiesListeners();
        },
      });
      return unsubscribe;
    });
  };
};

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    customLink,
    httpBatchLink({
      url: `${API_URL}/trpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
});
