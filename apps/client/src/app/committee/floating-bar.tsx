import { useUser } from "@/hooks/use-user";
import { useInitializedAppStore } from "@/lib/store";
import { InviteCodeDialog } from "./chair-view/invite-code-dialog";
import { CommitteeSettingsDialog } from "./chair-view/settings-modal-dialog";
import { LogOutButton } from "./log-out-button";

export function FloatingBar() {
  const { isChair } = useUser();
  console.log({ isChair });
  const committee = useInitializedAppStore((state) => state.committee);
  return (
    <div className="flex gap-2 fixed left-1/2 -translate-x-1/2 bottom-2 bg-background rounded-xl shadow-2xl border p-2">
      {isChair && (
        <>
          <InviteCodeDialog value={committee.code} />
          <CommitteeSettingsDialog committee={committee} />
        </>
      )}

      <LogOutButton />
    </div>
  );
}
