export interface Committee {
  id: string;
  name: string;
  code: string;
  passphrase: string;
  chairId: string;
  description?: string;
  countries: string[];
  customCountries?: Record<
    string,
    //* not reusing type due to zod limitations
    {
      name: string;
      imageUrl: string;
      emoji?: string;
    }
  >;
}

export interface VotingSession {
  id: string;
  name: string;
  description?: string;
  wasOpen: boolean;
}
export type VotingSessionWithRecords = VotingSession & {
  records: VotingRecord[];
};
export interface VotingRecord {
  countryCode: string;
  sessionId: VotingSession["id"];
  choice: "YAY" | "NAY" | "ABSTAIN";
}
