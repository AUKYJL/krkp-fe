import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import type { DateRangePickerValue } from "@/features/date-range-picker";
import { getApiErrorMessage } from "@/shared/api/auth";
import { fetchClient } from "@/shared/api/apiInstance";
import type { components } from "@/shared/api/apiTypes";
import { formatDate } from "@/shared/lib/format-date";

import type {
  DirectorTaxiParkTableRow,
  TaxiParkHealthStatus,
} from "../consts/types";

type DirectorAnalyticsResponse =
  components["schemas"]["GetTaxiParksAnalyticsResponseDto"];
type TaxiParkAnalyticsResponse =
  components["schemas"]["GetTaxiParkAnalyticsResponseDto"];
type TaxiParkMetaResponse = {
  id?: string;
  name?: string;
  address?: string;
};

type DirectorAnalyticsItem =
  components["schemas"]["TaxiParkAnalyticsItemDto"];
type TopDriverAnalyticsItem =
  components["schemas"]["TopDriverAnalyticsItemDto"];
type TopCarAnalyticsItem = components["schemas"]["TopCarAnalyticsItemDto"];
type TopBrandAnalyticsItem =
  components["schemas"]["TopBrandAnalyticsItemDto"];
type ProblemTaxiParkAnalyticsItem =
  components["schemas"]["ProblemTaxiParkAnalyticsItemDto"];
type ProblemCarAnalyticsItem =
  components["schemas"]["ProblemCarAnalyticsItemDto"];
type TaxiParkTopDriver = components["schemas"]["TopDriverAnalyticsDto"];
type TaxiParkTopCar = components["schemas"]["TopCarAnalyticsDto"];
type TaxiParkTopBrand = components["schemas"]["TopBrandAnalyticsDto"];
type TaxiParkProblemCar = components["schemas"]["ProblemCarAnalyticsDto"];

export type AnalyticsPeriodState = {
  from?: string;
  to?: string;
};

export type DirectorOverviewAnalytics = {
  period: DirectorAnalyticsResponse["period"];
  summary: DirectorAnalyticsResponse["summary"];
  charts: {
    revenueByTaxiPark: Array<{
      taxiParkId: string;
      label: string;
      revenue: number;
    }>;
    revenueByDay: DirectorAnalyticsResponse["charts"]["revenueByDay"];
    downtimeByDay: DirectorAnalyticsResponse["charts"]["downtimeByDay"];
  };
  taxiParks: DirectorTaxiParkTableRow[];
  topDrivers: TopDriverAnalyticsItem[];
  topCars: TopCarAnalyticsItem[];
  topBrands: TopBrandAnalyticsItem[];
  problemTaxiParks: ProblemTaxiParkAnalyticsItem[];
  problemCars: ProblemCarAnalyticsItem[];
};

export type TaxiParkDetailAnalytics = {
  period: TaxiParkAnalyticsResponse["period"];
  header: {
    id: string;
    name: string;
    address?: string;
  };
  summary: TaxiParkAnalyticsResponse["summary"];
  charts: TaxiParkAnalyticsResponse["charts"];
  topDrivers: TaxiParkTopDriver[];
  topCars: TaxiParkTopCar[];
  topBrands: TaxiParkTopBrand[];
  problemCars: TaxiParkProblemCar[];
};

const DEFAULT_PERIOD_DAYS = 30;

