import type { ReactNode } from "react";

import {
  AppText,
  TAG,
  TEXT_SIZES_VARIABLES,
  TEXT_VARIANTS_VARIABLES,
} from "@/shared/ui/app-text";
import { CardSurface } from "@/shared/ui/card-surface";
import { cn } from "@/shared/utils";

export interface TitledBlockProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  topRightSlot?: ReactNode;
  children?: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function TitledBlock({
  title,
  subtitle,
  topRightSlot,
  children,
  className,
  headerClassName,
  contentClassName,
}: TitledBlockProps) {
  const hasHeader = title != null || subtitle != null || topRightSlot != null;

  return (
    <CardSurface className={className}>
      {hasHeader && (
        <div
          className={cn(
            "flex items-start justify-between gap-4",
            headerClassName,
          )}
        >
          <div className="min-w-0">
            {title != null && (
              <AppText
                tag={TAG.h3}
                variant={TEXT_VARIANTS_VARIABLES.main}
                size={TEXT_SIZES_VARIABLES.medium}
                className="text-text-primary font-bold break-words"
              >
                {title}
              </AppText>
            )}

            {subtitle != null && (
              <AppText
                variant={TEXT_VARIANTS_VARIABLES.main}
                size={TEXT_SIZES_VARIABLES.xs}
                className="text-text-secondary mt-1 font-medium break-words"
              >
                {subtitle}
              </AppText>
            )}
          </div>

          {topRightSlot != null && (
            <div className="shrink-0">{topRightSlot}</div>
          )}
        </div>
      )}

      {children != null && (
        <div className={cn("min-w-0", contentClassName)}>{children}</div>
      )}
    </CardSurface>
  );
}
