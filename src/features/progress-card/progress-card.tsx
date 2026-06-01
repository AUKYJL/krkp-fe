import type { ReactNode } from "react";

import { AppText } from "@/shared/ui/app-text";
import { CardSurface } from "@/shared/ui/card-surface";
import { cn } from "@/shared/utils";

export interface ProgressCardProps {
  title?: ReactNode;
  value: number;
  max?: number;
  secondaryText?: ReactNode;
  className?: string;
}

export const ProgressCard = ({
  title,
  value,
  max = 100,
  secondaryText,
  className,
}: ProgressCardProps) => {
  const safeMax = max > 0 ? max : 1;
  const percentage = Math.max(0, Math.min(100, (value / safeMax) * 100));

  return (
    <CardSurface className={cn("flex flex-col gap-2", className)}>
      {(title != null || secondaryText != null) && (
        <div className="flex items-center justify-between gap-3">
          {title != null && (
            <AppText className="text-text-primary text-sm font-bold">
              {title}
            </AppText>
          )}
          {secondaryText != null && (
            <AppText className="text-accent-primary text-sm font-bold">
              {secondaryText}
            </AppText>
          )}
        </div>
      )}

      <div className="bg-border-default/60 h-2 w-full overflow-hidden rounded-full">
        <div
          className="bg-accent-primary h-full rounded-full transition-[width]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </CardSurface>
  );
};
