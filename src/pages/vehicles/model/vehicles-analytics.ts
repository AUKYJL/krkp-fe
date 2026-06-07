import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import type { DateRangePickerValue } from "@/features/date-range-picker";
import { getApiErrorMessage } from "@/shared/api/auth";
import { fetchClient } from "@/shared/api/apiInstance";
import type { components } from "@/shared/api/apiTypes";
import { formatDate } from "@/shared/lib/format-date";

export type AnalyticsPeriodState = {
  from?: string;
  to?: string;
};

type TaxiParkAnalyticsResponse =
  components["schemas"]["GetTaxiParksAnalyticsResponseDto"];
type CarAnalyticsResponse = components["schemas"]["GetCarAnalyticsResponseDto"];
type CarBrandsAnalyticsResponse =
  components["schemas"]["GetCarBrandsAnalyticsResponseDto"];
type CarBrandAnalyticsItem =
  components["schemas"]["CarBrandAnalyticsItemDto"];
type MostProfitableCarBrandAnalyticsItem =
  components["schemas"]["MostProfitableCarBrandAnalyticsItemDto"];
type MostDowntimeCarBrandAnalyticsItem =
  components["schemas"]["MostDowntimeCarBrandAnalyticsItemDto"];
type CarState = components["schemas"]["CarAnalyticsCarDto"]["state"];

export type DirectorVehicleListItem = {
  carId: string;
  taxiParkId: string;
  plateNumber: string;
  firm: string;
  model: string;
  state: CarState;
  taxiParkName: string;
  assignedDriverName?: string;
};

export type DirectorVehiclesCatalog = {
  taxiParks: Array<{
    taxiParkId: string;
    taxiParkName: string;
  }>;
  vehicles: DirectorVehicleListItem[];
  summary: {
    total: number;
    working: number;
    repair: number;
    emergency: number;
    withAssignedDriver: number;
    withoutAssignedDriver: number;
  };
};

export type VehicleAnalyticsDetail = {
  period: CarAnalyticsResponse["period"];
  car: CarAnalyticsResponse["car"];
  summary: CarAnalyticsResponse["summary"];
  comparison: CarAnalyticsResponse["comparison"];
  brandAnalytics: CarAnalyticsResponse["brandAnalytics"];
  charts: CarAnalyticsResponse["charts"];
  workDays: CarAnalyticsResponse["workDays"];
};

export type DriverAssignedVehicleContext = {
  carId?: string;
  taxiParkId?: string;
  driverName?: string;
};

type VehicleRecord = Record<string, unknown>;

const DEFAULT_PERIOD_DAYS = 30;

const vehicleQueryKeys = {
  directorCatalog: ["vehicles", "director-catalog"] as const,
  carBrandsAnalytics: (
    period: AnalyticsPeriodState,
    taxiParkId: string,
    taxiParkIds: string[],
  ) =>
    [
      "car-brands-analytics",
      {
        from: period.from,
        to: period.to,
        taxiParkId,
        taxiParkIds,
      },
    ] as const,
  vehicleAnalytics: (
    taxiParkId: string,
    carId: string,
    period: AnalyticsPeriodState,
  ) => ["vehicles", "analytics", taxiParkId, carId, period.from, period.to] as const,
  driverAssignedVehicle: ["vehicles", "driver-assigned-car"] as const,
};

