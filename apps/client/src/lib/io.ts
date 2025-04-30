import { API_URL, IS_DEV } from "@/constants";
import { getUser } from "@/hooks/use-user";
import { AppState, useAppStore } from "@/lib/store";
import { performForceLogOut } from "@/utils/perform-force-log-out";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  socketEvents,
} from "@repo/api";
import { io, Socket } from "socket.io-client";

type StoreSlice = "committee" | "participants" | "votingSessions";
type StoreSliceType<T extends StoreSlice> = NonNullable<AppState[T]>;

function getStateUpdater<T extends StoreSlice>(slice: T) {
  const state = useAppStore.getState();
  const value = state[slice];
  const setterKey =
    `set${slice.charAt(0).toUpperCase() + slice.slice(1)}` as `set${Capitalize<T>}`;
  const setter = state[setterKey] as (value: StoreSliceType<T>) => void;

  return (func: (current: StoreSliceType<T>) => StoreSliceType<T>) => {
    const newValue = func(value as StoreSliceType<T>);
    setter(newValue);
  };
}
export let socket:
  | Socket<ServerToClientEvents, ClientToServerEvents>
  | undefined;

export const initSocket = () => {
  socket = io(API_URL, {
    ackTimeout: 3000,
    retries: 3,
    path: !IS_DEV ? "/api/" : undefined,
    withCredentials: true,
    transports: ["websocket"],
  });
  socket.on("connect", () => {
    console.log("Connected to server");
  });
  socket.on("disconnect", () => {
    console.log("Disconnected from server");
  });
  socket.on(socketEvents.participants.joined, (countryCode) => {
    const setParticipants = getStateUpdater("participants");
    const participants = useAppStore.getState().participants;
    if (
      !participants ||
      participants.some(
        (participant) => participant.countryCode === countryCode
      )
    )
      return;
    setParticipants((participants) => [
      ...participants,
      { countryCode, isOnline: true },
    ]);
  });
  socket.on(socketEvents.participants.left, (countryCode) => {
    const setParticipants = getStateUpdater("participants");
    setParticipants((participants) =>
      participants.filter(
        (participant) => participant.countryCode !== countryCode
      )
    );

    if (countryCode === getUser().countryCode) {
      performForceLogOut();
    }
  });
  socket.on(socketEvents.participants.online, (countryCode) => {
    const setParticipants = getStateUpdater("participants");
    setParticipants((participants) =>
      participants.map((participant) =>
        participant.countryCode === countryCode
          ? { ...participant, isOnline: true }
          : participant
      )
    );
  });
  socket.on(socketEvents.participants.offline, (countryCode) => {
    const setParticipants = getStateUpdater("participants");
    setParticipants((participants) =>
      participants.map((participant) =>
        participant.countryCode === countryCode
          ? { ...participant, isOnline: false }
          : participant
      )
    );
  });
  socket.on(socketEvents.committee.updated, (newData) => {
    const setCommittee = getStateUpdater("committee");
    setCommittee((committee) => ({
      ...committee,
      ...newData,
    }));
  });
  socket.on(socketEvents.voting.created, (newData) => {
    useAppStore.getState().addVotingSession(newData);
  });
  socket.on(socketEvents.voting.deleted, (votingSessionId) => {
    useAppStore.getState().deleteVotingSession(votingSessionId);
  });
  socket.on(socketEvents.voting.started, (votingSessionId) => {
    useAppStore.getState().startVotingSession(votingSessionId);
  });
  socket.on(socketEvents.voting.ended, (votingSessionId) => {
    useAppStore.getState().endVotingSession(votingSessionId);
  });
  socket.on(socketEvents.voting.new_vote, (newData) => {
    useAppStore.getState().addVotingRecord(newData);
  });
  socket.on(
    socketEvents.voting.vote_withdrawn,
    (votingSessionId, countryCode) => {
      useAppStore.getState().deleteVotingRecord(votingSessionId, countryCode);
    }
  );
  socket.on(socketEvents.moderation.banned, () => {
    performForceLogOut();
  });
};

export const destroySocket = () => {
  socket?.close();
};
export const reconnectSocket = () => {
  destroySocket();
  initSocket();
};