const taxiparksAnalyticsQueryKeys = {
  directorOverview: (period: AnalyticsPeriodState) =>
    ["taxiparks", "director-overview", period.from, period.to] as const,
  taxiParkDetail: (taxiParkId: string, period: AnalyticsPeriodState) =>
    ["taxiparks", "detail", taxiParkId, period.from, period.to] as const,
  taxiParkMeta: (taxiParkId: string) =>
    ["taxiparks", "meta", taxiParkId] as const,
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const pickString = (value: unknown, paths: string[]) => {
  for (const path of paths) {
    let current: unknown = value;

    for (const segment of path.split(".")) {
      if (!isRecord(current)) {
        current = undefined;
        break;
      }

      current = current[segment];
    }

    if (typeof current === "string" && current.trim().length > 0) {
      return current;
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

const getHealthStatus = (item: DirectorAnalyticsItem): TaxiParkHealthStatus => {
  if (item.downtimeRate >= 25 || item.estimatedDowntimeLoss > 0) {
    return "attention";
  }

  return "stable";
};

const normalizeDirectorTaxiParkRow = (
  item: DirectorAnalyticsItem,
): DirectorTaxiParkTableRow => {
  return {
    taxiParkId: item.taxiParkId,
    name: item.name,
    address: item.address,
    driversCount: item.driversCount,
    activeDriversCount: item.activeDriversCount,
    carsCount: item.carsCount,
    totalRevenue: item.totalRevenue,
    averageRevenuePerDay: item.averageRevenuePerDay,
    averageRevenuePerActiveDriver: item.averageRevenuePerActiveDriver,
    averageRevenuePerCar: item.averageRevenuePerCar,
    onlineRate: item.onlineRate,
    downtimeRate: item.downtimeRate,
    estimatedDowntimeLoss: item.estimatedDowntimeLoss,
    healthStatus: getHealthStatus(item),
  };
};

const normalizeDirectorOverview = (
  response: DirectorAnalyticsResponse,
): DirectorOverviewAnalytics => {
  return {
    period: response.period,
    summary: response.summary,
    charts: {
      revenueByTaxiPark: response.charts.revenueByTaxiPark.map((item) => ({
        taxiParkId: item.taxiParkId,
        label: item.taxiParkName,
        revenue: item.revenue,
      })),
      revenueByDay: response.charts.revenueByDay,
      downtimeByDay: response.charts.downtimeByDay,
    },
    taxiParks: response.taxiParks.map(normalizeDirectorTaxiParkRow),
    topDrivers: response.topDrivers,
    topCars: response.topCars,
    topBrands: response.topBrands,
    problemTaxiParks: response.problemTaxiParks,
    problemCars: response.problemCars,
  };
};

const normalizeTaxiParkMeta = (
  taxiParkId: string,
  value: unknown,
): TaxiParkMetaResponse => {
  return {
    id:
      pickString(value, ["id", "taxiParkId", "taxiPark.id"]) ?? taxiParkId,
    name:
      pickString(value, ["name", "title", "taxiPark.name"]) ??
      `Таксопарк ${taxiParkId}`,
    address: pickString(value, ["address", "location", "taxiPark.address"]),
  };
};

const normalizeTaxiParkDetail = ({
  taxiParkId,
  analytics,
  meta,
}: {
  taxiParkId: string;
  analytics: TaxiParkAnalyticsResponse;
  meta?: TaxiParkMetaResponse;
}): TaxiParkDetailAnalytics => {
  return {
    period: analytics.period,
    header: {
      id: meta?.id ?? taxiParkId,
      name: meta?.name ?? `Таксопарк ${taxiParkId}`,
      address: meta?.address,
    },
    summary: analytics.summary,
    charts: analytics.charts,
    topDrivers: analytics.topDrivers,
    topCars: analytics.topCars,
    topBrands: analytics.topBrands,
    problemCars: analytics.problemCars,
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

const getDirectorOverviewAnalytics = async (period: AnalyticsPeriodState) => {
  const data = await getResponseData(
    fetchClient.GET("/api/taxi-parks/analytics", {
      params: {
        query: {
          from: period.from,
          to: period.to,
        },
      },
    }),
  );

  return normalizeDirectorOverview(data as DirectorAnalyticsResponse);
};

const getTaxiParkAnalytics = async ({
  taxiParkId,
  period,
}: {
  taxiParkId: string;
  period: AnalyticsPeriodState;
}) => {
  const data = await getResponseData(
    fetchClient.GET("/api/taxi-parks/{taxiParkId}/analytics", {
      params: {
        path: { taxiParkId },
        query: {
          from: period.from,
          to: period.to,
        },
      },
    }),
  );

  return data as TaxiParkAnalyticsResponse;
};

const getTaxiParkMeta = async (taxiParkId: string) => {
  const response = (await fetchClient.GET("/api/taxi-parks/{id}", {
    params: {
      path: { id: taxiParkId },
    },
  })) as {
    data?: unknown;
    error?: unknown;
  };

  if (response.error) {
    throw response.error;
  }

  if (!response.data) {
    return undefined;
  }

  return normalizeTaxiParkMeta(taxiParkId, response.data);
};

export const useAnalyticsPeriod = () => {
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

export const useDirectorOverviewAnalytics = (period: AnalyticsPeriodState) => {
  const query = useQuery({
    queryKey: taxiparksAnalyticsQueryKeys.directorOverview(period),
    queryFn: () => getDirectorOverviewAnalytics(period),
  });

  return {
    ...query,
    errorMessage: getApiErrorMessage(query.error),
  };
};

export const useTaxiParkDetailAnalytics = ({
  taxiParkId,
  period,
}: {
  taxiParkId: string;
  period: AnalyticsPeriodState;
}) => {
  const analyticsQuery = useQuery({
    queryKey: taxiparksAnalyticsQueryKeys.taxiParkDetail(taxiParkId, period),
    queryFn: () => getTaxiParkAnalytics({ taxiParkId, period }),
  });

  const metaQuery = useQuery({
    queryKey: taxiparksAnalyticsQueryKeys.taxiParkMeta(taxiParkId),
    queryFn: () => getTaxiParkMeta(taxiParkId),
    retry: false,
  });

  const data =
    analyticsQuery.data == null
      ? undefined
      : normalizeTaxiParkDetail({
          taxiParkId,
          analytics: analyticsQuery.data,
          meta: metaQuery.data,
        });

  return {
    data,
    isLoading: analyticsQuery.isLoading,
    isFetching: analyticsQuery.isFetching || metaQuery.isFetching,
    error: analyticsQuery.error,
    errorMessage: getApiErrorMessage(analyticsQuery.error),
    refetch: analyticsQuery.refetch,
    supplementalMetaError: metaQuery.error,
  };
};
