import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import type { DateRangePickerValue } from "@/features/date-range-picker";
import { getApiErrorMessage } from "@/shared/api/auth";
import { fetchClient } from "@/shared/api/apiInstance";
import type { components } from "@/shared/api/apiTypes";
import { formatDate } from "@/shared/lib/format-date";
import { ROLES } from "@/shared/types";

export type AnalyticsPeriodState = {
  from?: string;
  to?: string;
};

type DriverAnalyticsResponse =
  components["schemas"]["GetDriverAnalyticsResponseDto"];
type DirectorOverviewResponse =
  components["schemas"]["GetTaxiParksAnalyticsResponseDto"];

export type DriverAnalyticsDetail = {
  period: DriverAnalyticsResponse["period"];
  driver: DriverAnalyticsResponse["driver"];
  summary: DriverAnalyticsResponse["summary"];
  scorecard: DriverAnalyticsResponse["scorecard"];
  rating: DriverAnalyticsResponse["rating"];
  comparison: DriverAnalyticsResponse["comparison"];
  charts: DriverAnalyticsResponse["charts"];
  workDays: DriverAnalyticsResponse["workDays"];
};

export type DriverSelfAnalyticsContext = {
  driverId?: string;
  taxiParkId?: string;
  taxiParkName?: string;
  driverName?: string;
};

export type DriverAnalyticsRouteContext = DriverSelfAnalyticsContext & {
  redirectDriverId?: string;
  shouldRedirect: boolean;
};

export type DirectorDriverListItem = {
  driverId: string;
  fullName: string;
  taxiParkId?: string;
  taxiParkName?: string;
  assignedCarPlateNumber?: string;
  assignedCarLabel?: string;
  experience?: number;
};

type DriverRecord = Record<string, unknown>;

const DEFAULT_PERIOD_DAYS = 30;

const driverQueryKeys = {
  selfContext: ["drivers", "analytics", "self-context"] as const,
  directorCatalog: ["drivers", "director-catalog"] as const,
  routeContext: (role: string, requestedDriverId: string) =>
    ["drivers", "analytics", "route-context", role, requestedDriverId] as const,
  analyticsDetail: (
    taxiParkId: string,
    driverId: string,
    period: AnalyticsPeriodState,
  ) =>
    [
      "drivers",
      "analytics",
      "detail",
      taxiParkId,
      driverId,
      period.from,
      period.to,
    ] as const,
};

const isRecord = (value: unknown): value is DriverRecord => {
  return typeof value === "object" && value !== null;
};

const getPathValue = (value: unknown, path: string) => {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (!isRecord(current)) {
      return undefined;
    }

    return current[segment];
  }, value);
};

const pickFirst = <T,>(
  value: unknown,
  paths: string[],
  matcher: (candidate: unknown) => candidate is T,
) => {
  for (const path of paths) {
    const candidate = getPathValue(value, path);

    if (matcher(candidate)) {
      return candidate;
    }
  }

  return undefined;
};

const pickString = (value: unknown, paths: string[]) => {
  return pickFirst(
    value,
    paths,
    (candidate): candidate is string =>
      typeof candidate === "string" && candidate.trim().length > 0,
  );
};

const pickNumber = (value: unknown, paths: string[]) => {
  return pickFirst(
    value,
    paths,
    (candidate): candidate is number =>
      typeof candidate === "number" && Number.isFinite(candidate),
  );
};

const pickArray = (value: unknown, paths: string[]) => {
  return pickFirst(
    value,
    paths,
    (candidate): candidate is unknown[] => Array.isArray(candidate),
  );
};

const collectNestedRecords = (
  value: unknown,
  maxDepth = 4,
  seen = new WeakSet<object>(),
): DriverRecord[] => {
  if (!isRecord(value) || maxDepth < 0) {
    return [];
  }

  if (seen.has(value)) {
    return [];
  }

  seen.add(value);

  const nested = Object.values(value).flatMap((candidate) => {
    if (Array.isArray(candidate)) {
      return candidate.flatMap((item) =>
        collectNestedRecords(item, maxDepth - 1, seen),
      );
    }

    return collectNestedRecords(candidate, maxDepth - 1, seen);
  });

  return [value, ...nested];
};

