import React, { ReactElement, useState } from "react";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";

export function ConfirmationModal({
  children,
  intent,
}: {
  children: ReactElement;
  intent: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => {
    setIsOpen(false);
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {React.cloneElement(children, {
          className: cn("cursor-pointer", children.props.className),
          onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            setIsOpen(true);
          },
        })}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmation</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to {intent}?
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              await children.props.onClick();
              setIsOpen(false);
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
