import { ConfirmationModal } from "@/components/misc/confirmation-modal";
import { Button } from "@/components/ui/button";
import { useAppStore, useInitializedAppStore } from "@/lib/store";
import { trpcClient } from "@/utils/trpc";
import { VotingRecord, VotingSession } from "@repo/api";
import { PlayIcon, TrashIcon } from "lucide-react";
import { votingChoicesColors } from "../../data";
import { AddVotingSession } from "./add-voting-session";
import { VotingSessionControls } from "./session-controls";

export function VotesList() {
  const votingSessions = useInitializedAppStore(
    (state) => state.votingSessions
  );
  const deleteVotingSession = useAppStore((state) => state.deleteVotingSession);
  const startVotingSession = useAppStore((state) => state.startVotingSession);

  const currentVotingSessionId = useAppStore(
    (state) => state.currentVotingSessionId
  );
  const onStart = async (id: VotingSession["id"]) => {
    await trpcClient.chair.startVotingSession.mutate({
      id,
    });
    startVotingSession(id);
  };
  const onDelete = async (id: VotingSession["id"]) => {
    await trpcClient.chair.deleteVotingSession.mutate({
      id,
    });
    deleteVotingSession(id);
  };
  if (currentVotingSessionId)
    return <VotingSessionControls id={currentVotingSessionId} />;
  return (
    <div className="flex flex-col gap-2 items-center md:items-end">
      <div className="flex items-center gap-2">
        <p className="font-medium">Voting Sessions</p>
        <AddVotingSession />
      </div>
      {Object.keys(votingSessions).length > 0 && (
        <ul>
          {Object.values(votingSessions).map((votingSession) => (
            <li key={votingSession.id} className="flex gap-2 items-center">
              <h3>
                {votingSession.name}
                {votingSession.wasOpen && (
                  <VotesSummary records={votingSession.records} />
                )}
              </h3>

              <div className="flex">
                <Button
                  variant="outline"
                  className="rounded-r-none"
                  size="icon-sm"
                  onClick={() => onStart(votingSession.id)}
                >
                  <PlayIcon className="size-4 cursor-pointer" />
                </Button>
                <ConfirmationModal intent="delete this voting session">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="border-l-0 rounded-l-none text-destructive-foreground"
                    onClick={() => onDelete(votingSession.id)}
                  >
                    <TrashIcon className="size-4" />
                  </Button>
                </ConfirmationModal>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
function VotesSummary({ records }: { records: Record<string, VotingRecord> }) {
  const votesByChoice: Record<VotingRecord["choice"], number> = {
    YAY: 0,
    NAY: 0,
    ABSTAIN: 0,
  };
  Object.values(records).forEach((record) => {
    votesByChoice[record.choice]++;
  });
  return (
    <>
      {" "}
      (<span className={votingChoicesColors.YAY.color}>Y</span>:{" "}
      {votesByChoice.YAY},{" "}
      <span className={votingChoicesColors.NAY.color}>N</span>:{" "}
      {votesByChoice.NAY},{" "}
      <span className={votingChoicesColors.ABSTAIN.color}>A</span>:{" "}
      {votesByChoice.ABSTAIN})
    </>
  );
}
