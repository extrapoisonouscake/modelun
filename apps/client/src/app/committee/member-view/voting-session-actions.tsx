import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { trpcClient } from "@/utils/trpc";
import { VotingRecord, VotingSession } from "@repo/api";
import { CheckIcon, CircleSlash2, Undo2Icon, XIcon } from "lucide-react";
import { votingChoicesColors } from "../data";
const choicesLabels: Record<VotingRecord["choice"], string> = {
  YAY: "in favour of",
  NAY: "against",
  ABSTAIN: "abstained",
};
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
    <div className="flex flex-col gap-4">
      <VotingSessionInfo {...votingSession} />
      {memberVotingRecord ? (
        <Card className="gap-2">
          <p className="text-lg">
            You {!isAbstain && "voted "}
            <span
              className={cn(
                votingChoicesColors[memberVotingRecord.choice].color
              )}
            >
              {choicesLabels[memberVotingRecord.choice]}
            </span>{" "}
            {isAbstain ? "from voting" : "this"}.
          </p>
          <Button
            onClick={onVoteWithdrawal}
            variant="outline"
            rightIcon={<Undo2Icon />}
          >
            Withdraw vote
          </Button>
        </Card>
      ) : (
        <div className="grid justify-stretch grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2 items-center w-full">
          <VoteButton
            label="Yes"
            className={cn(
              votingChoicesColors.YAY.default,
              votingChoicesColors.YAY.hover
            )}
            onClick={() => onVote("YAY")}
          >
            <CheckIcon />
          </VoteButton>
          <VoteButton
            label="No"
            className={cn(
              votingChoicesColors.NAY.default,
              votingChoicesColors.NAY.hover
            )}
            onClick={() => onVote("NAY")}
          >
            <XIcon />
          </VoteButton>
          <VoteButton
            label="Abstain"
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
  label,
}: {
  className: string;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Button
        className={cn(
          className,
          "w-full h-full rounded-xl flex items-center justify-center [&>svg]:!size-[80px] py-4"
        )}
        onClick={onClick}
      >
        {children}
      </Button>
      <p className="text-gray-500 text-center text-base">{label}</p>
    </div>
  );
}
function VotingSessionInfo({ name, description }: VotingSession) {
  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-lg font-bold">{name}</h2>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
