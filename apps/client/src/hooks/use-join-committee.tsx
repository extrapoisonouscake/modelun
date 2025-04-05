import { trpcClient } from "@/utils/trpc";
import { JoinCommitteeSchema } from "@repo/api/schemas";
import { NavigateFunction } from "react-router";
import { toast } from "sonner";

export function useJoinCommittee(navigate: NavigateFunction) {
  return async (data: JoinCommitteeSchema) => {
    try {
      await trpcClient.committee.join.mutate(data);
      navigate("/committee");
    } catch (e: any) {
      toast.error(e.message);
    }
  };
}
