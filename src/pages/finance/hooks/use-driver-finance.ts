import { useState } from "react";

import type { DrawerMode, DriverRevenueDay, RevenuePeriodKey } from "../types";
import {
  buildDriverRevenueDays,
  createEmptyKpiCard,
  formatCurrency,
  formatDateFull,
  formatDateShort,
  getNormalizedRange,
  getPresetRange,
  isSameDateKey,
  isWithinRange,
  startOfLocalDay,
  toDateKey,
} from "../utils/finance-page.utils";

import type { DateRangePickerValue } from "@/features/date-range-picker";

type UseDriverFinanceParams = {
  fullName: string;
};

export const useDriverFinance = ({ fullName }: UseDriverFinanceParams) => {
  const today = startOfLocalDay(new Date());
  const [revenueDays, setRevenueDays] = useState(() =>
    buildDriverRevenueDays(fullName),
  );
  const [period, setPeriod] = useState<RevenuePeriodKey>("week");
  const [customRange, setCustomRange] = useState<DateRangePickerValue>(
    getPresetRange("month", today),
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("view");
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  const activeRange = getNormalizedRange(period, customRange, today);
  const filteredDays = revenueDays.filter((day) =>
    isWithinRange(day.workDate, activeRange),
  );
  const sortedByDateAsc = [...filteredDays].sort((left, right) => {
    return left.workDate.localeCompare(right.workDate);
  });
  const filledDays = sortedByDateAsc.filter((day) => day.revenue != null);
  const tableDays = [...filteredDays].sort((left, right) => {
    return right.workDate.localeCompare(left.workDate);
  });
  const selectedDay = selectedDayId
    ? revenueDays.find((day) => day.id === selectedDayId)
    : undefined;
  const todayKey = toDateKey(today);
  const todayDay = revenueDays.find((day) =>
    isSameDateKey(day.workDate, todayKey),
  );
  const missingCount = filteredDays.filter((day) => day.revenue == null).length;
  const revenueValues = filledDays
    .map((day) => day.revenue)
    .filter((value): value is number => value != null);
  const chartData = filledDays.map((day) => ({
    date: formatDateShort(day.workDate),
    value: day.revenue ?? 0,
  }));

  const kpiCards =
    filteredDays.length === 0
      ? [
          createEmptyKpiCard("Общая выручка за период"),
          createEmptyKpiCard("Средняя выручка за рабочий день"),
          createEmptyKpiCard("Лучший день по выручке"),
          createEmptyKpiCard("Худший день по выручке"),
          {
            label: "Количество рабочих дней",
            value: "—",
            meta: "За выбранный период нет рабочих дней",
            valueClassName: "text-text-primary",
            metaClassName: "text-text-secondary",
            className: "min-w-0",
          },
          {
            label: "Дней без заполненной выручки",
            value: "—",
            meta: "Нет данных за выбранный период",
            valueClassName: "text-text-primary",
            metaClassName: "text-text-secondary",
            className: "min-w-0",
          },
        ]
      : (() => {
          const totalRevenue =
            revenueValues.length > 0
              ? revenueValues.reduce((total, value) => total + value, 0)
              : undefined;
          const averageRevenue =
            totalRevenue != null && revenueValues.length > 0
              ? Math.round(totalRevenue / revenueValues.length)
              : undefined;
          const bestDay =
            revenueValues.length > 0
              ? filledDays.reduce(
                  (best, day) => {
                    if (!best || (day.revenue ?? 0) > (best.revenue ?? 0)) {
                      return day;
                    }

                    return best;
                  },
                  undefined as DriverRevenueDay | undefined,
                )
              : undefined;
          const worstDay =
            revenueValues.length > 0
              ? filledDays.reduce(
                  (worst, day) => {
                    if (!worst || (day.revenue ?? 0) < (worst.revenue ?? 0)) {
                      return day;
                    }

                    return worst;
                  },
                  undefined as DriverRevenueDay | undefined,
                )
              : undefined;

          return [
            {
              label: "Общая выручка за период",
              value: totalRevenue != null ? formatCurrency(totalRevenue) : "—",
              meta:
                totalRevenue != null
                  ? `${filledDays.length} заполн. дней`
                  : "Выручка за период еще не заполнена",
              valueClassName: "text-text-primary",
              metaClassName:
                totalRevenue != null
                  ? "text-accent-primary"
                  : "text-text-secondary",
              className: "min-w-0",
            },
            {
              label: "Средняя выручка за рабочий день",
              value:
                averageRevenue != null ? formatCurrency(averageRevenue) : "—",
              meta:
                averageRevenue != null
                  ? "По заполненным рабочим дням"
                  : "Нет заполненных дней в периоде",
              valueClassName: "text-text-primary",
              metaClassName:
                averageRevenue != null
                  ? "text-accent-primary"
                  : "text-text-secondary",
              className: "min-w-0",
            },
            {
              label: "Лучший день по выручке",
              value:
                bestDay?.revenue != null
                  ? formatCurrency(bestDay.revenue)
                  : "—",
              meta: bestDay
                ? formatDateFull(bestDay.workDate)
                : "Нет данных за выбранный период",
              valueClassName: "text-text-primary",
              metaClassName:
                bestDay != null ? "text-accent-primary" : "text-text-secondary",
              className: "min-w-0",
            },
            {
              label: "Худший день по выручке",
              value:
                worstDay?.revenue != null
                  ? formatCurrency(worstDay.revenue)
                  : "—",
              meta: worstDay
                ? formatDateFull(worstDay.workDate)
                : "Нет данных за выбранный период",
              valueClassName: "text-text-primary",
              metaClassName:
                worstDay != null
                  ? "text-accent-primary"
                  : "text-text-secondary",
              className: "min-w-0",
            },
            {
              label: "Количество смен",
              value: String(filteredDays.length),
              meta: "В выбранном периоде",
              valueClassName: "text-text-primary",
              metaClassName: "text-accent-primary",
              className: "min-w-0",
            },
          ];
        })();

  const updateDay = ({
    dayId,
    revenue,
    comment,
  }: {
    dayId: string;
    revenue: number;
    comment?: string;
  }) => {
    setRevenueDays((currentDays) => {
      return currentDays.map((day) => {
        if (day.id !== dayId) {
          return day;
        }

        return {
          ...day,
          revenue,
          comment: comment && comment.length > 0 ? comment : undefined,
          updatedAt: new Date().toISOString(),
        };
      });
    });
  };

  const openDay = (day: DriverRevenueDay, nextMode: DrawerMode) => {
    setSelectedDayId(day.id);
    setDrawerMode(nextMode);
    setIsDrawerOpen(true);
  };

  const closeDrawer = (open: boolean) => {
    setIsDrawerOpen(open);

    if (!open) {
      setDrawerMode("view");
    }
  };

  const saveSelectedDay = ({
    revenue,
    comment,
  }: {
    revenue: number;
    comment: string;
  }) => {
    if (!selectedDay) {
      return;
    }

    updateDay({
      dayId: selectedDay.id,
      revenue,
      comment,
    });
  };

  const updateTodayRevenue = (revenue: number) => {
    if (!todayDay) {
      return;
    }

    updateDay({
      dayId: todayDay.id,
      revenue,
    });
  };

  const handlePeriodChange = (nextPeriod: RevenuePeriodKey) => {
    setPeriod(nextPeriod);

    if (nextPeriod !== "custom") {
      setCustomRange(getPresetRange(nextPeriod, today));
      setSelectedDayId(null);
    }
  };

  const handleCustomRangeChange = (value: DateRangePickerValue) => {
    setCustomRange(value);
    setPeriod("custom");
  };

  return {
    activeRange,
    chartData,
    closeDrawer,
    customRange,
    drawerMode,
    filteredDays,
    handleCustomRangeChange,
    handlePeriodChange,
    isDrawerOpen,
    kpiCards,
    openDay,
    period,
    saveSelectedDay,
    selectedDay,
    setDrawerMode,
    tableDays,
    todayDay,
    updateTodayRevenue,
  };
};
