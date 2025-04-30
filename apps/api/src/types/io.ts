import type { Committee, VotingRecord, VotingSession } from "./mun";

export interface ServerToClientEvents {
  [socketEvents.participants.online]: (countryCode: string) => void;
  [socketEvents.participants.offline]: (countryCode: string) => void;
  [socketEvents.participants.joined]: (countryCode: string) => void;
  [socketEvents.participants.left]: (countryCode: string) => void;
  [socketEvents.committee.updated]: (committee: Committee) => void;
  [socketEvents.voting.created]: (votingSession: VotingSession) => void;
  [socketEvents.voting.started]: (id: VotingSession["id"]) => void;
  [socketEvents.voting.ended]: (id: VotingSession["id"]) => void;
  [socketEvents.voting.deleted]: (id: VotingSession["id"]) => void;
  [socketEvents.voting.new_vote]: (vote: VotingRecord) => void;
  [socketEvents.voting.vote_withdrawn]: (
    sessionId: VotingSession["id"],
    countryCode: string
  ) => void;
  [socketEvents.moderation.banned]: () => void;
}

export interface ClientToServerEvents {
  sendMessage: (content: string) => void;
  joinRoom: (room: string) => void;
}

export interface InterServerEvents {
  syncData: (data: string) => void;
}

function createSocketEvents<T extends Record<string, readonly string[]>>(
  events: T
): {
  [K in keyof T]: { [E in T[K][number]]: `${K & string}:${E & string}` };
} {
  const result = {} as any;
  for (const category in events) {
    result[category] = Object.fromEntries(
      events[category].map((event) => [event, `${category}:${event}`])
    );
  }
  return result;
}
export const socketEvents = createSocketEvents({
  participants: ["online", "offline", "joined", "left"],
  voting: [
    "created",
    "started",
    "ended",
    "deleted",
    "new_vote",
    "vote_withdrawn",
  ],
  committee: ["updated"],
  moderation: ["banned"],
} as const);
