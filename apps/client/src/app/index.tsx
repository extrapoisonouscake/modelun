import { Toaster } from "@/components/ui/sonner";
import { useUser } from "@/hooks/use-user";
import { AppRoutes } from "@/providers/app-routes";

import { destroySocket, initSocket, socket } from "@/lib/io";
import { useEffect } from "react";
export function App() {
  const { isLoggedIn } = useUser();
  useEffect(() => {
    if (isLoggedIn) {
      initSocket();
    } else if (socket?.active) {
      destroySocket();
    }
  }, [isLoggedIn]);
  return (
    <>
      <Toaster richColors />
      <main className="flex justify-center flex-col items-stretch p-4">
        <AppRoutes />
      </main>
    </>
  );
}
