import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { trpcClient } from "@/utils/trpc";
import { VotingSession } from "@repo/api";

export function VotingSessionControls({ id }: { id: VotingSession["id"] }) {
  const endVotingSession = useAppStore((state) => state.endVotingSession);
  const onEnd = async () => {
    await trpcClient.chair.endVotingSession.mutate();
    endVotingSession(id);
  };
  return (
    <div className="flex flex-col gap-2">
      <p>Session Controls</p>
      <Button onClick={onEnd}>End</Button>
    </div>
  );
}
