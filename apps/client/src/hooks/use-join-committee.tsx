import { trpcClient } from "@/utils/trpc";
import { JoinCommitteeSchema } from "@repo/api/schemas";
import { createSearchParams, NavigateFunction } from "react-router";
export function useJoinCommittee(navigate: NavigateFunction) {
  return async (data: JoinCommitteeSchema) => {
    await trpcClient.committee.join.mutate(data);

    navigate({
      pathname: "/committee",
      search: createSearchParams(
        data.passphrase
          ? {
              chairFirstLogin: "true",
            }
          : {}
      ).toString(),
    });
  };
}
