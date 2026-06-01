import * as React from "react";

import { cn } from "@/shared/utils";

export type InputProps = React.ComponentPropsWithoutRef<"input">;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "text-text-primary placeholder:text-text-primary/60 border-border-default bg-background-page flex h-10 w-full rounded-[10px] border px-3 py-2.5 text-sm font-medium transition-colors outline-none",
          "focus-visible:border-dark-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
