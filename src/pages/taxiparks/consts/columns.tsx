import type { ColumnDef } from "@tanstack/react-table";

import { cn } from "@/shared/utils";

import type { DirectorTaxiParkTableRow, TaxiParkHealthStatus } from "./types";

const moneyFormatter = new Intl.NumberFormat("ru-RU");
const percentFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 1,
});

export const columns: ColumnDef<DirectorTaxiParkTableRow>[] = [
  { accessorKey: "name", header: "Таксопарк" },
  {
    accessorKey: "address",
    header: "Адрес",
  },
  {
    accessorKey: "driversCount",
    header: "Водители",
    cell: ({ getValue }) => (
      <span className="tabular-nums">{String(getValue<number>())}</span>
    ),
  },
  {
    accessorKey: "activeDriversCount",
    header: "Активные",
    cell: ({ getValue }) => (
      <span className="tabular-nums">{String(getValue<number>())}</span>
    ),
  },
  {
    accessorKey: "carsCount",
    header: "Авто",
    cell: ({ getValue }) => (
      <span className="tabular-nums">{String(getValue<number>())}</span>
    ),
  },
  {
    accessorKey: "totalRevenue",
    header: "Выручка",
    cell: ({ getValue }) => (
      <span className="text-accent-primary font-bold tabular-nums">
        ₽ {moneyFormatter.format(getValue<number>())}
      </span>
    ),
  },
  {
    accessorKey: "averageRevenuePerActiveDriver",
    header: "Средняя выручка водителя",
    cell: ({ getValue }) => (
      <span className="tabular-nums">
        ₽ {moneyFormatter.format(getValue<number>())}
      </span>
    ),
  },
  {
    accessorKey: "averageRevenuePerCar",
    header: "Средняя выручка авто",
    cell: ({ getValue }) => (
      <span className="tabular-nums">
        ₽ {moneyFormatter.format(getValue<number>())}
      </span>
    ),
  },
  {
    accessorKey: "onlineRate",
    header: "Выход на линию",
    cell: ({ getValue }) => (
      <span className="tabular-nums">
        {percentFormatter.format(getValue<number>())}%
      </span>
    ),
  },
  {
    accessorKey: "downtimeRate",
    header: "Простой",
    cell: ({ getValue }) => (
      <span className="tabular-nums">
        {percentFormatter.format(getValue<number>())}%
      </span>
    ),
  },
  {
    accessorKey: "estimatedDowntimeLoss",
    header: "Потери",
    cell: ({ getValue }) => (
      <span className="tabular-nums">
        ₽ {moneyFormatter.format(getValue<number>())}
      </span>
    ),
  },
  {
    accessorKey: "healthStatus",
    header: "Состояние",
    cell: ({ getValue }) => {
      const value = getValue<TaxiParkHealthStatus>();
      const label = value === "attention" ? "Требует внимания" : "Стабильно";

      return (
        <span
          className={cn(
            "inline-flex h-7 items-center rounded-[10px] px-3 text-xs font-semibold",
            value === "attention" &&
              "bg-accent-primary-soft text-accent-primary",
            value === "stable" && "bg-dark-primary-soft text-text-primary",
          )}
        >
          {label}
        </span>
      );
    },
  },
];
