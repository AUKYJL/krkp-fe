import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/shared/utils";

export type CardSurfaceProps = ComponentPropsWithoutRef<"div">;

export const CardSurface = ({ className, ...props }: CardSurfaceProps) => {
  return (
    <div
      className={cn(
        "bg-background-card flex flex-col gap-2 rounded-[14px] p-4 shadow-[0_6px_18px_0_rgba(35,35,35,0.06)]",
        className,
      )}
      {...props}
    />
  );
};
