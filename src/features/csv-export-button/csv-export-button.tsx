import type { ColumnDef } from "@tanstack/react-table";
import { Download } from "lucide-react";
import Papa from "papaparse";
import type { ReactElement } from "react";

import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";
import { cn } from "@/shared/utils";

import { getExportColumns, toCsvValue } from "./model";

export interface CsvExportButtonProps<TData> {
  className?: string;
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  fileName?: string;
  label?: string;
}

export const CsvExportButton = <TData,>({
  className,
  columns,
  data,
  fileName = "export",
  label = "Экспорт",
}: CsvExportButtonProps<TData>): ReactElement => {
  const exportColumns = getExportColumns(columns);
  const isDisabled = data.length === 0 || exportColumns.length === 0;

  const handleExport = () => {
    if (isDisabled) return;

    const rows = data.map((row) => {
      const record: Record<string, string | number | boolean | null> = {};
      for (const column of exportColumns) {
        record[column.label] = toCsvValue(
          (row as Record<string, unknown>)[String(column.key)],
        );
      }
      return record;
    });

    const csv = `\ufeff${Papa.unparse(rows, { newline: "\r\n" })}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.toLowerCase().endsWith(".csv")
      ? fileName
      : `${fileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      type="button"
      variant={BUTTON_VARIANTS_VARIABLES.tertiary}
      className={cn(className)}
      disabled={isDisabled}
      onClick={handleExport}
    >
      <Download className="size-4" />
      {label}
    </Button>
  );
};
