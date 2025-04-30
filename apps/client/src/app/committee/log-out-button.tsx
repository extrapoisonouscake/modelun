import { Button } from "@/components/ui/button";
import { destroySocket } from "@/lib/io";
import { useAppStore } from "@/lib/store";
import { trpcClient } from "@/utils/trpc";
import { LogOutIcon } from "lucide-react";

import { useNavigate } from "react-router";

export function LogOutButton({
  className,
  isChair,
}: {
  className?: string;
  isChair: boolean;
}) {
  const navigate = useNavigate();
  const store = useAppStore();
  return (
    <Button
      size={isChair ? "icon" : "default"}
      onClick={async () => {
        await trpcClient.committee.logOut.mutate();
        navigate("/");
        store.reset();
        destroySocket();
      }}
      variant="outline"
      className={className}
      rightIcon={<LogOutIcon className="text-destructive-foreground" />}
      shouldShowChildrenOnLoading
    >
      {!isChair && "Log out"}
    </Button>
  );
}
