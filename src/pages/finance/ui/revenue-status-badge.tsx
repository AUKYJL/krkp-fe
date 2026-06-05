import { cn } from "@/shared/utils";

import type { DriverRevenueStatus } from "../types";
import { getRevenueStatusConfig } from "../utils/finance-page.utils";

type RevenueStatusBadgeProps = {
  status: DriverRevenueStatus;
};

export const RevenueStatusBadge = ({
  status,
}: RevenueStatusBadgeProps) => {
  const config = getRevenueStatusConfig(status);

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-[10px] px-3 text-xs font-semibold",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
};
