import type { KpiCardProps } from "@/features/kpi-card";
import type { VerticalBarChartItem } from "@/features/vertical-bar-chart";
import { driverMockData } from "@/pages/drivers/consts";

export type DriverHomeCarStatus = "ok" | "risk" | "unavailable";
export type DriverHomeRecentDayStatus = "filled" | "missing";

export interface DriverHomeRecentDay {
  date: string;
  revenue?: number;
  status: DriverHomeRecentDayStatus;
}

export interface DriverHomeDashboardData {
  driverName: string;
  isOnLine: boolean;
  statusLabel: string;
  statusTone: "default" | "accent";
  shiftHint: string;
  todayRevenue: {
    amount?: number;
    updatedAt?: string;
    canEdit: boolean;
  };
  car: {
    brand: string;
    model: string;
    plate: string;
    status: DriverHomeCarStatus;
    lastMaintenanceDate: string;
    warning?: string;
  };
  kpiCards: KpiCardProps[];
  revenueByDayData: VerticalBarChartItem[];
  recentWorkDays: DriverHomeRecentDay[];
  fleet:
    | {
        type: "member";
        name: string;
        joinedAt: string;
        status: string;
      }
    | {
        type: "invited";
        name: string;
      };
}

const moneyFormatter = new Intl.NumberFormat("ru-RU");

const formatChartDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${day}.${month}`;
};

const formatFullDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getRevenueSeries = (avgPerDay: number, today: Date) => {
  const coefficients = [0.86, 1.04, 0.97, 1.12, 0.91, 1.08, 0.94];

  return coefficients.map((coefficient, index) => {
    const date = new Date(today);

    date.setDate(today.getDate() - (coefficients.length - index - 1));

    return {
      date: formatChartDate(date),
      value: Math.round(avgPerDay * coefficient),
    };
  });
};

const getRecentWorkDays = (
  series: VerticalBarChartItem[],
  today: Date,
  todayRevenue?: number,
) => {
  return Array.from({ length: 5 }).map((_, index) => {
    const date = new Date(today);

    date.setDate(today.getDate() - index);

    if (index === 0) {
      if (todayRevenue == null) {
        return {
          date: formatFullDate(date),
          status: "missing" as const,
        };
      }

      return {
        date: formatFullDate(date),
        revenue: todayRevenue,
        status: "filled" as const,
      };
    }

    const seriesItem = series[series.length - 1 - index];

    return {
      date: formatFullDate(date),
      revenue: seriesItem?.value,
      status: "filled" as const,
    };
  });
};

const buildKpiCards = ({
  revenueWeek,
  monthRevenue,
  avgPerDay,
  workdays,
  lastRevenue,
  lastRevenueDate,
}: {
  revenueWeek: number;
  monthRevenue: number;
  avgPerDay: number;
  workdays: number;
  lastRevenue: number;
  lastRevenueDate: string;
}): KpiCardProps[] => {
  return [
    {
      label: "Выручка за 7 дней",
      value: `${moneyFormatter.format(revenueWeek)} ₽`,
      meta: "Последние 7 дней",
      valueClassName: "text-text-primary",
      metaClassName: "text-accent-primary",
      className: "min-w-0",
    },
    {
      label: "Выручка за месяц",
      value: `${moneyFormatter.format(monthRevenue)} ₽`,
      meta: "Текущий месяц",
      valueClassName: "text-text-primary",
      metaClassName: "text-accent-primary",
      className: "min-w-0",
    },
    {
      label: "Средняя выручка / день",
      value: `${moneyFormatter.format(avgPerDay)} ₽`,
      meta: "По рабочим дням",
      valueClassName: "text-text-primary",
      metaClassName: "text-accent-primary",
      className: "min-w-0",
    },
    {
      label: "Рабочих дней в месяце",
      value: String(workdays),
      meta: "С начала месяца",
      valueClassName: "text-text-primary",
      metaClassName: "text-accent-primary",
      className: "min-w-0",
    },
    {
      label: "Последняя выручка",
      value: `${moneyFormatter.format(lastRevenue)} ₽`,
      meta: lastRevenueDate,
      valueClassName: "text-text-primary",
      metaClassName: "text-accent-primary",
      className: "min-w-0",
    },
  ];
};

export const buildDriverHomeDashboardData = (
  fullName: string,
): DriverHomeDashboardData => {
  const driver =
    driverMockData.find((item) => item.driver === fullName) ?? driverMockData[0];
  const today = new Date();
  const revenueByDayData = getRevenueSeries(driver.avgPerDay, today);
  const todayRevenue = driver.status === "active" ? undefined : Math.round(driver.avgPerDay * 0.93);
  const recentWorkDays = getRecentWorkDays(revenueByDayData, today, todayRevenue);
  const revenueWeek = revenueByDayData.reduce((total, item) => total + item.value, 0);
  const lastFilledDay = recentWorkDays.find((day) => day.status === "filled");
  const lastRevenue = lastFilledDay?.revenue ?? Math.round(driver.avgPerDay * 0.88);
  const lastRevenueDate = lastFilledDay?.date ?? formatFullDate(today);
  const carStatus = driver.status === "risk" ? "risk" : "ok";

  return {
    driverName: fullName || driver.driver,
    isOnLine: driver.status === "active",
    statusLabel: driver.status === "active" ? "На линии" : "Не на линии",
    statusTone: driver.status === "active" ? "default" : "accent",
    shiftHint:
      driver.status === "active"
        ? "Вы на линии. Сегодняшняя выручка обновляется в течение смены."
        : "Смена не начата. Перед выходом на линию проверьте автомобиль и внесение выручки.",
    todayRevenue: {
      amount: todayRevenue,
      updatedAt: todayRevenue == null ? undefined : formatTime(today),
      canEdit: true,
    },
    car: {
      brand: "Kia",
      model: "Rio X",
      plate: driver.car,
      status: carStatus,
      lastMaintenanceDate: "28.05.2026",
      warning:
        carStatus === "risk"
          ? "Автомобиль требует внимания: проверьте отметки по техническому состоянию до выхода на линию."
          : undefined,
    },
    kpiCards: buildKpiCards({
      revenueWeek,
      monthRevenue: driver.revenue,
      avgPerDay: driver.avgPerDay,
      workdays: driver.workdays,
      lastRevenue,
      lastRevenueDate,
    }),
    revenueByDayData,
    recentWorkDays,
    fleet: {
      type: "member",
      name: "Северный парк",
      joinedAt: "14.02.2026",
      status: "Активен",
    },
  };
};
