import { useUser } from "@/hooks/use-user";
import { Navigate } from "react-router";
import { JoinCommitteeForm } from "./form";

export function Home() {
  const { isLoggedIn } = useUser();

  if (isLoggedIn) {
    return <Navigate to="/committee" />;
  }
  return <JoinCommitteeForm />;
}
