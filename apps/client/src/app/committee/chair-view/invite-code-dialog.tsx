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
import { Copy, UserPlus } from "lucide-react";
import { toast } from "sonner";
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
            Use this code to invite participants to the committee.
          </DialogDescription>
          <div className="flex justify-center items-center gap-2">
            <p className="text-center text-2xl font-bold">{value}</p>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                navigator.clipboard.writeText(value);
                toast.success("Copied to clipboard!", {
                  icon: "🔗",
                });
              }}
            >
              <Copy />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
