import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[98%] transition-all",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 font-semibold",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground font-medium",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 font-medium",
        ghost: "font-medium",
        link: "text-primary underline-offset-4 hover:underline font-medium",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-10",
        "icon-sm": "size-7 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  shouldShowChildrenOnLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  isLoading: externalIsLoading = false,
  shouldShowChildrenOnLoading = false,
  leftIcon,
  rightIcon,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  const [isLoading, setIsLoading] = React.useState(externalIsLoading);
  const hasExternalIsLoading = typeof externalIsLoading === "boolean";
  const derivedIsLoading = hasExternalIsLoading ? externalIsLoading : isLoading;
  return (
    <Comp
      type="button"
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
      onClick={
        hasExternalIsLoading
          ? onClick
          : onClick
            ? async (e) => {
                setIsLoading(true);
                try {
                  await onClick(e);
                } catch {}
                setIsLoading(false);
              }
            : undefined
      }
    >
      <>
        {derivedIsLoading ? <Spinner /> : leftIcon}
        {(!derivedIsLoading || shouldShowChildrenOnLoading) && children}
        {rightIcon}
      </>
    </Comp>
  );
}

export { Button, buttonVariants };
