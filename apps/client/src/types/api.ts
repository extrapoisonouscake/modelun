import { AppRouterOutput } from "@repo/api";
type GetMyCommittee = AppRouterOutput["committee"]["getMine"];
export type FullCommittee = GetMyCommittee["committee"];
export type CommitteeParticipants = GetMyCommittee["participants"];
