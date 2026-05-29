import type { ReactNode } from "react";

import {
  AppText,
  TEXT_SIZES_VARIABLES,
  TEXT_VARIANTS_VARIABLES,
} from "@/shared/ui/app-text";
import { CardSurface } from "@/shared/ui/card-surface";

export interface ProgressCardProps {
  title?: ReactNode;
  value: number;
  max?: number;
  secondaryText?: ReactNode;
  className?: string;
}

export function ProgressCard({
  title,
  value,
  max = 100,
  secondaryText,
  className,
}: ProgressCardProps) {
  const safeMax = max > 0 ? max : 1;
  const ratio = value / safeMax;
  const percentage = Math.max(0, Math.min(100, ratio * 100));

  return (
    <CardSurface className={className}>
      <div className="flex items-center justify-between gap-2">
        {title != null && (
          <AppText
            variant={TEXT_VARIANTS_VARIABLES.main}
            size={TEXT_SIZES_VARIABLES.medium}
            className="font-medium"
          >
            {title}
          </AppText>
        )}
        {secondaryText != null && (
          <AppText
            variant={TEXT_VARIANTS_VARIABLES.main}
            size={TEXT_SIZES_VARIABLES.xs}
            className="text-accent-primary font-medium"
          >
            {secondaryText}
          </AppText>
        )}
      </div>

      <div className="bg-dark-primary-soft h-2 w-full overflow-hidden rounded-full">
        <div
          className="bg-accent-primary h-full rounded-full transition-[width]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </CardSurface>
  );
}
