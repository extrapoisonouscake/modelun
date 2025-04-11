import { useInitializedAppStore } from "@/lib/store";
import { Participants } from "./participants";
import { VotesList } from "./voting-sessions-list";

export function ChairView() {
  return (
    <div className="flex flex-col items-center gap-8 relative">
      <div className="flex flex-col gap-2">
        <CommitteeInfo />
        <VotesList />
      </div>
      <Participants />
    </div>
  );
}
export function CommitteeInfo() {
  const committee = useInitializedAppStore((state) => state.committee);
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold text-center">{committee.name}</h1>
      <p className="text-sm text-gray-500 text-center">
        {committee.description}
      </p>
    </div>
  );
}
