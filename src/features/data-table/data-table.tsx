import type { ColumnDef, SortingState } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronUp } from "lucide-react";
import { useState } from "react";

import { cn } from "@/shared/utils";

import type { TYPE_PAGE_SIZE_OPTIONS } from "./consts/consts";
import { DataTablePagination } from "@/features/data-table/ui/data-table-pagination";

type DataTableProps<TData> = {
  className?: string;
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  initialPageSize?: TYPE_PAGE_SIZE_OPTIONS;
  onRowClick?: (row: TData) => void;
};

export const DataTable: <TData>(props: DataTableProps<TData>) => JSX.Element = ({
  className,
  columns,
  data,
  initialPageSize = 25,
  onRowClick,
}: DataTableProps<TData>) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    enableMultiSort: false,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageIndex: 0, pageSize: initialPageSize },
    },
  });

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="border-border-default bg-background-card overflow-hidden rounded-[14px] border">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed caption-bottom text-sm">
            <thead className="border-border-default border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const isSorted = header.column.getIsSorted();

                    return (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        className={cn(
                          "text-text-secondary h-11 px-4 text-left align-middle text-xs font-semibold tracking-wide uppercase",
                          canSort && "select-none",
                        )}
                      >
                        {header.isPlaceholder ? null : (
                          <button
                            type="button"
                            className={cn(
                              "inline-flex items-center gap-2",
                              canSort &&
                                "hover:text-text-primary cursor-pointer",
                              !canSort && "cursor-default",
                            )}
                            onClick={
                              canSort
                                ? header.column.getToggleSortingHandler()
                                : undefined
                            }
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {canSort && isSorted && (
                              <ChevronUp
                                className={cn(
                                  "size-4 transition-transform duration-200",
                                  isSorted === "desc" && "rotate-180",
                                )}
                              />
                            )}
                          </button>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-border-default h-[65px] border-b last:border-0",
                    onRowClick && "hover:bg-dark-primary-soft cursor-pointer",
                  )}
                  onClick={
                    onRowClick ? () => onRowClick(row.original) : undefined
                  }
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={
                    onRowClick
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onRowClick(row.original);
                          }
                        }
                      : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="text-text-primary h-[65px] px-4 py-0 align-middle"
                    >
                      <div className="min-w-0 truncate">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
              {(() => {
                const visibleRows = table.getRowModel().rows.length;
                if (visibleRows === 0) return null;

                const pageSize = table.getState().pagination.pageSize;
                const missing = Math.max(0, pageSize - visibleRows);
                const colCount = table.getAllLeafColumns().length;

                if (missing === 0) return null;

                return Array.from({ length: missing }).map((_, index) => (
                  <tr
                    key={`empty-${index}`}
                    aria-hidden="true"
                    className="border-border-default h-[65px] border-b last:border-0"
                  >
                    {Array.from({ length: colCount }).map((__, cellIndex) => (
                      <td
                        key={`empty-${index}-${cellIndex}`}
                        className="h-[65px] px-4 py-0 align-middle"
                      >
                        <span className="invisible">—</span>
                      </td>
                    ))}
                  </tr>
                ));
              })()}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td
                    colSpan={table.getAllLeafColumns().length}
                    className="text-text-secondary p-6 text-center"
                  >
                    No results.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
};
