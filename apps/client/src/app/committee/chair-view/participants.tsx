import { LoadingText } from "@/components/misc/loading-text";
import NumberFlow from "@number-flow/react";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LoadedCommitteeData,
  useInitializedAppStore,
  VotingSessionWithRecords,
} from "@/lib/store";
import { cn } from "@/lib/utils";
import { FullCommittee } from "@/types/api";
import { VotingRecord } from "@repo/api";
import { votingChoicesColors, votingChoicesLabels } from "../data";
import { flattenCountryInfo as flattenCountryInfoFn } from "../helpers";
const votingChoices = [
  "YAY",
  "NAY",
  "ABSTAIN",
] as const satisfies VotingRecord["choice"][];

export function Participants() {
  const committee = useInitializedAppStore((state) => state.committee);
  const participants = useInitializedAppStore((state) => state.participants);

  const votingSessions = useInitializedAppStore(
    (state) => state.votingSessions
  );
  const currentVotingSessionId = useInitializedAppStore(
    (state) => state.currentVotingSessionId
  );
  if (currentVotingSessionId) {
    const votingSession = votingSessions[currentVotingSessionId];
    if (!votingSession) return null;
    return (
      <ParticipantsVotingView
        votingSession={votingSession}
        committee={committee}
      />
    );
  }
  return (
    <ParticipantsList
      participants={participants}
      customCountries={committee.customCountries}
    />
  );
}

function ParticipantsVotingView({
  votingSession,
  committee,
}: {
  votingSession: VotingSessionWithRecords;
  committee: FullCommittee;
}) {
  const participantsByChoice = divideCountriesByChoice(
    committee.countries,
    votingSession.records
  );
  const flattenCountryInfo = flattenCountryInfoFn(committee.customCountries);

  return (
    <div className="flex flex-col gap-4 w-full max-w-[600px]">
      {votingChoices.map((choice, index) => {
        const countries = participantsByChoice[choice];
        return (
          <>
            <div className="flex items-center gap-2 w-full">
              <div className="flex items-center gap-2 min-w-[140px]">
                <NumberFlow
                  value={countries.length}
                  className={cn(
                    "text-4xl w-16 text-right font-medium",
                    votingChoicesColors[choice].color
                  )}
                />
                <p
                  className={cn(
                    "text-sm font-medium",
                    votingChoicesColors[choice].color
                  )}
                >
                  {votingChoicesLabels[choice]}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 w-full">
                {countries.map((countryCode) => {
                  const { name, emoji, imageUrl } =
                    flattenCountryInfo(countryCode);
                  return (
                    <TooltipProvider key={countryCode}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <img
                            src={imageUrl}
                            alt={name}
                            className="h-6 rounded-sm object-cover"
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
            {index < votingChoices.length - 1 && (
              <Separator className="bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />
            )}
          </>
        );
      })}
    </div>
  );
}
function ParticipantsList({
  participants,
  customCountries,
}: {
  participants: LoadedCommitteeData["participants"];
  customCountries: FullCommittee["customCountries"];
}) {
  const flattenCountryInfo = flattenCountryInfoFn(customCountries);
  return (
    <div className="flex flex-wrap gap-3 flex-1">
      {participants.length > 0 ? (
        participants.map(({ countryCode, isOnline }) => {
          const { name, imageUrl } = flattenCountryInfo(countryCode);
          return (
            <Card
              key={countryCode}
              className={cn("flex flex-col items-center gap-3 p-3 max-w-32", {
                "opacity-50": !isOnline,
              })}
            >
              <img src={imageUrl} alt={name} className="h-16 rounded-md" />
              <p className="text-sm font-medium text-center">{name}</p>
            </Card>
          );
        })
      ) : (
        <LoadingText>Waiting for members to join...</LoadingText>
      )}
    </div>
  );
}
function divideCountriesByChoice(
  countries: FullCommittee["countries"],
  votingRecords: Record<string, VotingRecord>
) {
  const participantsByChoice: Record<VotingRecord["choice"], string[]> = {
    YAY: [],
    NAY: [],
    ABSTAIN: [],
  };
  countries.forEach((countryCode) => {
    const record = votingRecords[countryCode];
    if (!record) return;
    participantsByChoice[record.choice].push(countryCode);
  });
  return participantsByChoice;
}
