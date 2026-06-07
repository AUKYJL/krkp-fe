import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import type { DateRangePickerValue } from "@/features/date-range-picker";
import { clearAuthToken, getApiErrorMessage } from "@/shared/api/auth";
import { fetchClient } from "@/shared/api/apiInstance";
import type { components } from "@/shared/api/apiTypes";
import { formatDate } from "@/shared/lib/format-date";

type DirectorDashboardResponse =
  components["schemas"]["GetDirectorDashboardResponseDto"];
type DriverDashboardResponse =
  components["schemas"]["GetDriverDashboardResponseDto"];
type TaxiParkAnalyticsItem =
  components["schemas"]["TaxiParkAnalyticsItemDto"];
type DriverAssignedCar = components["schemas"]["DriverAnalyticsAssignedCarDto"];

const DEFAULT_PERIOD_DAYS = 30;

export type HomeAnalyticsPeriodState = {
  from?: string;
  to?: string;
};

export type DirectorHomeDashboardViewModel = {
  period: DirectorDashboardResponse["period"];
  summary: DirectorDashboardResponse["summary"];
  financialKpis: DirectorDashboardResponse["financialKpis"];
  downtimeKpis: DirectorDashboardResponse["downtimeKpis"];
  driverKpis: DirectorDashboardResponse["driverKpis"];
  carKpis: DirectorDashboardResponse["carKpis"];
  charts: DirectorDashboardResponse["charts"];
  taxiParks: Array<{
    taxiParkId: TaxiParkAnalyticsItem["taxiParkId"];
    name: TaxiParkAnalyticsItem["name"];
    driversCount: TaxiParkAnalyticsItem["driversCount"];
    activeDriversCount: TaxiParkAnalyticsItem["activeDriversCount"];
    carsCount: TaxiParkAnalyticsItem["carsCount"];
    totalRevenue: TaxiParkAnalyticsItem["totalRevenue"];
    onlineRate: TaxiParkAnalyticsItem["onlineRate"];
    downtimeRate: TaxiParkAnalyticsItem["downtimeRate"];
    estimatedDowntimeLoss: TaxiParkAnalyticsItem["estimatedDowntimeLoss"];
  }>;
};

export type DriverHomeDashboardViewModel = {
  period: DriverDashboardResponse["period"];
  driver: DriverDashboardResponse["driver"] & {
    assignedCar: DriverAssignedCar | null;
  };
  summary: DriverDashboardResponse["summary"];
  scorecard: DriverDashboardResponse["scorecard"];
  rating: DriverDashboardResponse["rating"];
  comparison: DriverDashboardResponse["comparison"];
  charts: DriverDashboardResponse["charts"];
  workDays: DriverDashboardResponse["workDays"];
};

const homeQueryKeys = {
  directorDashboard: (period: HomeAnalyticsPeriodState) =>
    ["home", "director-dashboard", period.from, period.to] as const,
  driverDashboard: (period: HomeAnalyticsPeriodState) =>
    ["home", "driver-dashboard", period.from, period.to] as const,
};

const getResponseData = async <T,>(
  request: Promise<{ data?: T; error?: unknown }>,
) => {
  const response = await request;

  if (response.error) {
    throw response.error;
  }

  return response.data;
};

const getDefaultAnalyticsRangeValue = () => {
  const today = new Date();
  const endDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const startDate = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate() - (DEFAULT_PERIOD_DAYS - 1),
  );

  return {
    from: startDate,
    to: endDate,
  } satisfies NonNullable<DateRangePickerValue>;
};

const toAnalyticsPeriod = (
  value: DateRangePickerValue,
): HomeAnalyticsPeriodState | undefined => {
  if (!value?.from || !value.to) {
    return undefined;
  }

  return {
    from: formatDate(value.from),
    to: formatDate(value.to),
  };
};

const normalizeDirectorHomeDashboard = (
  response: DirectorDashboardResponse,
): DirectorHomeDashboardViewModel => {
  return {
    period: response.period,
    summary: response.summary,
    financialKpis: response.financialKpis,
    downtimeKpis: response.downtimeKpis,
    driverKpis: response.driverKpis,
    carKpis: response.carKpis,
    charts: response.charts,
    taxiParks: response.taxiParks.map((taxiPark) => ({
      taxiParkId: taxiPark.taxiParkId,
      name: taxiPark.name,
      driversCount: taxiPark.driversCount,
      activeDriversCount: taxiPark.activeDriversCount,
      carsCount: taxiPark.carsCount,
      totalRevenue: taxiPark.totalRevenue,
      onlineRate: taxiPark.onlineRate,
      downtimeRate: taxiPark.downtimeRate,
      estimatedDowntimeLoss: taxiPark.estimatedDowntimeLoss,
    })),
  };
};

const getDirectorHomeDashboard = async (period: HomeAnalyticsPeriodState) => {
  const data = await getResponseData(
    fetchClient.GET("/api/analytics/director/dashboard", {
      params: {
        query: {
          from: period.from,
          to: period.to,
        },
      },
    }),
  );

  return normalizeDirectorHomeDashboard(data as DirectorDashboardResponse);
};

const getDriverHomeDashboard = async (period: HomeAnalyticsPeriodState) => {
  const data = await getResponseData(
    fetchClient.GET("/api/analytics/driver/dashboard", {
      params: {
        query: {
          from: period.from,
          to: period.to,
        },
      },
    }),
  );

  return data as DriverHomeDashboardViewModel;
};

const isUnauthorizedError = (error: unknown) => {
  return (
    error instanceof Error &&
    error.message.toLowerCase() === "unauthorized"
  );
};

export const useHomeAnalyticsPeriod = () => {
  const defaultRange = getDefaultAnalyticsRangeValue();
  const [range, setRange] = useState<DateRangePickerValue>(defaultRange);
  const [period, setPeriod] = useState<HomeAnalyticsPeriodState>(() => ({
    from: formatDate(defaultRange.from),
    to: formatDate(defaultRange.to),
  }));

  const handleRangeChange = (nextValue: DateRangePickerValue) => {
    setRange(nextValue);

    const nextPeriod = toAnalyticsPeriod(nextValue);

    if (nextPeriod?.from && nextPeriod.to) {
      setPeriod(nextPeriod);
    }
  };

  return {
    range,
    period,
    onRangeChange: handleRangeChange,
  };
};

export const useDirectorHomeDashboard = (period: HomeAnalyticsPeriodState) => {
  const query = useQuery({
    queryKey: homeQueryKeys.directorDashboard(period),
    queryFn: () => getDirectorHomeDashboard(period),
  });

  return {
    ...query,
    errorMessage: getApiErrorMessage(query.error),
  };
};

export const useDriverHomeDashboard = (period: HomeAnalyticsPeriodState) => {
  const query = useQuery({
    queryKey: homeQueryKeys.driverDashboard(period),
    queryFn: () => getDriverHomeDashboard(period),
  });

  return {
    ...query,
    errorMessage: getApiErrorMessage(query.error),
  };
};

export const useUnauthorizedHomeRedirect = (error: unknown) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isUnauthorizedError(error)) {
      return;
    }

    clearAuthToken();
    void navigate({ to: "/auth/login", replace: true });
  }, [error, navigate]);
};
