import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { trpcClient } from "@/utils/trpc";
import { VotingSession } from "@repo/api";
import { Check } from "lucide-react";
export function VotingSessionControls({ id }: { id: VotingSession["id"] }) {
  const endVotingSession = useAppStore((state) => state.endVotingSession);
  const onEnd = async () => {
    await trpcClient.chair.endVotingSession.mutate();
    endVotingSession(id);
  };

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={onEnd} rightIcon={<Check />}>
        Finish
      </Button>
    </div>
  );
}
