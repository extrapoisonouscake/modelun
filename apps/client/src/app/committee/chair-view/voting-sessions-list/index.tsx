import { ConfirmationModal } from "@/components/misc/confirmation-modal";
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
  if (currentVotingSessionId)
    return <VotingSessionControls id={currentVotingSessionId} />;
  return (
    <div className="flex flex-col gap-2">
      <p>Voting Sessions</p>
      {Object.keys(votingSessions).length > 0 && (
        <ul>
          {Object.values(votingSessions).map((votingSession) => (
            <li key={votingSession.id} className="flex gap-2">
              <h3>
                {votingSession.name}
                {votingSession.wasOpen && (
                  <VotesSummary records={votingSession.records} />
                )}
              </h3>

              <PlayIcon
                className="size-4 cursor-pointer"
                onClick={() => onStart(votingSession.id)}
              />
              <ConfirmationModal intent="delete this voting session">
                <TrashIcon
                  className="size-4"
                  onClick={async () => {
                    await trpcClient.chair.deleteVotingSession.mutate({
                      id: votingSession.id,
                    });
                    deleteVotingSession(votingSession.id);
                  }}
                />
              </ConfirmationModal>
            </li>
          ))}
        </ul>
      )}
      <AddVotingSession />
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
