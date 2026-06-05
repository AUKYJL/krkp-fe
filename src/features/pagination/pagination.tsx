import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

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

import { PAGE_SIZE_OPTIONS, type PageSizeOption } from "./consts";

interface PaginationProps {
  canNext: boolean;
  canPrevious: boolean;
  className?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: PageSizeOption) => void;
  page: number;
  pageCount: number;
  pageSize: number;
  pageSizeOptions?: readonly PageSizeOption[];
}

export const Pagination = ({
  canNext,
  canPrevious,
  className,
  onPageChange,
  onPageSizeChange,
  page,
  pageCount,
  pageSize,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
}: PaginationProps) => {
  const safePageCount = Math.max(pageCount, 1);
  const safePage = Math.min(Math.max(page, 1), safePageCount);

  const pages = (() => {
    if (pageCount <= 0) return [];

    const candidates = [safePage - 1, safePage, safePage + 1].filter(
      (item) => item >= 1 && item <= pageCount,
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
          value={String(pageSize)}
          onValueChange={(value) => onPageSizeChange(Number(value) as PageSizeOption)}
        >
          <SelectTrigger className="h-9 w-[120px] rounded-[12px] px-3">
            <SelectValue placeholder={String(pageSizeOptions[0] ?? pageSize)} />
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
          Page {safePage} of {safePageCount}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={BUTTON_VARIANTS_VARIABLES.secondary}
          className="h-9 w-9 rounded-[12px] px-0"
          onClick={() => onPageChange(1)}
          disabled={!canPrevious}
          aria-label="Go to first page"
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          type="button"
          variant={BUTTON_VARIANTS_VARIABLES.secondary}
          className="h-9 w-9 rounded-[12px] px-0"
          onClick={() => onPageChange(safePage - 1)}
          disabled={!canPrevious}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>

        {pages.map((item) => (
          <Button
            key={item}
            type="button"
            variant={
              item === safePage
                ? BUTTON_VARIANTS_VARIABLES.tertiary
                : BUTTON_VARIANTS_VARIABLES.secondary
            }
            className="h-9 min-w-9 rounded-[12px] px-3 tabular-nums"
            onClick={() => onPageChange(item)}
            aria-current={item === safePage ? "page" : undefined}
          >
            {item}
          </Button>
        ))}

        <Button
          type="button"
          variant={BUTTON_VARIANTS_VARIABLES.secondary}
          className="h-9 w-9 rounded-[12px] px-0"
          onClick={() => onPageChange(safePage + 1)}
          disabled={!canNext}
          aria-label="Go to next page"
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          type="button"
          variant={BUTTON_VARIANTS_VARIABLES.secondary}
          className="h-9 w-9 rounded-[12px] px-0"
          onClick={() => onPageChange(pageCount)}
          disabled={!canNext}
          aria-label="Go to last page"
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </div>
  );
};
