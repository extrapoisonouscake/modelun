import { createClient, RedisClientType } from "redis";
import {
  Committee,
  Participant,
  VotingRecord,
  VotingSession,
} from "../types/mun";
interface CustomRedis extends RedisClientType {
  operations: typeof commonOperations;
}
//@ts-expect-error extend redis client type
export const redis: CustomRedis = createClient();
redis.connect();
export const joinRedisKey = (...args: string[]) => args.join(":");
function getRedisJSON<T>(key: string) {
  return redis.json.get(key) as unknown as Promise<T | null>;
}

function setRedisJSON<T>(key: string, path: string, data: T) {
  return redis.json.set(key, path, data as unknown as Record<string, any>);
}
const commonOperations = {
  async getCommittee(id: string) {
    return await getRedisJSON<Committee>(joinRedisKey("committee", id));
  },
  async setCommittee(id: string, data: Committee) {
    return await setRedisJSON(joinRedisKey("committee", id), "$", data);
  },
  async getParticipant(id: string) {
    return await getRedisJSON<Participant>(joinRedisKey("participant", id));
  },
  async setParticipant(
    committeeId: Committee["id"],
    countryCode: Participant["countryCode"],
    data: Omit<Participant, "committeeId" | "countryCode">
  ) {
    return await setRedisJSON(
      joinRedisKey("participant", committeeId, countryCode),
      "$",
      data
    );
  },
  async getVotingSession(id: string) {
    return await getRedisJSON<VotingSession>(joinRedisKey("votingSession", id));
  },
  async setVotingSession(id: string, data: VotingSession) {
    return await setRedisJSON(joinRedisKey("votingSession", id), "$", data);
  },
  async getVotingRecord(id: string) {
    return await getRedisJSON<VotingRecord>(joinRedisKey("votingRecord", id));
  },
  async setVotingRecord(id: string, data: VotingRecord) {
    return await setRedisJSON(joinRedisKey("votingRecord", id), "$", data);
  },
};
redis.operations = commonOperations;
