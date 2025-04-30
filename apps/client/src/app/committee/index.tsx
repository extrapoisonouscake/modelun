import { AuthorizedOnly } from "@/components/misc/authorized-only";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@/hooks/use-user";

import { useAppStore } from "@/lib/store";
import { performForceLogOut } from "@/utils/perform-force-log-out";
import { trpcClient } from "@/utils/trpc";
import { useEffect } from "react";
import { ChairView } from "./chair-view";
import { FloatingBar } from "./floating-bar";
import { MemberView } from "./member-view";

function CommitteePageContent() {
  const {
    isLoaded,
    setIsLoaded,
    setCommittee,
    setParticipants,
    setVotingSessions,
    setCurrentVotingSessionId,
  } = useAppStore();
  const { isChair } = useUser();

  useEffect(() => {
    trpcClient.committee.getMine
      .query()
      .then(
        ({
          committee,
          participants,
          votingSessions,
          currentVotingSessionId,
        }) => {
          setCommittee(committee);
          setParticipants(participants);
          setVotingSessions(votingSessions);
          setCurrentVotingSessionId(currentVotingSessionId);
          setIsLoaded(true);
        }
      )
      .catch(() => {
        alert("Error fetching committee");
        performForceLogOut();
      });
  }, []);

  if (!isLoaded) return <Spinner />;

  return (
    <div className="relative pb-20">
      {isChair ? <ChairView /> : <MemberView />}
      <FloatingBar />
    </div>
  );
}

export function CommitteePage() {
  return <AuthorizedOnly component={CommitteePageContent} />;
}
