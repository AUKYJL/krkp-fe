import type { ReactNode } from "react";

import {
  AppText,
  TEXT_SIZES_VARIABLES,
  TEXT_VARIANTS_VARIABLES,
} from "@/shared/ui/app-text";
import { CardSurface } from "@/shared/ui/card-surface";
import { cn } from "@/shared/utils";

export interface KpiCardProps {
  label?: ReactNode;
  value?: ReactNode;
  meta?: ReactNode;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  metaClassName?: string;
}

export const KpiCard = ({
  label,
  value,
  meta,
  className,
  labelClassName,
  valueClassName,
  metaClassName,
}: KpiCardProps) => {
  return (
    <CardSurface className={className}>
      {label != null && (
        <AppText
          size={TEXT_SIZES_VARIABLES.xs}
          className={cn("font-medium", labelClassName)}
        >
          {label}
        </AppText>
      )}

      {value != null && (
        <AppText
          className={cn(
            "text-text-primary text-[22px] font-bold",
            valueClassName,
          )}
        >
          {value}
        </AppText>
      )}

      {meta != null && (
        <AppText
          variant={TEXT_VARIANTS_VARIABLES.main}
          size={TEXT_SIZES_VARIABLES.xs}
          className={cn("text-accent-primary font-semibold", metaClassName)}
        >
          {meta}
        </AppText>
      )}
    </CardSurface>
  );
};
