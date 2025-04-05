import { Button } from "@/components/ui/button";

import { useUser } from "@/hooks/use-user";
import { Link, Navigate } from "react-router";
import { JoinCommitteeForm } from "./form";

export function Home() {
  const { isLoggedIn } = useUser();

  if (isLoggedIn) {
    return <Navigate to="/committee" />;
  }
  return (
    <div className="flex flex-col gap-2 w-full max-w-[400px]">
      <JoinCommitteeForm />
      <Link to="/create">
        <Button variant="outline" className="w-full">
          Create Committee
        </Button>
      </Link>
    </div>
  );
}
