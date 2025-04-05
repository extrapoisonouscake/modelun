import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { trpcClient } from "@/utils/trpc";
import { VotingRecord } from "@repo/api";
import { CheckIcon, CircleSlash2, XIcon } from "lucide-react";
import { votingChoicesColors, votingChoicesLabels } from "../data";

export function VotingSessionActions({ id }: { id: string }) {
  const votingSession = useAppStore((state) => state.votingSessions?.[id]);
  const { countryCode } = useUser(true);
  const addVotingRecord = useAppStore((state) => state.addVotingRecord);
  const deleteVotingRecord = useAppStore((state) => state.deleteVotingRecord);
  if (!votingSession) return null;
  const memberVotingRecord = votingSession.records[countryCode];
  const onVote = async (choice: VotingRecord["choice"]) => {
    await trpcClient.committee.vote.mutate({
      choice,
    });
    addVotingRecord({
      sessionId: votingSession.id,
      countryCode,
      choice,
    });
  };
  const onVoteWithdrawal = async () => {
    await trpcClient.committee.withdrawVote.mutate();
    deleteVotingRecord(votingSession.id, countryCode);
  };
  const isAbstain = memberVotingRecord?.choice === "ABSTAIN";
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold">{votingSession.name}</h2>
        <p className="text-sm text-gray-500">{votingSession.description}</p>
      </div>
      {memberVotingRecord ? (
        <Card className="gap-2">
          <p>
            You {!isAbstain && "voted "}
            <span
              className={cn(
                votingChoicesColors[memberVotingRecord.choice].color
              )}
            >
              {isAbstain
                ? "abstained from vote"
                : votingChoicesLabels[memberVotingRecord.choice].toLowerCase()}
            </span>
          </p>
          <Button onClick={onVoteWithdrawal} variant="secondary">
            Withdraw vote
          </Button>
        </Card>
      ) : (
        <div className="grid justify-stretch grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2 items-center w-full">
          <VoteButton
            className={cn(
              votingChoicesColors.YAY.default,
              votingChoicesColors.YAY.hover
            )}
            onClick={() => onVote("YAY")}
          >
            <CheckIcon />
          </VoteButton>
          <VoteButton
            className={cn(
              votingChoicesColors.NAY.default,
              votingChoicesColors.NAY.hover
            )}
            onClick={() => onVote("NAY")}
          >
            <XIcon />
          </VoteButton>
          <VoteButton
            className={cn(
              votingChoicesColors.ABSTAIN.default,
              votingChoicesColors.ABSTAIN.hover
            )}
            onClick={() => onVote("ABSTAIN")}
          >
            <CircleSlash2 />
          </VoteButton>
        </div>
      )}
    </div>
  );
}
function VoteButton({
  className,
  onClick,
  children,
}: {
  className: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      className={cn(
        className,
        "w-full h-full rounded-xl flex items-center justify-center [&>svg]:!size-[80px] py-4"
      )}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
