import { VotingRecord } from "@repo/api";

export const votingChoicesLabels: Record<VotingRecord["choice"], string> = {
  YAY: "In favour",
  NAY: "Against",
  ABSTAIN: "Abstained",
};
export const votingChoicesColors: Record<
  VotingRecord["choice"],
  {
    default: string;
    color: string;
    hover: string;
  }
> = {
  YAY: {
    default: "bg-green-500",
    color: "text-green-500",
    hover: "hover:bg-green-600",
  },
  NAY: {
    default: "bg-red-500",
    color: "text-red-500",
    hover: "hover:bg-red-600",
  },
  ABSTAIN: {
    default: "bg-gray-500",
    color: "text-gray-500",
    hover: "hover:bg-gray-600",
  },
};
