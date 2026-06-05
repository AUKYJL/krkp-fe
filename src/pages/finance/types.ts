import type { DateRangePickerValue } from "@/features/date-range-picker";

export type RevenuePeriodKey = "today" | "week" | "month" | "custom";
export type DriverRevenueStatus = "filled" | "missing";
export type DrawerMode = "view" | "edit";

export type DriverRevenueDay = {
  id: string;
  workDate: string;
  revenue?: number;
  canEdit: boolean;
  shift: string;
  car: string;
  comment?: string;
  updatedAt?: string;
};

export type RevenuePeriodOption = {
  key: RevenuePeriodKey;
  label: string;
};

export type DriverFinanceDateState = {
  period: RevenuePeriodKey;
  customRange: DateRangePickerValue;
};
