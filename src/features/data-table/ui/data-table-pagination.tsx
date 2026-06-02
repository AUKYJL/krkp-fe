import type { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { ReactElement } from "react";

import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { cn } from "@/shared/utils";

import {
  PAGE_SIZE_OPTIONS,
  type TYPE_PAGE_SIZE_OPTIONS,
} from "../consts/consts";

type DataTablePaginationProps<TData> = {
  className?: string;
  pageSizeOptions?: readonly TYPE_PAGE_SIZE_OPTIONS[];
  table: Table<TData>;
};

export const DataTablePagination = <TData,>({
  className,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  table,
}: DataTablePaginationProps<TData>): ReactElement => {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const currentPage = pageIndex + 1;

  const canPrevious = table.getCanPreviousPage();
  const canNext = table.getCanNextPage();

  const pages = (() => {
    if (pageCount <= 0) return [];

    const candidates = [currentPage - 1, currentPage, currentPage + 1].filter(
      (p) => p >= 1 && p <= pageCount,
    );

    return Array.from(new Set(candidates));
  })();

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Select
          value={String(table.getState().pagination.pageSize)}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger className="h-9 w-[120px] rounded-[12px] px-3">
            <SelectValue placeholder="25" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <div className="text-text-secondary text-sm">
          Page {currentPage} of {pageCount || 1}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={BUTTON_VARIANTS_VARIABLES.secondary}
          className="h-9 w-9 rounded-[12px] px-0"
          onClick={() => table.setPageIndex(0)}
          disabled={!canPrevious}
          aria-label="Go to first page"
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          type="button"
          variant={BUTTON_VARIANTS_VARIABLES.secondary}
          className="h-9 w-9 rounded-[12px] px-0"
          onClick={() => table.previousPage()}
          disabled={!canPrevious}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>

        {pages.map((page) => (
          <Button
            key={page}
            type="button"
            variant={
              page === currentPage
                ? BUTTON_VARIANTS_VARIABLES.tertiary
                : BUTTON_VARIANTS_VARIABLES.secondary
            }
            className="h-9 min-w-9 rounded-[12px] px-3 tabular-nums"
            onClick={() => table.setPageIndex(page - 1)}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Button>
        ))}

        <Button
          type="button"
          variant={BUTTON_VARIANTS_VARIABLES.secondary}
          className="h-9 w-9 rounded-[12px] px-0"
          onClick={() => table.nextPage()}
          disabled={!canNext}
          aria-label="Go to next page"
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          type="button"
          variant={BUTTON_VARIANTS_VARIABLES.secondary}
          className="h-9 w-9 rounded-[12px] px-0"
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!canNext}
          aria-label="Go to last page"
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </div>
  );
};
