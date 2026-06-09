import type { components } from "@/shared/api/apiTypes";
import { getWorkDayStatusConfig } from "@/shared/lib/work-day-status";

type AssignedCarState = components["schemas"]["DriverAnalyticsAssignedCarDto"]["state"];

export const formatDashboardDate = (date: Date) => {
  const formatted = date.toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export const formatEditTime = (date: Date) => {
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const sanitizeRevenueInput = (value: string) => {
  return value.replaceAll(/\D/g, "");
};

export const formatShortDate = (value: string) => {
  return new Date(value).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
  });
};

export const formatFullDate = (value: string) => {
  return new Date(value).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const getCarStatusConfig = (status?: AssignedCarState | null) => {
  if (status === "WORKING") {
    return {
      label: "Исправен",
      tone: "default" as const,
    };
  }

  if (status === "EMERGENCY") {
    return {
      label: "Требует внимания",
      tone: "accent" as const,
    };
  }

  return {
    label: "Недоступен",
    tone: "muted" as const,
  };
};

export const getRecentDayStatusConfig = getWorkDayStatusConfig;
