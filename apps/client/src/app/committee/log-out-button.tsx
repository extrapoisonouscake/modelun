import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { trpcClient } from "@/utils/trpc";
import { LogOutIcon } from "lucide-react";

import { useNavigate } from "react-router";

export function LogOutButton({ className }: { className?: string }) {
  const navigate = useNavigate();
  const store = useAppStore();
  return (
    <Button
      size="icon"
      onClick={async () => {
        navigate("/");
        await trpcClient.committee.logOut.mutate();
        store.reset();
      }}
      variant="outline"
      className={className}
    >
      <LogOutIcon />
    </Button>
  );
}
