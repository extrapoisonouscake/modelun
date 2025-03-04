export interface Committee {
  id: string;
  name: string;
  topics: string[];
  passphrase: string;
}
export interface Participant {
  committeeId: Committee["id"];
  countryCode: string;
}
export interface VotingSession {
  id: string;
  committeeId: Committee["id"];
  topic: string;
  startTime: Date;
  endTime: Date;
}
export interface VotingRecord {
  id: string;
  sessionId: VotingSession["id"];
  countryCode: Participant["countryCode"];
  choice: "YAY" | "NAY" | "ABSTAIN";
}
