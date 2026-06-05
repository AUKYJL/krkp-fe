import type { Table } from "@tanstack/react-table";
import type { ReactElement } from "react";

import { Pagination } from "@/features/pagination";
import {
  PAGE_SIZE_OPTIONS,
  type PageSizeOption,
} from "@/features/pagination";
import { cn } from "@/shared/utils";

type DataTablePaginationProps<TData> = {
  className?: string;
  pageSizeOptions?: readonly PageSizeOption[];
  table: Table<TData>;
};

export const DataTablePagination = <TData,>({
  className,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  table,
}: DataTablePaginationProps<TData>): ReactElement => {
  return (
    <Pagination
      className={cn(className)}
      page={table.getState().pagination.pageIndex + 1}
      pageCount={table.getPageCount()}
      pageSize={table.getState().pagination.pageSize}
      pageSizeOptions={pageSizeOptions}
      canPrevious={table.getCanPreviousPage()}
      canNext={table.getCanNextPage()}
      onPageChange={(page) => table.setPageIndex(Math.max(0, page - 1))}
      onPageSizeChange={(pageSize) => table.setPageSize(pageSize)}
    />
  );
};
