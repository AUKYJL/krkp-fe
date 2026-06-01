import type { ColumnDef } from "@tanstack/react-table";

import { cn } from "@/shared/utils";

import type { TaxiParkRow, TaxiParkStatus } from "./types";

export const columns: ColumnDef<TaxiParkRow>[] = [
  { accessorKey: "name", header: "Таксопарк" },
  {
    accessorKey: "cars",
    header: "Авто",
    cell: ({ getValue }) => (
      <span className="tabular-nums">{String(getValue<number>())}</span>
    ),
  },
  {
    accessorKey: "drivers",
    header: "Водители",
    cell: ({ getValue }) => (
      <span className="tabular-nums">{String(getValue<number>())}</span>
    ),
  },
  {
    accessorKey: "revenue",
    header: "Выручка",
    cell: ({ getValue }) => (
      <span className="text-accent-primary font-bold tabular-nums">
        ₽ {Intl.NumberFormat("ru-RU").format(getValue<number>())}
      </span>
    ),
  },
  {
    accessorKey: "revenuePerDriver",
    header: "₽ / водитель",
    cell: ({ getValue }) => (
      <span className="tabular-nums">
        ₽ {Intl.NumberFormat("ru-RU").format(getValue<number>())}
      </span>
    ),
  },
  {
    accessorKey: "activeCars",
    header: "Активные",
    cell: ({ getValue }) => (
      <span className="tabular-nums">{String(getValue<number>())}</span>
    ),
  },
  {
    accessorKey: "downtimePercent",
    header: "Простой",
    cell: ({ getValue }) => (
      <span className="tabular-nums">{String(getValue<number>())}%</span>
    ),
  },
  {
    accessorKey: "ratingPlace",
    header: "Рейтинг",
    cell: ({ getValue }) => (
      <span className="text-accent-primary tabular-nums">
        #{String(getValue<number>())}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ getValue }) => {
      const value = getValue<TaxiParkStatus>();
      const label = value === "risk" ? "Риск" : "Активен";

      return (
        <span
          className={cn(
            "inline-flex h-7 items-center rounded-[10px] px-3 text-xs font-semibold",
            value === "risk" && "bg-accent-primary-soft text-accent-primary",
            value === "ok" && "bg-dark-primary-soft text-text-primary",
          )}
        >
          {label}
        </span>
      );
    },
  },
];

