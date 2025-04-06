import { CommitteeParticipants, FullCommittee } from "@/types/api";
import { VotingRecord, VotingSession } from "@repo/api";
import { create } from "zustand";
type VotingSessionWithRecords = VotingSession & {
  records: Record<string, VotingRecord>;
};
export type AppState = {
  committee?: FullCommittee;
  countryCode?: string;
  participants?: CommitteeParticipants;
  votingSessions?: Record<string, VotingSessionWithRecords>;
  currentVotingSessionId?: VotingSession["id"] | null;
  setCurrentVotingSessionId: (
    currentVotingSessionId: AppState["currentVotingSessionId"]
  ) => void;
  setCommittee: (committee: AppState["committee"]) => void;
  updateCommittee: (committee: Partial<AppState["committee"]>) => void;
  setCountryCode: (countryCode: AppState["countryCode"]) => void;
  setParticipants: (participants: AppState["participants"]) => void;
  setVotingSessions: (votingSessions: AppState["votingSessions"]) => void;
  isLoaded: boolean;
  setIsLoaded: (isLoaded: AppState["isLoaded"]) => void;
  reset: () => void;
  addVotingSession: (votingSession: VotingSession) => void;
  addVotingRecord: (votingRecord: VotingRecord) => void;
  deleteVotingRecord: (sessionId: string, countryCode: string) => void;
  deleteVotingSession: (votingSessionId: string) => void;
  startVotingSession: (votingSessionId: string) => void;
  endVotingSession: (votingSessionId: string) => void;
};

const initialState = {
  committee: undefined,
  countryCode: undefined,
  participants: undefined,
  votingSessions: undefined,
  currentVotingSessionId: null,
  isLoaded: false,
};
export const useAppStore = create<AppState>((set, get) => ({
  ...initialState,
  setCurrentVotingSessionId: (currentVotingSessionId) =>
    set({ currentVotingSessionId }),
  setCommittee: (committee) => set({ committee }),
  updateCommittee: (committee) => {
    const currentCommittee = get().committee;
    if (!currentCommittee) return;
    set({
      committee: { ...currentCommittee, ...committee },
    });
  },
  setCountryCode: (countryCode) => set({ countryCode }),
  setParticipants: (participants) => set({ participants }),
  setVotingSessions: (votingSessions) => set({ votingSessions }),
  addVotingSession: (votingSession) =>
    set((state) => ({
      votingSessions: {
        ...state.votingSessions,
        [votingSession.id]: {
          ...votingSession,
          records: {},
        },
      },
    })),
  addVotingRecord: (votingRecord) => {
    const currentVotingSessions = get().votingSessions;
    if (!currentVotingSessions) return;
    const votingSession = currentVotingSessions[votingRecord.sessionId];
    if (!votingSession) return;
    set({
      votingSessions: {
        ...currentVotingSessions,
        [votingRecord.sessionId]: {
          ...votingSession,
          records: {
            ...votingSession.records,
            [votingRecord.countryCode]: votingRecord,
          },
        },
      },
    });
  },
  deleteVotingRecord: (sessionId, countryCode) => {
    const currentVotingSessions = get().votingSessions;
    if (!currentVotingSessions) return;
    const votingSession = currentVotingSessions[sessionId];
    if (!votingSession) return;
    const newRecords = { ...votingSession.records };
    delete newRecords[countryCode];
    set({
      votingSessions: {
        ...currentVotingSessions,
        [sessionId]: {
          ...votingSession,
          records: newRecords,
        },
      },
    });
  },
  deleteVotingSession: (votingSessionId) => {
    const currentVotingSessions = get().votingSessions;
    if (!currentVotingSessions) return;
    const newVotingSessions = { ...currentVotingSessions };
    delete newVotingSessions[votingSessionId];
    set({
      votingSessions: newVotingSessions,
    });
  },

  startVotingSession: (votingSessionId) => {
    const currentVotingSessions = get().votingSessions;
    if (!currentVotingSessions) return;
    const votingSession = currentVotingSessions[votingSessionId];
    if (!votingSession) return;
    set({
      currentVotingSessionId: votingSessionId,
      votingSessions: {
        ...currentVotingSessions,
        [votingSessionId]: {
          ...votingSession,
          wasOpen: true,
        },
      },
    });
  },
  endVotingSession: (votingSessionId) => {
    const currentVotingSessions = get().votingSessions;
    if (!currentVotingSessions) return;
    const votingSession = currentVotingSessions[votingSessionId];
    if (!votingSession) return;
    set({
      currentVotingSessionId: null,
    });
  },
  setIsLoaded: (isLoaded) => set({ isLoaded }),
  reset: () => set(initialState),
}));

type CommitteeSlices = Pick<
  AppState,
  Exclude<keyof typeof initialState, "isLoaded">
>;
export type LoadedCommitteeData = {
  [K in keyof CommitteeSlices]-?: NonNullable<AppState[K]>;
};
export function useInitializedAppStore<T>(
  selector: (state: LoadedCommitteeData) => T
): T {
  const store = useAppStore();

  // Check if all required properties are present
  const missingProperties = Object.keys({} as LoadedCommitteeData).filter(
    (key) => !store[key as keyof CommitteeSlices]
  );

  if (missingProperties.length > 0) {
    throw new Error(
      `Store is not initialized. Missing properties: ${missingProperties.join(", ")}`
    );
  }

  return selector(store as LoadedCommitteeData);
}
export const useCountryCode = () => {
  const { countryCode } = useAppStore();
  return countryCode;
};
