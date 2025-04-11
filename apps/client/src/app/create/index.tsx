import { useJoinCommittee } from "@/hooks/use-join-committee";
import { useUser } from "@/hooks/use-user";
import {Button} from "@/components/ui/button"
import { trpcClient } from "@/utils/trpc";
import {
  CHAIR_IDENTIFIER,
  createCommitteeSchema,
  CreateCommitteeSchema,
} from "@repo/api";
import { Navigate, useNavigate,Link } from "react-router";
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
    <div className="flex flex-col gap-2 w-full max-w-[600px] self-center"><h3 className="text-xl font-semibold">Create Committee</h3><CommitteeSettingsForm onSubmit={onSubmit} schema={createCommitteeSchema} /><Link to="/"><Button variant="outline">Have an invite code?</Button></Link></div>
  );
}
