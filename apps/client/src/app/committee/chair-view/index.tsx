import { useAppStore, useInitializedAppStore } from "@/lib/store";
import { cn } from "../../../lib/utils";

import { Participants } from "./participants";
import { VotesList } from "./voting-sessions-list";

export function ChairView() {
  const currentVotingSessionId = useAppStore(
    (state) => state.currentVotingSessionId
  );
  return (
    <div className="flex flex-col items-center gap-8 relative">
      <div
        className={cn(
          "flex flex-col gap-3 w-full md:flex-row md:justify-between",
          {
            "items-center": !!currentVotingSessionId,
          }
        )}
      >
        {currentVotingSessionId ? (
          <VotingSessionInfo id={currentVotingSessionId} />
        ) : (
          <CommitteeInfo />
        )}
        <VotesList />
      </div>
      <Participants />
    </div>
  );
}
function VotingSessionInfo({ id }: { id: string }) {
  const votingSession = useInitializedAppStore(
    (state) => state.votingSessions?.[id]
  );
  if (!votingSession) return null;
  return (
    <div className="flex flex-col items-center md:items-start justify-center">
      <p className="font-medium text-muted-foreground">Voting on:</p>
      <h2 className="text-lg font-bold">{votingSession.name}</h2>
      <p className="text-sm text-gray-500">{votingSession.description}</p>
    </div>
  );
}
export function CommitteeInfo() {
  const committee = useInitializedAppStore((state) => state.committee);
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold text-center">{committee.name}</h1>
      <p className="text-sm text-gray-500 text-center">
        {committee.description}
      </p>
    </div>
  );
}