const findFirstStringByKeys = (
  value: unknown,
  keys: string[],
  maxDepth = 4,
) => {
  const loweredKeys = keys.map((key) => key.toLowerCase());

  for (const record of collectNestedRecords(value, maxDepth)) {
    for (const [key, candidate] of Object.entries(record)) {
      if (
        loweredKeys.includes(key.toLowerCase()) &&
        typeof candidate === "string" &&
        candidate.trim().length > 0
      ) {
        return candidate;
      }
    }
  }

  return undefined;
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

const getOptionalResponseData = async (
  request: Promise<{ data?: unknown; error?: unknown }>,
) => {
  const response = await request;

  if (response.error) {
    throw response.error;
  }

  return response.data;
};

const extractArray = (value: unknown) => {
  if (Array.isArray(value)) {
    return value;
  }

  return (
    pickArray(value, [
      "items",
      "drivers",
      "data",
      "results",
      "rows",
      "payload",
      "payload.items",
      "payload.drivers",
      "payload.data",
    ]) ?? []
  );
};

const normalizeDriverAnalyticsContext = (
  driverProfile: unknown,
  currentTaxiPark?: unknown,
): DriverSelfAnalyticsContext => {
  const driverId =
    pickString(driverProfile, [
      "id",
      "driverId",
      "driver.id",
      "profile.id",
      "profile.driverId",
      "user.id",
    ]) ?? findFirstStringByKeys(driverProfile, ["driverId"], 5);

  const taxiParkId =
    pickString(driverProfile, [
      "taxiParkId",
      "parkId",
      "fleetId",
      "taxiPark.id",
      "park.id",
      "currentTaxiPark.id",
      "assignedCar.taxiParkId",
      "assignedCar.taxiPark.id",
      "car.taxiParkId",
      "car.taxiPark.id",
    ]) ??
    pickString(currentTaxiPark, [
      "id",
      "taxiParkId",
      "parkId",
      "taxiPark.id",
      "park.id",
      "currentTaxiPark.id",
    ]) ??
    findFirstStringByKeys(driverProfile, ["taxiParkId", "parkId"], 5) ??
    findFirstStringByKeys(currentTaxiPark, ["taxiParkId", "parkId"], 4);

  const taxiParkName =
    pickString(driverProfile, [
      "taxiParkName",
      "parkName",
      "taxiPark.name",
      "park.name",
      "currentTaxiPark.name",
    ]) ??
    pickString(currentTaxiPark, [
      "name",
      "taxiParkName",
      "parkName",
      "taxiPark.name",
      "park.name",
    ]);

  return {
    driverId,
    taxiParkId,
    taxiParkName,
    driverName:
      pickString(driverProfile, [
        "fullName",
        "name",
        "driver.fullName",
        "profile.fullName",
      ]) ?? undefined,
  };
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
): AnalyticsPeriodState | undefined => {
  if (!value?.from || !value.to) {
    return undefined;
  }

  return {
    from: formatDate(value.from),
    to: formatDate(value.to),
  };
};

const getDriverAnalyticsDetail = async ({
  taxiParkId,
  driverId,
  period,
}: {
  taxiParkId: string;
  driverId: string;
  period: AnalyticsPeriodState;
}) => {
  const data = await getResponseData(
    fetchClient.GET("/api/taxi-parks/{taxiParkId}/drivers/{driverId}/analytics", {
      params: {
        path: {
          taxiParkId,
          driverId,
        },
        query: {
          from: period.from,
          to: period.to,
        },
      },
    }),
  );

  return data as DriverAnalyticsDetail;
};

const normalizeDirectorDriver = (value: unknown): DirectorDriverListItem | null => {
  const driverId =
    pickString(value, [
      "id",
      "driverId",
      "driver.id",
      "profile.id",
      "profile.driverId",
      "user.id",
    ]) ?? findFirstStringByKeys(value, ["driverId"], 5);

  const fullName =
    pickString(value, [
      "fullName",
      "name",
      "driver.fullName",
      "profile.fullName",
      "user.fullName",
    ]) ?? undefined;

  if (!driverId || !fullName) {
    return null;
  }

  const plateNumber =
    pickString(value, [
      "assignedCar.plateNumber",
      "car.plateNumber",
      "vehicle.plateNumber",
      "plateNumber",
      "car.number",
      "vehicle.number",
    ]) ?? undefined;
  const firm =
    pickString(value, [
      "assignedCar.firm",
      "car.firm",
      "vehicle.firm",
      "assignedCar.brand",
      "car.brand",
      "vehicle.brand",
    ]) ?? undefined;
  const model =
    pickString(value, ["assignedCar.model", "car.model", "vehicle.model"]) ??
    undefined;

  return {
    driverId,
    fullName,
    taxiParkId:
      pickString(value, [
        "taxiParkId",
        "parkId",
        "fleetId",
        "taxiPark.id",
        "park.id",
      ]) ?? findFirstStringByKeys(value, ["taxiParkId", "parkId"], 4),
    taxiParkName:
      pickString(value, [
        "taxiParkName",
        "parkName",
        "taxiPark.name",
        "park.name",
      ]) ?? undefined,
    assignedCarPlateNumber: plateNumber,
    assignedCarLabel:
      firm || model || plateNumber
        ? [firm, model, plateNumber].filter(Boolean).join(" · ")
        : undefined,
    experience:
      pickNumber(value, [
        "experience",
        "driver.experience",
        "profile.experience",
      ]) ?? undefined,
  };
};

const getDirectorDriversCatalog = async (): Promise<DirectorDriverListItem[]> => {
  const data = await getOptionalResponseData(fetchClient.GET("/api/drivers"));

  return extractArray(data)
    .map(normalizeDirectorDriver)
    .filter((item): item is DirectorDriverListItem => item != null)
    .sort((left, right) => left.fullName.localeCompare(right.fullName, "ru"));
};

const getDriverSelfContext = async (): Promise<DriverSelfAnalyticsContext> => {
  const driverProfile = await getOptionalResponseData(
    fetchClient.GET("/api/drivers/me"),
  );

  let currentTaxiPark: unknown;
  let resolved = normalizeDriverAnalyticsContext(driverProfile);

  if (!resolved.taxiParkId) {
    try {
      currentTaxiPark = await getOptionalResponseData(
        fetchClient.GET("/api/taxi-parks/me"),
      );
      resolved = normalizeDriverAnalyticsContext(driverProfile, currentTaxiPark);
    } catch {
      return resolved;
    }
  }

  return resolved;
};

const getDirectorDriverContext = async (
  driverId: string,
): Promise<DriverSelfAnalyticsContext> => {
  const driverProfile = await getOptionalResponseData(
    fetchClient.GET("/api/drivers/{id}", {
      params: {
        path: { id: driverId },
      },
    }),
  );

  return normalizeDriverAnalyticsContext(driverProfile);
};

export const isDriverAnalyticsNotFound = (error: unknown) => {
  if (!isRecord(error)) {
    return false;
  }

  return error.statusCode === 404;
};

export const isDriverAnalyticsEmpty = (analytics?: DriverAnalyticsDetail) => {
  if (!analytics) {
    return false;
  }

  return (
    analytics.charts.revenueByDay.length === 0 &&
    analytics.workDays.length === 0 &&
    analytics.summary.workDaysCount === 0 &&
    analytics.summary.onlineDaysCount === 0 &&
    analytics.summary.totalRevenue === 0
  );
};

export const useDriverAnalyticsPeriod = () => {
  const defaultRange = getDefaultAnalyticsRangeValue();
  const [range, setRange] = useState<DateRangePickerValue>(defaultRange);
  const [period, setPeriod] = useState<AnalyticsPeriodState>(() => ({
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

export const useDriverAnalyticsDetail = ({
  taxiParkId,
  driverId,
  period,
  enabled = true,
}: {
  taxiParkId?: string;
  driverId?: string;
  period: AnalyticsPeriodState;
  enabled?: boolean;
}) => {
  const query = useQuery({
    queryKey: driverQueryKeys.analyticsDetail(
      taxiParkId ?? "unknown",
      driverId ?? "unknown",
      period,
    ),
    enabled: enabled && Boolean(taxiParkId) && Boolean(driverId),
    queryFn: () =>
      getDriverAnalyticsDetail({
        taxiParkId: taxiParkId ?? "",
        driverId: driverId ?? "",
        period,
      }),
    retry: false,
  });

  return {
    ...query,
    errorMessage: getApiErrorMessage(query.error),
    notFound: isDriverAnalyticsNotFound(query.error),
  };
};

export const useDriverSelfAnalyticsContext = () => {
  const query = useQuery({
    queryKey: driverQueryKeys.selfContext,
    queryFn: getDriverSelfContext,
    retry: false,
  });

  return {
    ...query,
    errorMessage: getApiErrorMessage(query.error),
    notFound: isDriverAnalyticsNotFound(query.error),
  };
};

export const useDirectorDriversCatalog = () => {
  const query = useQuery({
    queryKey: driverQueryKeys.directorCatalog,
    queryFn: getDirectorDriversCatalog,
    retry: false,
  });

  return {
    ...query,
    errorMessage: getApiErrorMessage(query.error),
  };
};

export type DirectorDriverAnalyticsItem =
  DirectorOverviewResponse["topDrivers"][number];

export const useDriverAnalyticsRouteContext = ({
  requestedDriverId,
  role,
}: {
  requestedDriverId: string;
  role?: string;
}) => {
  const query = useQuery({
    queryKey: driverQueryKeys.routeContext(role ?? "unknown", requestedDriverId),
    enabled: Boolean(role),
    retry: false,
    queryFn: async (): Promise<DriverAnalyticsRouteContext> => {
      if (role === ROLES.DRIVER) {
        const selfContext = await getDriverSelfContext();

        return {
          ...selfContext,
          redirectDriverId:
            selfContext.driverId && selfContext.driverId !== requestedDriverId
              ? selfContext.driverId
              : undefined,
          shouldRedirect:
            Boolean(selfContext.driverId) &&
            selfContext.driverId !== requestedDriverId,
        };
      }

      const directorContext = await getDirectorDriverContext(requestedDriverId);

      return {
        ...directorContext,
        shouldRedirect: false,
      };
    },
  });

  return {
    ...query,
    errorMessage: getApiErrorMessage(query.error),
    notFound: isDriverAnalyticsNotFound(query.error),
  };
};
