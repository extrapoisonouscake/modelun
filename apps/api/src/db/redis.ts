import Redis from "ioredis";
import type { Committee, VotingRecord, VotingSession } from "../types";
interface CustomRedis extends Redis {
  operations: typeof commonOperations;
}
//@ts-expect-error extend redis client type
export const redis: CustomRedis = new Redis(process.env.REDIS_URL);

redis.on("error", (e) => {
  console.error(e);
});
export const joinRedisKey = (...args: string[]) => args.join(":");

export const REDIS_PREFIXES = {
  COMMITTEE: "committee",
  COMMITTEE_BY_ID: "committee:id",
  COMMITTEE_BY_CODE: "committee:code",
  PARTICIPANTS: "participants",
  VOTING_SESSIONS: "votingSessions",
  VOTING_RECORDS: "votingRecords",
  CURRENT_VOTING_SESSION_ID: "currentVotingSessionId",
} as const;
export const redisKeys = {
  committee: (id: string) => joinRedisKey(REDIS_PREFIXES.COMMITTEE_BY_ID, id),
  committeeByCode: (code: string) =>
    [REDIS_PREFIXES.COMMITTEE_BY_CODE, code] as const,
  participants: (committeeId: Committee["id"]) =>
    joinRedisKey(
      REDIS_PREFIXES.COMMITTEE,
      committeeId,
      REDIS_PREFIXES.PARTICIPANTS
    ),
  votingSessions: (committeeId: Committee["id"]) =>
    joinRedisKey(
      REDIS_PREFIXES.COMMITTEE,
      committeeId,
      REDIS_PREFIXES.VOTING_SESSIONS
    ),
  votingSession: (committeeId: Committee["id"], id: string) =>
    [
      joinRedisKey(
        REDIS_PREFIXES.COMMITTEE,
        committeeId,
        REDIS_PREFIXES.VOTING_SESSIONS
      ),
      id,
    ] as const,
  votingRecords: (
    committeeId: Committee["id"],
    votingSessionId: VotingSession["id"]
  ) =>
    joinRedisKey(
      REDIS_PREFIXES.COMMITTEE,
      committeeId,
      REDIS_PREFIXES.VOTING_SESSIONS,
      votingSessionId,
      REDIS_PREFIXES.VOTING_RECORDS
    ),
  votingRecord: (
    committeeId: Committee["id"],
    votingSessionId: VotingSession["id"],
    countryCode: string
  ) =>
    [
      redisKeys.votingRecords(committeeId, votingSessionId),
      countryCode,
    ] as const,
  currentVotingSessionId: (committeeId: Committee["id"]) =>
    joinRedisKey(
      REDIS_PREFIXES.COMMITTEE,
      committeeId,
      REDIS_PREFIXES.CURRENT_VOTING_SESSION_ID
    ),
};
export const REDIS_KEY_EXPIRATION_TIME = 60 * 60 * 24; // 24 hours
const jsonifyObject = (object: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(object).map(([key, value]) => [key, JSON.parse(value)])
  );
const commonOperations = {
  async getCommitteeIdByCode(code: string) {
    const committeeId = await redis.hget(
      REDIS_PREFIXES.COMMITTEE_BY_CODE,
      code
    );

    return committeeId;
  },
  async getCommittee(id: string) {
    const committee = await redis.get(redisKeys.committee(id));
    if (!committee) return null;
    return JSON.parse(committee) as Committee;
  },
  async setCommittee(id: string, data: Committee) {
    return await redis.set(
      redisKeys.committee(id),
      JSON.stringify(data),
      "EX",
      REDIS_KEY_EXPIRATION_TIME
    );
  },
  async getParticipants(committeeId: Committee["id"]) {
    return new Set(await redis.smembers(redisKeys.participants(committeeId)));
  },
  async hasParticipant(committeeId: Committee["id"], countryCode: string) {
    const participants = await this.getParticipants(committeeId);
    if (!participants) return null;
    return participants.has(countryCode);
  },

  async getVotingSessions(committeeId: Committee["id"]) {
    const sessions = await redis.hgetall(redisKeys.votingSessions(committeeId));
    return jsonifyObject(sessions) as Record<string, VotingSession>;
  },
  async getVotingSession(committeeId: Committee["id"], id: string) {
    const votingSession = await redis.hget(
      ...redisKeys.votingSession(committeeId, id)
    );
    if (!votingSession) return null;
    return JSON.parse(votingSession) as VotingSession;
  },
  async setVotingSession(
    committeeId: Committee["id"],
    id: string,
    data: VotingSession
  ) {
    return await redis.hset(
      ...redisKeys.votingSession(committeeId, id),
      JSON.stringify(data)
    );
  },
  async getCurrentVotingSessionId(committeeId: Committee["id"]) {
    const currentVotingSessionId = await redis.get(
      redisKeys.currentVotingSessionId(committeeId)
    );
    if (!currentVotingSessionId) return null;
    return currentVotingSessionId;
  },
  async deleteCurrentVotingSession(committeeId: Committee["id"]) {
    return await redis.del(redisKeys.currentVotingSessionId(committeeId));
  },
  async getVotingRecords(
    committeeId: Committee["id"],
    votingSessionId: VotingSession["id"]
  ) {
    const votingRecords = await redis.hgetall(
      redisKeys.votingRecords(committeeId, votingSessionId)
    );
    return jsonifyObject(votingRecords) as Record<string, VotingRecord>;
  },
  async getVotingRecord(
    committeeId: Committee["id"],
    votingSessionId: VotingSession["id"],
    countryCode: string
  ) {
    const votingRecord = await redis.hget(
      ...redisKeys.votingRecord(committeeId, votingSessionId, countryCode)
    );
    if (!votingRecord) return null;
    return JSON.parse(votingRecord) as VotingRecord;
  },
  async setVotingRecord(
    committeeId: Committee["id"],
    votingSessionId: VotingSession["id"],
    countryCode: string,
    data: VotingRecord
  ) {
    return await redis.hset(
      ...redisKeys.votingRecord(committeeId, votingSessionId, countryCode),
      JSON.stringify(data)
    );
  },
  async addVotingRecord({
    committeeId,
    sessionId,
    countryCode,
    choice,
  }: {
    committeeId: Committee["id"];
    sessionId: VotingSession["id"];
  } & VotingRecord) {
    return await redis.hset(
      ...redisKeys.votingRecord(committeeId, sessionId, countryCode),
      JSON.stringify({ countryCode, sessionId, choice })
    );
  },
  async deleteVotingRecord({
    committeeId,
    sessionId,
    countryCode,
  }: {
    committeeId: Committee["id"];
    sessionId: VotingSession["id"];
    countryCode: string;
  }) {
    return await redis.hdel(
      ...redisKeys.votingRecord(committeeId, sessionId, countryCode)
    );
  },
};
redis.operations = commonOperations;
