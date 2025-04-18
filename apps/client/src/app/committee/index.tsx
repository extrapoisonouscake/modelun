import { AuthorizedOnly } from "@/components/misc/authorized-only";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@/hooks/use-user";

import { useAppStore } from "@/lib/store";
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
  console.log({ isLoaded });
  useEffect(() => {
    //!TEMPORARY
    console.log()
    const interval = setInterval(() => {
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
           if(!isLoaded) setIsLoaded(true);
          }
        );
    }, 500);
    return () => clearInterval(interval);
  }, []);

  if (!isLoaded) return <Spinner />;

  return (
    <div className="relative">
      {isChair ? <ChairView /> : <MemberView />}
      <FloatingBar />
    </div>
  );
}

export function CommitteePage() {
  return <AuthorizedOnly component={CommitteePageContent} />;
}
