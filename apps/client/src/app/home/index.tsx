import { useUser } from "@/hooks/use-user";
import { Navigate } from "react-router";
import { JoinCommitteeForm } from "./form";

export function Home() {
  const { isLoggedIn } = useUser();

  if (isLoggedIn) {
    return <Navigate to="/committee" />;
  }
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-primary text-center">MUNVote</h2>
      <JoinCommitteeForm />
    </div>
  );
}
