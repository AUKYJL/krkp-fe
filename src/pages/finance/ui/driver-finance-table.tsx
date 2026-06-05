import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/features/data-table";

import type { DrawerMode, DriverRevenueDay } from "../types";
import {
  formatCurrency,
  formatDateFull,
  getDayStatus,
} from "../utils/finance-page.utils";
import { RevenueStatusBadge } from "./revenue-status-badge";

type DriverFinanceTableProps = {
  data: DriverRevenueDay[];
  onOpenDay: (day: DriverRevenueDay, mode: DrawerMode) => void;
};

export const DriverFinanceTable = ({
  data,
  onOpenDay,
}: DriverFinanceTableProps) => {
  const handleRowClick = (day: DriverRevenueDay) => {
    onOpenDay(day, getDayStatus(day) === "filled" ? "view" : "edit");
  };

  const columns: ColumnDef<DriverRevenueDay>[] = [
    {
      accessorKey: "workDate",
      header: "Дата",
      cell: ({ row }) => (
        <span className="text-text-primary text-sm font-semibold tabular-nums">
          {formatDateFull(row.original.workDate)}
        </span>
      ),
    },
    {
      accessorKey: "revenue",
      header: "Выручка",
      cell: ({ row }) => (
        <span className="text-text-primary text-sm font-semibold tabular-nums">
          {formatCurrency(row.original.revenue)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Статус",
      cell: ({ row }) => (
        <RevenueStatusBadge status={getDayStatus(row.original)} />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      initialPageSize={10}
      onRowClick={handleRowClick}
    />
  );
};
