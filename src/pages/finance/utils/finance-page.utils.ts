import type { DateRange } from "react-day-picker";

import { driverMockData } from "@/pages/drivers/consts";

import type {
  DriverRevenueDay,
  DriverRevenueStatus,
  RevenuePeriodKey,
} from "../types";
import type { DateRangePickerValue } from "@/features/date-range-picker";

const moneyFormatter = new Intl.NumberFormat("ru-RU");
const compactMoneyFormatter = new Intl.NumberFormat("ru-RU", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const sanitizeRevenueInput = (value: string) => {
  return value.replaceAll(/\D/g, "");
};

export const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const startOfLocalDay = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const getDateFromKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, (month ?? 1) - 1, day ?? 1);
};

export const isSameDateKey = (left: string, right: string) => {
  return left === right;
};

export const formatDateShort = (dateKey: string) => {
  return getDateFromKey(dateKey).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
  });
};

export const formatDateFull = (dateKey: string) => {
  return getDateFromKey(dateKey).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatDateLong = (dateKey: string) => {
  const formatted = getDateFromKey(dateKey).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export const formatDrawerUpdatedAt = (value?: string) => {
  if (!value) {
    return "—";
  }

  const parsedDate = new Date(value);

  return parsedDate.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatEditTime = (date: Date) => {
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatCurrency = (value?: number) => {
  if (value == null) {
    return "—";
  }

  return `${moneyFormatter.format(value)} ₽`;
};

export const formatCompactCurrency = (value: number) => {
  return compactMoneyFormatter.format(value);
};

export const getPresetRange = (
  period: Exclude<RevenuePeriodKey, "custom">,
  today: Date,
): DateRange => {
  const normalizedToday = startOfLocalDay(today);

  if (period === "today") {
    return {
      from: normalizedToday,
      to: normalizedToday,
    };
  }

  if (period === "week") {
    return {
      from: new Date(
        normalizedToday.getFullYear(),
        normalizedToday.getMonth(),
        normalizedToday.getDate() - 6,
      ),
      to: normalizedToday,
    };
  }

  return {
    from: new Date(
      normalizedToday.getFullYear(),
      normalizedToday.getMonth(),
      1,
    ),
    to: normalizedToday,
  };
};

export const getNormalizedRange = (
  period: RevenuePeriodKey,
  customRange: DateRangePickerValue,
  today: Date,
): DateRange => {
  if (period !== "custom") {
    return getPresetRange(period, today);
  }

  if (!customRange?.from) {
    return getPresetRange("month", today);
  }

  return {
    from: startOfLocalDay(customRange.from),
    to: startOfLocalDay(customRange.to ?? customRange.from),
  };
};

export const isWithinRange = (dateKey: string, range: DateRange) => {
  if (!range.from) {
    return true;
  }

  const currentDate = startOfLocalDay(getDateFromKey(dateKey));
  const rangeStart = startOfLocalDay(range.from);
  const rangeEnd = startOfLocalDay(range.to ?? range.from);

  return currentDate >= rangeStart && currentDate <= rangeEnd;
};

export const buildDriverRevenueDays = (fullName: string) => {
  const driver =
    driverMockData.find((item) => item.driver === fullName) ??
    driverMockData[0];
  const today = startOfLocalDay(new Date());
  const shifts = ["08:00–17:00", "09:00–18:00", "10:00–19:00"];
  const comments = [
    "Стабильный поток заказов утром и вечером",
    "После обеда спрос снизился, вечер закрыл смену",
    "Высокая загрузка в часы пик возле вокзала",
    "Часть дня ушла на ожидание заказа у аэропорта",
    "Низкий спрос после обеда",
  ];
  const coefficients = [
    0.96, 1.08, 0.87, 1.12, 0.92, 1.04, 0.99, 1.15, 0.9, 1.06, 0.84, 1.11, 0.95,
    1.02, 1.09, 0.91, 1.03, 0.88, 1.13, 0.97, 1.07, 0.93, 1.1, 0.86, 1.05, 0.94,
    1.12, 0.89, 1.01, 1.06,
  ];
  const missingOffsets = new Set([0, 4, 11, 18]);

  const days: DriverRevenueDay[] = [];

  for (let offset = 0; offset < 40; offset += 1) {
    const currentDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - offset,
    );
    const weekday = currentDate.getDay();
    const shouldSkip =
      offset !== 0 && (weekday === 0 || (weekday === 6 && offset % 2 === 1));

    if (shouldSkip) {
      continue;
    }

    const revenue = missingOffsets.has(offset)
      ? undefined
      : Math.round(
          driver.avgPerDay * coefficients[offset % coefficients.length],
        );
    const dateKey = toDateKey(currentDate);

    days.push({
      id: `work-day-${dateKey}`,
      workDate: dateKey,
      revenue,
      canEdit: offset <= 10 || revenue == null,
      shift: shifts[offset % shifts.length],
      car: "Kia Rio",
      comment: revenue == null ? undefined : comments[offset % comments.length],
      updatedAt:
        revenue == null
          ? undefined
          : new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate(),
              18 - (offset % 3),
              12 + ((offset * 7) % 35),
            ).toISOString(),
    });
  }

  return days.sort((left, right) => {
    return right.workDate.localeCompare(left.workDate);
  });
};

export const getDayStatus = (
  day: DriverRevenueDay,
): DriverRevenueStatus => {
  return day.revenue == null ? "missing" : "filled";
};

export const getRevenueStatusConfig = (status: DriverRevenueStatus) => {
  if (status === "filled") {
    return {
      label: "Заполнено",
      className: "bg-dark-primary-soft text-text-primary",
    };
  }

  return {
    label: "Не заполнено",
    className: "bg-accent-primary-soft text-accent-primary",
  };
};

export const createEmptyKpiCard = (label: string) => {
  return {
    label,
    value: "—",
    meta: "Нет данных за выбранный период",
    valueClassName: "text-text-primary",
    metaClassName: "text-text-secondary",
    className: "min-w-0",
  };
};
