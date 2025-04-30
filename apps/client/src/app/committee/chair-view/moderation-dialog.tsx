import { CountryBadge } from "@/components/misc/country-badge";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { DialogTrigger } from "@/components/ui/dialog";
import { useAppStore, useInitializedAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { trpcClient } from "@/utils/trpc";
import { BanIcon, ShieldIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { flattenCountryInfo as flattenCountryInfoFn } from "../helpers";
export function ModerationDialog() {
  const participants = useInitializedAppStore((state) => state.participants);
  const committee = useInitializedAppStore((state) => state.committee);
  const { deleteParticipant: deleteParticipantFromStore } = useAppStore();
  const banParticipant = async (countryCode: string) => {
    await trpcClient.chair.banParticipant.mutate({ countryCode });
    toast.success("The participant was banned.");
    deleteParticipantFromStore(countryCode);
  };
  const deleteParticipant = async (countryCode: string) => {
    await trpcClient.chair.deleteParticipant.mutate({ countryCode });
    toast.success("The participant was deleted.");
    deleteParticipantFromStore(countryCode);
  };
  const flattenCountryInfo = flattenCountryInfoFn(committee.customCountries);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <ShieldIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Moderation</DialogTitle>
          <DialogDescription>
            Manage participants of the committee.
          </DialogDescription>
        </DialogHeader>
        {participants.length > 0 ? (
          participants.map(({ countryCode }) => {
            const country = flattenCountryInfo(countryCode);
            return (
              <CountryBadge
                variant="outline"
                country={country}
                rightElement={
                  <>
                    <SmallButton
                      className="text-destructive-foreground"
                      onClick={() => deleteParticipant(country.code)}
                    >
                      <TrashIcon className="size-3" />
                    </SmallButton>
                    <SmallButton
                      className="text-destructive-foreground"
                      onClick={() => banParticipant(country.code)}
                    >
                      <BanIcon className="size-3" />
                    </SmallButton>
                  </>
                }
              />
            );
          })
        ) : (
          <p>No participants yet.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
function SmallButton({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className: string;
} & ButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("size-4 rounded-sm p-0", className)}
      {...props}
    >
      {children}
    </Button>
  );
}
