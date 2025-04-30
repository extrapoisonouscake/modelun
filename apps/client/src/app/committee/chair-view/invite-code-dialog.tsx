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
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
export function InviteCodeDialog({ value }: { value: Committee["code"] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const isChairFirstLogin = searchParams.get("chairFirstLogin");
  useEffect(() => {
    if (isChairFirstLogin) {
      setIsOpen(true);
      setSearchParams({});
    }
  }, [isChairFirstLogin]);
  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger>
          <Button variant="outline" size="icon">
            <UserPlus className="text-primary" />
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
