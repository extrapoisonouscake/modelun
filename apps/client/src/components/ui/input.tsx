import * as React from "react";

import { cn } from "@/lib/utils";
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightIconContainerProps?: React.HTMLAttributes<HTMLDivElement>;
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      leftIcon,
      rightIcon,
      rightIconContainerProps,
      ...props
    }: InputProps,
    ref
  ) => {
    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          data-slot="input"
          className={cn(
            "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            className
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div
            {...rightIconContainerProps}
            className={cn(
              "absolute rounded-lg right-[1px] px-3 top-[1px] bottom-[1px] h-[calc(100%-2px)] flex items-center justify-center bg-background",
              rightIconContainerProps?.className
            )}
          >
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);
