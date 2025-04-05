import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormValidation } from "@/hooks/use-form-validation";
import { useAppStore } from "@/lib/store";
import { trpcClient } from "@/utils/trpc";
import {
  CreateVotingSessionSchema,
  createVotingSessionSchema,
} from "@repo/api";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

export function AddVotingSession() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" leftIcon={<PlusIcon />}>
          Add
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Voting Session</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Add a new voting session to the committee.
        </DialogDescription>
        <AddVotingSessionForm closeDialog={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
function AddVotingSessionForm({ closeDialog }: { closeDialog: () => void }) {
  const form = useFormValidation(createVotingSessionSchema);
  const { addVotingSession } = useAppStore();
  async function onSubmit(data: CreateVotingSessionSchema) {
    const newVotingSession =
      await trpcClient.chair.createVotingSession.mutate(data);
    addVotingSession(newVotingSession);
    form.reset();
    closeDialog();
  }
  return (
    <Form {...form} onSubmit={onSubmit}>
      <FormInput label="Name" name="name" />
      <FormInput label="Description" name="description" />

      <SubmitButton>Add</SubmitButton>
    </Form>
  );
}
