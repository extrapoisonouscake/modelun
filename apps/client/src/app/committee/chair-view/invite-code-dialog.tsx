import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Committee } from "@repo/api";
import { UserPlus } from "lucide-react";
export function InviteCodeDialog({ value }: { value: Committee["code"] }) {
  return (
    <>
      <Dialog>
        <DialogTrigger>
          <Button variant="outline" size="icon">
            <UserPlus />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Code</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <p className="text-center text-2xl font-bold">{value}</p>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}
