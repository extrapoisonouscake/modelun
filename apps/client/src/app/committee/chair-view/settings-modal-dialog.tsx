import { CommitteeSettingsForm } from "@/app/create/settings-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAppStore } from "@/lib/store";
import { FullCommittee } from "@/types/api";
import { trpcClient } from "@/utils/trpc";
import { CreateCommitteeSchema, updateCommitteeSchema } from "@repo/api";
import { SettingsIcon } from "lucide-react";
import { useState } from "react";

export function CommitteeSettingsDialog({
  committee,
}: {
  committee: FullCommittee;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const updateCommittee = useAppStore((state) => state.updateCommittee);
  async function onSubmit(data: CreateCommitteeSchema) {
    await trpcClient.chair.updateCommittee.mutate(data);

    updateCommittee(data);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <SettingsIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Committee Settings</DialogTitle>
        </DialogHeader>
        <CommitteeSettingsForm
          shouldShowPassphraseField={false}
          onSubmit={onSubmit}
          initialValues={committee}
          schema={updateCommitteeSchema}
        />
      </DialogContent>
    </Dialog>
  );
}
