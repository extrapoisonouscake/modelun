import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useInitializedAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { CommitteeParticipants } from "@/types/api";
import { VotingRecord } from "@repo/api";
import { votingChoicesLabels } from "../data";
import { flattenCountryInfo } from "../helpers";
const votingChoices = [
  "YAY",
  "NAY",
  "ABSTAIN",
] as const satisfies VotingRecord["choice"][];

export const Participants = () => {
  const participants = useInitializedAppStore((state) => state.participants);
  const { customCountries } = useInitializedAppStore(
    (state) => state.committee
  );
  const votingSessions = useInitializedAppStore(
    (state) => state.votingSessions
  );
  const currentVotingSessionId = useInitializedAppStore(
    (state) => state.currentVotingSessionId
  );
  if (currentVotingSessionId) {
    const votingSession = votingSessions[currentVotingSessionId];
    if (!votingSession) return null;
    const participantsByChoice = divideParticipantsByChoice(
      participants,
      votingSession.records
    );
    return (
      <div className="flex flex-wrap gap-3 flex-1">
        {votingChoices.map((choice) => {
          return (
            <div key={choice} className="flex flex-col items-center gap-2">
              <p className="text-sm text-gray-500">
                {votingChoicesLabels[choice]}
              </p>
              <div className="flex flex-wrap gap-2 max-w-[100px]">
                {participantsByChoice[choice].map(({ countryCode }) => {
                  const { name, emoji, imageUrl } = flattenCountryInfo(
                    countryCode,
                    customCountries
                  );
                  return (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <img
                            src={imageUrl}
                            alt={name}
                            className="h-6 rounded-sm"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {emoji ? `${emoji} ` : ""}
                            {name}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <>
      <div className="flex flex-wrap gap-3 flex-1">
        {participants.map(({ countryCode, isOnline }) => {
          const { name, imageUrl } = flattenCountryInfo(
            countryCode,
            customCountries
          );
          return (
            <Card
              key={countryCode}
              className={cn("flex flex-col items-center gap-3 p-3", {
                "opacity-50": !isOnline,
              })}
            >
              <img src={imageUrl} alt={name} className="h-16 rounded-md" />
              <p className="text-base font-medium">{name}</p>
            </Card>
          );
        })}
      </div>
    </>
  );
};
function divideParticipantsByChoice(
  participants: CommitteeParticipants,
  votingRecords: Record<string, VotingRecord>
) {
  const participantsByChoice: Record<
    VotingRecord["choice"],
    CommitteeParticipants
  > = {
    YAY: [],
    NAY: [],
    ABSTAIN: [],
  };
  participants.forEach((participant) => {
    const { countryCode } = participant;
    const record = votingRecords[countryCode];
    if (!record) return;
    participantsByChoice[record.choice].push(participant);
  });
  return participantsByChoice;
}
