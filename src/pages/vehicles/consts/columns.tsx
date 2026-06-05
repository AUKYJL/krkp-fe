import type { ColumnDef } from "@tanstack/react-table";

import { cn } from "@/shared/utils";

import type { VehicleRow } from "./types";
import { getVehicleStatusConfig } from "./vehicle-status";

const formatCompactRubles = (value: number) => {
  if (value === 0) {
    return "₽0";
  }

  const thousands = value / 1000;
  const formatted = Number.isInteger(thousands)
    ? String(thousands)
    : thousands.toFixed(1);

  return `₽${formatted}k`;
};

export const vehicleTableColumns: ColumnDef<VehicleRow>[] = [
  {
    accessorKey: "plate",
    header: "№",
    cell: ({ row }) => (
      <span className="text-sm font-medium tabular-nums">
        {row.original.plate}
      </span>
    ),
  },
  {
    accessorKey: "brand",
    header: "Марка",
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.original.brand}</span>
    ),
  },
  {
    accessorKey: "driver",
    header: "Водитель",
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.original.driver}</span>
    ),
  },
  {
    accessorKey: "park",
    header: "Таксопарк",
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.original.park}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ row }) => {
      const config = getVehicleStatusConfig(row.original.status);

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
    },
  },
  {
    accessorKey: "revenue",
    header: "Выручка",
    cell: ({ row }) => (
      <span className="text-sm font-medium tabular-nums">
        {formatCompactRubles(row.original.revenue)}
      </span>
    ),
  },
  {
    accessorKey: "averageDayRevenue",
    header: "Ср.день",
    cell: ({ row }) => (
      <span className="text-sm font-medium tabular-nums">
        {formatCompactRubles(row.original.averageDayRevenue)}
      </span>
    ),
  },
  {
    accessorKey: "workdays",
    header: "Раб.дни",
    cell: ({ row }) => (
      <span className="text-sm font-medium tabular-nums">
        {row.original.workdays}
      </span>
    ),
  },
  {
    accessorKey: "downtimeDays",
    header: "Простой",
    cell: ({ row }) => (
      <span className="text-sm font-medium tabular-nums">
        {row.original.downtimeDays}
      </span>
    ),
  },
  {
    accessorKey: "downtimePercent",
    header: "%",
    cell: ({ row }) => (
      <span className="text-sm font-medium tabular-nums">
        {row.original.downtimePercent}%
      </span>
    ),
  },
  {
    accessorKey: "efficiencyIndex",
    header: "Индекс",
    cell: ({ row }) => (
      <span className="text-sm font-medium tabular-nums">
        {row.original.efficiencyIndex}
      </span>
    ),
  },
];
