import type {
  DriverHomeCarStatus,
  DriverHomeRecentDayStatus,
} from "../../consts/driver-home-mock-data";

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

export const getCarStatusConfig = (status: DriverHomeCarStatus) => {
  if (status === "ok") {
    return {
      label: "Исправен",
      tone: "default" as const,
    };
  }

  if (status === "risk") {
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

export const getRecentDayStatusConfig = (status: DriverHomeRecentDayStatus) => {
  if (status === "filled") {
    return {
      label: "Заполнено",
      tone: "default" as const,
    };
  }

  return {
    label: "Не заполнено",
    tone: "muted" as const,
  };
};
