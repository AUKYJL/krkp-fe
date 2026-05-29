import type { ColumnDef } from "@tanstack/react-table";

export type ExportColumn<TData> = {
  key: keyof TData;
  label: string;
};

export function getExportColumns<TData>(
  columns: ColumnDef<TData, unknown>[],
): ExportColumn<TData>[] {
  return columns
    .map((column) => {
      if (!("accessorKey" in column)) return null;

      const key = column.accessorKey;
      if (typeof key !== "string") return null;

      const label = typeof column.header === "string" ? column.header : key;

      return { key: key as keyof TData, label };
    })
    .filter((column): column is ExportColumn<TData> => column != null);
}

export function toCsvValue(value: unknown): string | number | boolean | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value;
  if (value instanceof Date) return value.toISOString();
  return JSON.stringify(value);
}
