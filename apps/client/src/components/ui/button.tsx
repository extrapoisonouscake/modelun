import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  shouldShowChildrenOnLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
function Button({
  className,

  asChild = false,
  isLoading: externalIsLoading = false,
  shouldShowChildrenOnLoading = true,
  leftIcon,
  ref,
  disabled,
  onClick,
  variant,
  size,
  rightIcon,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  const [isLoading, setIsLoading] = React.useState(externalIsLoading);
  const hasExternalIsLoading = typeof externalIsLoading === "boolean";

  const derivedIsLoading = hasExternalIsLoading ? externalIsLoading : isLoading;
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      type="button"
      disabled={disabled || derivedIsLoading}
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
export const Spinner = ({ className }: { className?: string }) => (
  <svg
    className={cn("animate-spin", className)}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
export { Button, buttonVariants };
