import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import type { DateRangePickerValue } from "@/features/date-range-picker";
import { clearAuthToken, getApiErrorMessage } from "@/shared/api/auth";
import { fetchClient } from "@/shared/api/apiInstance";
import type { components } from "@/shared/api/apiTypes";
import { formatDate } from "@/shared/lib/format-date";
import type { WorkDayStatus } from "@/shared/lib/work-day-status";

type DirectorDashboardResponse =
  components["schemas"]["GetDirectorDashboardResponseDto"];
type DriverDashboardResponse =
  components["schemas"]["GetDriverDashboardResponseDto"];
type TaxiParkAnalyticsItem =
  components["schemas"]["TaxiParkAnalyticsItemDto"];
type DriverAssignedCar = components["schemas"]["DriverAnalyticsAssignedCarDto"];
type DriverSelfState = {
  driverId?: string;
  fullName?: string;
  taxiParkId?: string;
  taxiParkName?: string;
  assignedCar?: DriverAssignedCar | null;
  currentWorkDayId?: string | null;
  activeWorkDayStatus?: WorkDayStatus | null;
  activeWorkDayRevenue?: number;
  activeWorkDayUpdatedAt?: string;
  hasActiveWorkDay: boolean;
  isOnLine: boolean;
};

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

export type DriverLiveWorkDayState = {
  driverId?: string;
  taxiParkId?: string;
  taxiParkName?: string;
  fullName?: string;
  assignedCar: DriverAssignedCar | null;
  workDayId: string | null;
  workDayStatus: WorkDayStatus | null;
  activeWorkDayRevenue?: number;
  activeWorkDayUpdatedAt?: string;
  isOnLine: boolean;
  hasActiveWorkDay: boolean;
};

const homeQueryKeys = {
  directorDashboard: (period: HomeAnalyticsPeriodState) =>
    ["home", "director-dashboard", period.from, period.to] as const,
  driverDashboard: (period: HomeAnalyticsPeriodState) =>
    ["home", "driver-dashboard", period.from, period.to] as const,
  driverLiveState: ["home", "driver-live-state"] as const,
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

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const pickString = (value: unknown, keys: string[]) => {
  if (!isRecord(value)) {
    return undefined;
  }

  for (const key of keys) {
    const candidate = value[key];

    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate;
    }
  }

  return undefined;
};

const pickNumber = (value: unknown, keys: string[]) => {
  if (!isRecord(value)) {
    return undefined;
  }

  for (const key of keys) {
    const candidate = value[key];

    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return candidate;
    }
  }

  return undefined;
};

