import { LoadungText } from "@/components/misc/loading-text";
import { Card } from "@/components/ui/card";
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
import { votingChoicesLabels } from "../data";
import { flattenCountryInfo } from "../helpers";
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
  return (
    <div className="flex flex-col gap-3 w-full max-w-[600px]">
      {votingChoices.map((choice) => {
        return (
          <div key={choice} className="flex items-center gap-2 w-full">
            <p className="text-sm text-gray-500 min-w-[80px] shrink-0">
              {votingChoicesLabels[choice]}
            </p>
            <div className="grid grid-cols-[repeat(auto-fill,48px)] gap-2 w-full">
              {participantsByChoice[choice].map((countryCode) => {
                const { name, emoji, imageUrl } = flattenCountryInfo(
                  countryCode,
                  committee.customCountries
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
function ParticipantsList({
  participants,
  customCountries,
}: {
  participants: LoadedCommitteeData["participants"];
  customCountries: FullCommittee["customCountries"];
}) {
  return (
    <div className="flex flex-wrap gap-3 flex-1">
      {participants.length > 0 ? (
        participants.map(({ countryCode, isOnline }) => {
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
        })
      ) : (
        <LoadungText>Waiting for members to join...</LoadungText>
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
