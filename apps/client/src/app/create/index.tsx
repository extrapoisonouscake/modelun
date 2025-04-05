import { useJoinCommittee } from "@/hooks/use-join-committee";
import { useUser } from "@/hooks/use-user";
import { trpcClient } from "@/utils/trpc";
import {
  CHAIR_IDENTIFIER,
  createCommitteeSchema,
  CreateCommitteeSchema,
} from "@repo/api";
import { Navigate, useNavigate } from "react-router";
import { CommitteeSettingsForm } from "./settings-form";
export function CreateCommitteePage() {
  const navigate = useNavigate();
  const joinCommittee = useJoinCommittee(navigate);
  const { isLoggedIn } = useUser();

  if (isLoggedIn) {
    return <Navigate to="/committee" />;
  }
  async function onSubmit(
    data: CreateCommitteeSchema,
    setErrorMessage: (error: string | null) => void
  ) {
    try {
      const committee = await trpcClient.chair.createCommittee.mutate(data);
      await joinCommittee({
        code: committee.code,
        countryCode: CHAIR_IDENTIFIER,
        passphrase: data.passphrase,
      });
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  }
  return (
    <CommitteeSettingsForm onSubmit={onSubmit} schema={createCommitteeSchema} />
  );
}