const parseNumberish = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim();

  if (normalizedValue.length === 0) {
    return undefined;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

const pickNestedValue = (value: unknown, path: string[]) => {
  let current: unknown = value;

  for (const key of path) {
    if (!isRecord(current)) {
      return undefined;
    }

    current = current[key];
  }

  return current;
};

const normalizeDriverSelfState = (
  response: unknown,
): DriverSelfState => {
  const record = isRecord(response) ? response : undefined;
  const activeWorkDay = record && isRecord(record.activeWorkDay) ? record.activeWorkDay : undefined;
  const assignedCar =
    record && isRecord(record.assignedCar)
      ? (record.assignedCar as DriverAssignedCar)
      : null;
  const taxiPark = record && isRecord(record.taxiPark) ? record.taxiPark : undefined;
  const workDayId =
    pickString(response, [
      "workDayId",
      "currentWorkDayId",
      "activeWorkDayId",
      "workDay.id",
      "currentWorkDay.id",
    ]) ??
    pickString(activeWorkDay, ["workDayId", "id"]) ??
    pickString(pickNestedValue(response, ["workDay"]), ["id"]) ??
    null;
  const activeWorkDayStatus = pickString(activeWorkDay, ["status"]) as
    | WorkDayStatus
    | undefined;
  const activeWorkDayRevenue =
    parseNumberish(activeWorkDay?.revenue) ??
    pickNumber(response, ["activeWorkDayRevenue"]);
  const activeWorkDayUpdatedAt = pickString(activeWorkDay, ["updatedAt"]);
  const isOnLine = activeWorkDayStatus === "ACTIVE";

  return {
    driverId: pickString(response, ["driverId", "id"]),
    fullName: pickString(response, ["fullName", "driver.fullName"]),
    taxiParkId:
      pickString(response, ["taxiParkId", "taxiPark.id"]) ??
      pickString(taxiPark, ["id", "taxiParkId"]),
    taxiParkName:
      pickString(response, ["taxiParkName", "taxiPark.name"]) ??
      pickString(taxiPark, ["name"]),
    assignedCar,
    currentWorkDayId: workDayId,
    activeWorkDayRevenue,
    activeWorkDayUpdatedAt,
    activeWorkDayStatus,
    hasActiveWorkDay: Boolean(workDayId) || Boolean(activeWorkDay),
    isOnLine,
  };
};

const getDriverLiveState = async (): Promise<DriverLiveWorkDayState> => {
  const driverProfile = await getResponseData(
    fetchClient.GET("/api/drivers/me"),
  );
  const normalizedProfile = normalizeDriverSelfState(driverProfile);
  const workDayId = normalizedProfile.currentWorkDayId;

  return {
    driverId: normalizedProfile.driverId,
    taxiParkId: normalizedProfile.taxiParkId,
    taxiParkName: normalizedProfile.taxiParkName,
    fullName: normalizedProfile.fullName,
    assignedCar: normalizedProfile.assignedCar ?? null,
    workDayId: workDayId ?? null,
    workDayStatus: normalizedProfile.activeWorkDayStatus ?? null,
    activeWorkDayRevenue: normalizedProfile.activeWorkDayRevenue,
    activeWorkDayUpdatedAt: normalizedProfile.activeWorkDayUpdatedAt,
    isOnLine: normalizedProfile.isOnLine,
    hasActiveWorkDay: normalizedProfile.hasActiveWorkDay,
  };
};

const startWorkDay = async () => {
  await getResponseData(
    fetchClient.POST("/api/work-days", {
      body: {},
    }) as Promise<{ data?: unknown; error?: unknown }>,
  );
};

const updateWorkDayRevenue = async ({
  workDayId,
  revenue,
}: {
  workDayId: string;
  revenue: number;
}) => {
  await getResponseData(
    fetchClient.PATCH("/api/work-days/{id}", {
      params: {
        path: { id: workDayId },
      },
      body: { revenue },
    }) as Promise<{ data?: unknown; error?: unknown }>,
  );
};

const finishWorkDay = async (workDayId: string) => {
  await getResponseData(
    fetchClient.POST("/api/work-days/{id}/finish", {
      params: {
        path: { id: workDayId },
      },
    }) as Promise<{ data?: unknown; error?: unknown }>,
  );
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

export const useDriverLiveState = () => {
  const query = useQuery({
    queryKey: homeQueryKeys.driverLiveState,
    queryFn: getDriverLiveState,
    retry: false,
  });

  return {
    ...query,
    errorMessage: getApiErrorMessage(query.error),
  };
};

export const useDriverWorkDayActions = () => {
  const queryClient = useQueryClient();

  const startMutation = useMutation({
    mutationFn: startWorkDay,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: homeQueryKeys.driverLiveState,
      });
      await queryClient.invalidateQueries({
        queryKey: ["home", "driver-dashboard"],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateWorkDayRevenue,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: homeQueryKeys.driverLiveState,
      });
      await queryClient.invalidateQueries({
        queryKey: ["home", "driver-dashboard"],
      });
    },
  });

  const finishMutation = useMutation({
    mutationFn: finishWorkDay,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: homeQueryKeys.driverLiveState,
      });
      await queryClient.invalidateQueries({
        queryKey: ["home", "driver-dashboard"],
      });
    },
  });

  return {
    startWorkDay: startMutation.mutateAsync,
    updateWorkDayRevenue: updateMutation.mutateAsync,
    finishWorkDay: finishMutation.mutateAsync,
    isPending:
      startMutation.isPending ||
      updateMutation.isPending ||
      finishMutation.isPending,
    errorMessage:
      getApiErrorMessage(startMutation.error) ||
      getApiErrorMessage(updateMutation.error) ||
      getApiErrorMessage(finishMutation.error),
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
