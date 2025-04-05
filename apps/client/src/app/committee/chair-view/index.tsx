import { useInitializedAppStore } from "@/lib/store";
import { Participants } from "./participants";
import { VotesList } from "./voting-sessions-list";

export function ChairView() {
  return (
    <div className="flex gap-8 w-full">
      <CommitteeInfo />
      <Participants />
      <VotesList />
    </div>
  );
}
export function CommitteeInfo() {
  const committee = useInitializedAppStore((state) => state.committee);
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold">{committee.name}</h1>
      <p className="text-sm text-gray-500">{committee.description}</p>
    </div>
  );
}