const isRecord = (value: unknown): value is VehicleRecord => {
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

const pickRecord = (value: unknown, paths: string[]) => {
  return pickFirst(value, paths, isRecord);
};

const pickArray = (value: unknown, paths: string[]) => {
  return pickFirst(
    value,
    paths,
    (candidate): candidate is unknown[] => Array.isArray(candidate),
  );
};

const isCarState = (value: unknown): value is CarState => {
  return value === "WORKING" || value === "REPAIR" || value === "EMERGENCY";
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

const collectNestedRecords = (
  value: unknown,
  maxDepth = 4,
  seen = new WeakSet<object>(),
): VehicleRecord[] => {
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

const extractCarsArray = (value: unknown) => {
  if (Array.isArray(value)) {
    return value;
  }

  return (
    pickArray(value, [
      "items",
      "cars",
      "data",
      "results",
      "rows",
      "payload",
      "payload.items",
      "payload.cars",
      "payload.data",
    ]) ?? []
  );
};

const normalizeDirectorVehicle = ({
  item,
  taxiParkId,
  taxiParkName,
}: {
  item: unknown;
  taxiParkId: string;
  taxiParkName: string;
}): DirectorVehicleListItem | null => {
  const carId =
    pickString(item, ["id", "carId", "car.id", "car.carId"]) ??
    findFirstStringByKeys(item, ["carId"], 2);

  if (!carId) {
    return null;
  }

  const stateCandidate =
    pickFirst(item, ["state", "status", "car.state"], isCarState) ?? "WORKING";

  const driverSource =
    pickRecord(item, [
      "assignedDriver",
      "driver",
      "currentDriver",
      "assigned.driver",
      "driverProfile",
    ]) ?? item;

  return {
    carId,
    taxiParkId,
    taxiParkName,
    plateNumber:
      pickString(item, ["plateNumber", "plate", "number", "car.plateNumber"]) ??
      "—",
    firm:
      pickString(item, ["firm", "brand", "make", "car.firm", "car.brand"]) ??
      "—",
    model: pickString(item, ["model", "car.model"]) ?? "—",
    state: stateCandidate,
    assignedDriverName: pickString(driverSource, [
      "fullName",
      "name",
      "driverName",
      "assignedDriverName",
    ]),
  };
};

const buildCatalogSummary = (vehicles: DirectorVehicleListItem[]) => {
  return vehicles.reduce<DirectorVehiclesCatalog["summary"]>(
    (summary, vehicle) => {
      const hasDriver = Boolean(vehicle.assignedDriverName);

      return {
        total: summary.total + 1,
        working: summary.working + (vehicle.state === "WORKING" ? 1 : 0),
        repair: summary.repair + (vehicle.state === "REPAIR" ? 1 : 0),
        emergency: summary.emergency + (vehicle.state === "EMERGENCY" ? 1 : 0),
        withAssignedDriver: summary.withAssignedDriver + (hasDriver ? 1 : 0),
        withoutAssignedDriver:
          summary.withoutAssignedDriver + (hasDriver ? 0 : 1),
      };
    },
    {
      total: 0,
      working: 0,
      repair: 0,
      emergency: 0,
      withAssignedDriver: 0,
      withoutAssignedDriver: 0,
    },
  );
};

const normalizeDriverAssignedVehicleContext = (
  driverProfile: unknown,
  currentTaxiPark?: unknown,
): DriverAssignedVehicleContext => {
  const carId =
    pickString(driverProfile, [
      "carId",
      "assignedCarId",
      "currentCarId",
      "car.id",
      "car.carId",
      "vehicle.id",
      "vehicle.carId",
      "assignedCar.id",
      "assignedCar.carId",
      "assignedVehicle.id",
      "assignedVehicle.carId",
      "currentCar.id",
      "currentCar.carId",
    ]) ??
    findFirstStringByKeys(driverProfile, ["carId", "assignedCarId"], 5);

  const taxiParkId =
    pickString(driverProfile, [
      "taxiParkId",
      "parkId",
      "fleetId",
      "taxiPark.id",
      "park.id",
      "currentTaxiPark.id",
      "fleet.id",
      "car.taxiParkId",
      "car.taxiPark.id",
      "vehicle.taxiParkId",
      "vehicle.taxiPark.id",
      "assignedCar.taxiParkId",
      "assignedCar.taxiPark.id",
    ]) ??
    pickString(currentTaxiPark, [
      "id",
      "taxiParkId",
      "parkId",
      "taxiPark.id",
      "park.id",
      "currentTaxiPark.id",
      "fleet.id",
    ]) ??
    findFirstStringByKeys(driverProfile, ["taxiParkId", "parkId"], 5) ??
    findFirstStringByKeys(currentTaxiPark, ["taxiParkId", "parkId"], 4);

  return {
    carId,
    taxiParkId,
    driverName:
      pickString(driverProfile, ["fullName", "name", "driver.fullName"]) ??
      undefined,
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

const getDirectorVehiclesCatalog = async (): Promise<DirectorVehiclesCatalog> => {
  const analytics = await getResponseData(
    fetchClient.GET("/api/taxi-parks/analytics"),
  );
  const typedAnalytics = analytics as TaxiParkAnalyticsResponse;

  const taxiParks = typedAnalytics.taxiParks.map((taxiPark) => ({
    taxiParkId: taxiPark.taxiParkId,
    taxiParkName: taxiPark.name,
  }));

  const carsByPark = await Promise.all(
    taxiParks.map(async (taxiPark) => {
      const data = await getOptionalResponseData(
        fetchClient.GET("/api/taxi-parks/{taxiParkId}/cars", {
          params: {
            path: { taxiParkId: taxiPark.taxiParkId },
          },
        }),
      );

      return extractCarsArray(data)
        .map((item) =>
          normalizeDirectorVehicle({
            item,
            taxiParkId: taxiPark.taxiParkId,
            taxiParkName: taxiPark.taxiParkName,
          }),
        )
        .filter((item): item is DirectorVehicleListItem => item != null);
    }),
  );

  const vehicles = carsByPark.flat().sort((left, right) =>
    `${left.firm} ${left.model}`.localeCompare(`${right.firm} ${right.model}`),
  );

  return {
    taxiParks,
    vehicles,
    summary: buildCatalogSummary(vehicles),
  };
};

const getVehicleAnalytics = async ({
  taxiParkId,
  carId,
  period,
}: {
  taxiParkId: string;
  carId: string;
  period: AnalyticsPeriodState;
}) => {
  const data = await getResponseData(
    fetchClient.GET("/api/taxi-parks/{taxiParkId}/cars/{carId}/analytics", {
      params: {
        path: {
          taxiParkId,
          carId,
        },
        query: {
          from: period.from,
          to: period.to,
        },
      },
    }),
  );

  return data as VehicleAnalyticsDetail;
};

export const getCarBrandsAnalytics = async ({
  from,
  to,
  taxiParkId,
}: {
  from?: string;
  to?: string;
  taxiParkId?: string;
}): Promise<CarBrandsAnalyticsResponse> => {
  if (taxiParkId && taxiParkId !== "all") {
    const data = await getResponseData(
      fetchClient.GET("/api/taxi-parks/{taxiParkId}/cars/brands/analytics", {
        params: {
          path: { taxiParkId },
          query: {
            from,
            to,
          },
        },
      }),
    );

    return data as CarBrandsAnalyticsResponse;
  }

  const analytics = await getResponseData(
    fetchClient.GET("/api/taxi-parks/analytics"),
  );
  const typedAnalytics = analytics as TaxiParkAnalyticsResponse;

  const parkResponses: CarBrandsAnalyticsResponse[] = await Promise.all(
    typedAnalytics.taxiParks.map((taxiPark) =>
      getCarBrandsAnalytics({
        from,
        to,
        taxiParkId: taxiPark.taxiParkId,
      }),
    ),
  );

  return aggregateCarBrandsAnalytics({
    responses: parkResponses,
    from,
    to,
  });
};

const aggregateCarBrandsAnalytics = ({
  responses,
  from,
  to,
}: {
  responses: CarBrandsAnalyticsResponse[];
  from?: string;
  to?: string;
}): CarBrandsAnalyticsResponse => {
  const brandMap = new Map<
    string,
    Omit<CarBrandAnalyticsItem, "revenueRank" | "downtimeRank">
  >();

  for (const response of responses) {
    for (const brand of response.brands) {
      const current = brandMap.get(brand.firm);

      if (current) {
        current.carsCount += brand.carsCount;
        current.totalRevenue += brand.totalRevenue;
        current.onlineDaysCount += brand.onlineDaysCount;
        current.downtimeDaysCount += brand.downtimeDaysCount;
        continue;
      }

      brandMap.set(brand.firm, {
        firm: brand.firm,
        carsCount: brand.carsCount,
        totalRevenue: brand.totalRevenue,
        averageRevenuePerCar: 0,
        averageRevenuePerOnlineDay: 0,
        onlineDaysCount: brand.onlineDaysCount,
        downtimeDaysCount: brand.downtimeDaysCount,
        utilizationRate: 0,
        downtimeRate: 0,
      });
    }
  }

  const aggregatedBrandsBase = Array.from(brandMap.values()).map((brand) => {
    const totalTrackedDays = brand.onlineDaysCount + brand.downtimeDaysCount;

    return {
      ...brand,
      averageRevenuePerCar:
        brand.carsCount > 0 ? brand.totalRevenue / brand.carsCount : 0,
      averageRevenuePerOnlineDay:
        brand.onlineDaysCount > 0 ? brand.totalRevenue / brand.onlineDaysCount : 0,
      utilizationRate:
        totalTrackedDays > 0
          ? (brand.onlineDaysCount / totalTrackedDays) * 100
          : 0,
      downtimeRate:
        totalTrackedDays > 0
          ? (brand.downtimeDaysCount / totalTrackedDays) * 100
          : 0,
    };
  });

  const revenueSorted = [...aggregatedBrandsBase].sort((left, right) => {
    if (right.totalRevenue !== left.totalRevenue) {
      return right.totalRevenue - left.totalRevenue;
    }

    return left.firm.localeCompare(right.firm, "ru");
  });
  const downtimeSorted = [...aggregatedBrandsBase].sort((left, right) => {
    if (right.downtimeDaysCount !== left.downtimeDaysCount) {
      return right.downtimeDaysCount - left.downtimeDaysCount;
    }

    return left.firm.localeCompare(right.firm, "ru");
  });

  const revenueRankMap = new Map(
    revenueSorted.map((brand, index) => [brand.firm, index + 1]),
  );
  const downtimeRankMap = new Map(
    downtimeSorted.map((brand, index) => [brand.firm, index + 1]),
  );

  const brands = revenueSorted.map<CarBrandAnalyticsItem>((brand) => ({
    ...brand,
    revenueRank: revenueRankMap.get(brand.firm) ?? 0,
    downtimeRank: downtimeRankMap.get(brand.firm) ?? 0,
  }));

  const mostProfitableBrands = revenueSorted
    .slice(0, 5)
    .map<MostProfitableCarBrandAnalyticsItem>((brand) => ({
      firm: brand.firm,
      carsCount: brand.carsCount,
      totalRevenue: brand.totalRevenue,
      averageRevenuePerCar: brand.averageRevenuePerCar,
      averageRevenuePerOnlineDay: brand.averageRevenuePerOnlineDay,
      onlineDaysCount: brand.onlineDaysCount,
      downtimeDaysCount: brand.downtimeDaysCount,
      utilizationRate: brand.utilizationRate,
      revenueRank: revenueRankMap.get(brand.firm) ?? 0,
    }));

  const mostDowntimeBrands = downtimeSorted
    .slice(0, 5)
    .map<MostDowntimeCarBrandAnalyticsItem>((brand) => ({
      firm: brand.firm,
      carsCount: brand.carsCount,
      totalRevenue: brand.totalRevenue,
      onlineDaysCount: brand.onlineDaysCount,
      downtimeDaysCount: brand.downtimeDaysCount,
      downtimeRate: brand.downtimeRate,
      utilizationRate: brand.utilizationRate,
      downtimeRank: downtimeRankMap.get(brand.firm) ?? 0,
    }));

  const carsCount = brands.reduce((sum, brand) => sum + brand.carsCount, 0);
  const totalRevenue = brands.reduce((sum, brand) => sum + brand.totalRevenue, 0);
  const totalDowntimeDaysCount = brands.reduce(
    (sum, brand) => sum + brand.downtimeDaysCount,
    0,
  );

  return {
    period: {
      from: from ?? responses[0]?.period.from ?? "",
      to: to ?? responses[0]?.period.to ?? "",
      daysCount: responses[0]?.period.daysCount ?? 0,
    },
    taxiPark: {
      taxiParkId: "all",
      name: "Все таксопарки",
    },
    summary: {
      brandsCount: brands.length,
      carsCount,
      totalRevenue,
      totalDowntimeDaysCount,
      bestRevenueBrand: revenueSorted[0]
        ? {
            firm: revenueSorted[0].firm,
            totalRevenue: revenueSorted[0].totalRevenue,
          }
        : null,
      mostDowntimeBrand: downtimeSorted[0]
        ? {
            firm: downtimeSorted[0].firm,
            downtimeDaysCount: downtimeSorted[0].downtimeDaysCount,
          }
        : null,
    },
    brands,
    mostProfitableBrands,
    mostDowntimeBrands,
  };
};

const getDriverAssignedVehicleContext = async () => {
  const driverProfile = await getOptionalResponseData(
    fetchClient.GET("/api/drivers/me"),
  );

  let currentTaxiPark: unknown;
  let resolved = normalizeDriverAssignedVehicleContext(driverProfile);

  if (!resolved.taxiParkId) {
    try {
      currentTaxiPark = await getOptionalResponseData(
        fetchClient.GET("/api/taxi-parks/me"),
      );
      resolved = normalizeDriverAssignedVehicleContext(
        driverProfile,
        currentTaxiPark,
      );
    } catch {
      return resolved;
    }
  }

  return resolved;
};

export const getVehicleStateMeta = (state: CarState) => {
  if (state === "WORKING") {
    return {
      label: "На линии",
      tone: "default" as const,
    };
  }

  if (state === "REPAIR") {
    return {
      label: "Ремонт",
      tone: "muted" as const,
    };
  }

  return {
    label: "Авария",
    tone: "accent" as const,
  };
};

export const isVehicleAnalyticsEmpty = (analytics?: VehicleAnalyticsDetail) => {
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

export const isNotFoundError = (error: unknown) => {
  if (!isRecord(error)) {
    return false;
  }

  return error.statusCode === 404;
};

export const useVehicleAnalyticsPeriod = () => {
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

export const useDirectorVehiclesCatalog = () => {
  const query = useQuery({
    queryKey: vehicleQueryKeys.directorCatalog,
    queryFn: getDirectorVehiclesCatalog,
  });

  return {
    ...query,
    errorMessage: getApiErrorMessage(query.error),
  };
};

export const useVehicleAnalyticsDetail = ({
  taxiParkId,
  carId,
  period,
  enabled = true,
}: {
  taxiParkId?: string;
  carId?: string;
  period: AnalyticsPeriodState;
  enabled?: boolean;
}) => {
  const query = useQuery({
    queryKey: vehicleQueryKeys.vehicleAnalytics(
      taxiParkId ?? "unknown",
      carId ?? "unknown",
      period,
    ),
    enabled: enabled && Boolean(taxiParkId) && Boolean(carId),
    queryFn: () =>
      getVehicleAnalytics({
        taxiParkId: taxiParkId ?? "",
        carId: carId ?? "",
        period,
      }),
  });

  return {
    ...query,
    errorMessage: getApiErrorMessage(query.error),
    notFound: isNotFoundError(query.error),
  };
};

export const useDriverAssignedVehicleContext = () => {
  const query = useQuery({
    queryKey: vehicleQueryKeys.driverAssignedVehicle,
    queryFn: getDriverAssignedVehicleContext,
    retry: false,
  });

  return {
    ...query,
    errorMessage: getApiErrorMessage(query.error),
  };
};

export const useCarBrandsAnalytics = ({
  from,
  to,
  taxiParkId,
  taxiParkIds = [],
}: {
  from?: string;
  to?: string;
  taxiParkId?: string;
  taxiParkIds?: string[];
}) => {
  const uniqueTaxiParkIds = Array.from(new Set(taxiParkIds));
  const resolvedTaxiParkId = taxiParkId ?? "all";
  const query = useQuery({
    queryKey: vehicleQueryKeys.carBrandsAnalytics(
      { from, to },
      resolvedTaxiParkId,
      uniqueTaxiParkIds,
    ),
    enabled:
      Boolean(from) &&
      Boolean(to) &&
      (resolvedTaxiParkId !== "all" || uniqueTaxiParkIds.length > 0),
    queryFn: () =>
      getCarBrandsAnalytics({
        from,
        to,
        taxiParkId: resolvedTaxiParkId,
      }),
    retry: false,
  });

  return {
    ...query,
    errorMessage: getApiErrorMessage(query.error),
  };
};
