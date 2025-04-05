import { useUser } from "@/hooks/use-user";
import { Navigate } from "react-router";

export function AuthorizedOnly({
  component,
}: {
  component: () => React.ReactNode;
}) {
  const { isLoggedIn } = useUser();

  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }
  return component();
}
