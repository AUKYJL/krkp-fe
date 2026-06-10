import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { useDirectorOverviewAnalytics } from "@/pages/taxiparks/model/taxiparks-analytics";
import {
  AnalyticsStateCard,
  TaxiparksPeriodFilter,
} from "@/pages/taxiparks/ui";

import { clearAuthToken, useCurrentUserQuery } from "@/shared/api/auth";
import { ROLES } from "@/shared/types";
import { AppText } from "@/shared/ui/app-text";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Spinner } from "@/shared/ui/spinner";
import { cn } from "@/shared/utils";
import { can } from "@/shared/utils";

import {
  type DirectorDriverAnalyticsItem,
  type DirectorDriverListItem,
  useDirectorDriversCatalog,
  useDriverAnalyticsPeriod,
  useDriverSelfAnalyticsContext,
} from "./model";
import { DataTable } from "@/features/data-table";
import { KpiCard } from "@/features/kpi-card";
import { PageHeader } from "@/features/page-header/page-header";
import { ProgressCard } from "@/features/progress-card";
import { TAXIPARKS_SIDEBAR_NAV_BY_ID } from "@/features/taxiparks-sidebar";
import { TitledBlock } from "@/features/titled-block";

const currencyFormatter = new Intl.NumberFormat("ru-RU");
const percentFormatter = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

type DriverStatus = "active" | "risk";

type DirectorDriverRow = DirectorDriverListItem & {
  revenue?: number;
  averageRevenuePerOnlineDay?: number;
  onlineDaysCount?: number;
  downtimeDaysCount?: number;
  activityRate?: number;
  rank?: number;
  status: DriverStatus;
};

const formatCurrency = (value?: number) => {
  if (value == null) {
    return "—";
  }

  return `₽ ${currencyFormatter.format(value)}`;
};

const getDriverStatus = (row: {
  activityRate?: number;
  assignedCarLabel?: string;
}): DriverStatus => {
  if (row.activityRate != null) {
    return row.activityRate >= 60 ? "active" : "risk";
  }

  return row.assignedCarLabel ? "active" : "risk";
};

const buildDriverAnalyticsMap = (items: DirectorDriverAnalyticsItem[]) => {
  return new Map(
    items.map((item) => [
      item.driverId,
      {
        revenue: item.totalRevenue,
        averageRevenuePerOnlineDay: item.averageRevenuePerOnlineDay,
        onlineDaysCount: item.onlineDaysCount,
        downtimeDaysCount: item.downtimeDaysCount,
        activityRate: item.activityRate,
        rank: item.rank,
      },
    ]),
  );
};

const driverColumns: ColumnDef<DirectorDriverRow>[] = [
  {
    accessorKey: "fullName",
    header: "Водитель",
    cell: ({ row }) => (
      <div className="min-w-0">
        <AppText className="truncate text-sm font-semibold">
          {row.original.fullName}
        </AppText>
      </div>
    ),
  },
  {
    accessorKey: "taxiParkName",
    header: "Таксопарк",
    cell: ({ row }) => (
      <span className="text-text-primary text-sm font-medium">
        {row.original.taxiParkName ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "assignedCarLabel",
    header: "Авто",
    cell: ({ row }) => (
      <span className="text-text-primary text-sm font-medium tabular-nums">
        {row.original.assignedCarLabel ?? "Не назначен"}
      </span>
    ),
  },
  {
    accessorKey: "revenue",
    header: "Выручка",
    cell: ({ row }) => (
      <span className="text-accent-primary text-sm font-bold tabular-nums">
        {formatCurrency(row.original.revenue)}
      </span>
    ),
  },
  {
    accessorKey: "averageRevenuePerOnlineDay",
    header: "В среднем / рабочий день",
    cell: ({ row }) => (
      <span className="text-sm font-medium tabular-nums">
        {formatCurrency(row.original.averageRevenuePerOnlineDay)}
      </span>
    ),
  },
  {
    accessorKey: "onlineDaysCount",
    header: "Рабочих дней",
    cell: ({ row }) => (
      <span className="text-sm font-medium tabular-nums">
        {row.original.onlineDaysCount ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "downtimeDaysCount",
    header: "Простой",
    cell: ({ row }) => (
      <span className="text-sm font-medium tabular-nums">
        {row.original.downtimeDaysCount ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "activityRate",
    header: "Активность",
    cell: ({ row }) => (
      <span className="text-sm font-medium tabular-nums">
        {row.original.activityRate == null
          ? "—"
          : `${percentFormatter.format(row.original.activityRate)}%`}
      </span>
    ),
  },
  {
    accessorKey: "rank",
    header: "Ранг",
    cell: ({ row }) => (
      <span className="text-accent-primary text-sm font-semibold tabular-nums">
        {row.original.rank == null ? "—" : `#${row.original.rank}`}
      </span>
    ),
  },
];

const SummaryRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="bg-background-page flex items-center justify-between gap-4 rounded-[10px] px-4 py-3">
      <AppText className="text-text-primary text-sm font-medium">
        {label}
      </AppText>
      <AppText className="text-text-primary text-sm font-semibold tabular-nums">
        {value}
      </AppText>
    </div>
  );
};

const DriverSelfRedirect = () => {
  const navigate = useNavigate();
  const selfContextQuery = useDriverSelfAnalyticsContext();

  useEffect(() => {
    if (!selfContextQuery.data?.driverId) {
      return;
    }

    void navigate({
      to: "/drivers/$id",
      params: { id: selfContextQuery.data.driverId },
      replace: true,
    });
  }, [navigate, selfContextQuery.data?.driverId]);

  if (selfContextQuery.isLoading) {
    return (
      <AnalyticsStateCard
        title="Открываем вашу аналитику"
        message="Определяем профиль водителя и маршрут к вашей карточке."
        tone="loading"
      />
    );
  }

  if (selfContextQuery.error) {
    return (
      <AnalyticsStateCard
        title="Не удалось открыть аналитику водителя"
        message={selfContextQuery.errorMessage}
        tone="error"
        actionLabel="Повторить"
        onAction={() => {
          void selfContextQuery.refetch();
        }}
      />
    );
  }

  if (!selfContextQuery.data?.driverId) {
    return (
      <AnalyticsStateCard
        title="Профиль водителя не найден"
        message="Не удалось определить ваш driverId, поэтому список водителей для этой роли недоступен."
      />
    );
  }

  return (
    <AnalyticsStateCard
      title="Переходим к вашей аналитике"
      message="Маршрут обновляется."
      tone="loading"
    />
  );
};

const DirectorDriversPage = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { range, period, onRangeChange } = useDriverAnalyticsPeriod();
  const catalogQuery = useDirectorDriversCatalog();
  const overviewQuery = useDirectorOverviewAnalytics(period);

  const analyticsMap = buildDriverAnalyticsMap(
    overviewQuery.data?.topDrivers ?? [],
  );
  const driverRows = (catalogQuery.data ?? []).map<DirectorDriverRow>(
    (driver) => {
      const analytics = analyticsMap.get(driver.driverId);

      return {
        ...driver,
        ...analytics,
        status: getDriverStatus({
          activityRate: analytics?.activityRate,
          assignedCarLabel: driver.assignedCarLabel,
        }),
      };
    },
  );

  const query = search.trim().toLowerCase();
  const filteredRows =
    query.length === 0
      ? driverRows
      : driverRows.filter((row) => {
          return [
            row.fullName,
            row.taxiParkName ?? "",
            row.assignedCarLabel ?? "",
            row.status === "active" ? "активен" : "риск",
          ].some((value) => value.toLowerCase().includes(query));
        });

  const summary = overviewQuery.data?.summary;
  const topByRevenue = (overviewQuery.data?.topDrivers ?? []).slice(0, 3);
  const topByActivity = [...(overviewQuery.data?.topDrivers ?? [])]
    .sort((left, right) => right.activityRate - left.activityRate)
    .slice(0, 3);

  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader
        title={TAXIPARKS_SIDEBAR_NAV_BY_ID.drivers.label}
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: TAXIPARKS_SIDEBAR_NAV_BY_ID.drivers.label },
        ]}
        actions={
          <div className="flex flex-wrap items-center justify-end gap-3">
            <TaxiparksPeriodFilter value={range} onChange={onRangeChange} />

            <Button
              type="button"
              className="h-10 rounded-[12px] px-4"
              onClick={() => navigate({ to: "/drivers/add" })}
            >
              <Plus className="size-4" />
              Добавить водителя
            </Button>
          </div>
        }
      />

      {catalogQuery.isLoading ? (
        <AnalyticsStateCard
          title="Загружаем водителей"
          message="Получаем реестр водителей и аналитику по выбранному периоду."
          tone="loading"
        />
      ) : catalogQuery.error ? (
        <AnalyticsStateCard
          title="Не удалось загрузить водителей"
          message={catalogQuery.errorMessage}
          tone="error"
          actionLabel="Повторить"
          onAction={() => {
            void catalogQuery.refetch();
          }}
        />
      ) : (
        <>
          <section className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              <KpiCard
                label="Всего водителей"
                value={summary?.driversCount ?? catalogQuery.data?.length ?? 0}
                meta="в доступном реестре"
                valueClassName="text-text-primary"
                metaClassName="text-accent-primary"
                className="min-w-0"
              />
              <KpiCard
                label="Активных на линии"
                value={summary?.activeDriversCount ?? "—"}
                meta={
                  summary == null
                    ? "Общая аналитика недоступна"
                    : `${percentFormatter.format(summary.onlineRate)}% онлайн`
                }
                valueClassName="text-text-primary"
                metaClassName="text-accent-primary"
                className="min-w-0"
              />
              <KpiCard
                label="Средняя выручка водителя"
                value={formatCurrency(summary?.averageRevenuePerActiveDriver)}
                meta="за выбранный период"
                valueClassName="text-text-primary"
                metaClassName="text-accent-primary"
                className="min-w-0"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              <KpiCard
                label="Средняя выручка / день"
                value={formatCurrency(summary?.averageRevenuePerDay)}
                meta={`${summary?.workDaysCount ?? "—"} рабочих дней`}
                valueClassName="text-text-primary"
                metaClassName="text-accent-primary"
                className="min-w-0"
              />

              <KpiCard
                label="Доля простоев"
                value={
                  summary == null
                    ? "—"
                    : `${percentFormatter.format(summary.downtimeRate)}%`
                }
                meta={`${summary?.downtimeDaysCount ?? "—"} дней простоя`}
                valueClassName="text-text-primary"
                metaClassName="text-accent-primary"
                className="min-w-0"
              />
              <KpiCard
                label="Общая выручка водителей"
                value={formatCurrency(summary?.totalRevenue)}
                meta="за выбранный период"
                valueClassName="text-text-primary"
                metaClassName="text-accent-primary"
                className="min-w-0"
              />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <TitledBlock
              title="Водители"
              subtitle="Водители из ваших таксопарков"
              className="min-w-0"
            >
              <div className="relative mb-4 w-full max-w-sm">
                <Search className="text-text-secondary absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Поиск водителя или авто"
                  className="h-11 pl-9"
                />
              </div>

              {filteredRows.length > 0 ? (
                <DataTable
                  columns={driverColumns}
                  data={filteredRows}
                  initialPageSize={10}
                  onRowClick={(row) => {
                    navigate({
                      to: "/drivers/$id",
                      params: { id: row.driverId },
                    });
                  }}
                />
              ) : (
                <AnalyticsStateCard
                  title="Водители не найдены"
                  message="По текущему запросу API не вернул ни одной записи."
                />
              )}
            </TitledBlock>
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <TitledBlock
              title="Топ-3 водителей по выручке"
              subtitle="Лидеры выбранного периода"
              className="min-w-0"
              contentClassName="mt-2"
            >
              <div className="flex flex-col gap-3">
                {topByRevenue.length > 0 ? (
                  topByRevenue.map((item) => (
                    <ProgressCard
                      key={item.driverId}
                      title={`${item.rank}. ${item.fullName}`}
                      secondaryText={formatCurrency(item.totalRevenue)}
                      value={Math.max(
                        1,
                        Math.round(
                          (item.totalRevenue / topByRevenue[0].totalRevenue) *
                            100,
                        ),
                      )}
                    />
                  ))
                ) : (
                  <AnalyticsStateCard
                    title="Нет рейтинга по выручке"
                    message={
                      overviewQuery.error
                        ? overviewQuery.errorMessage
                        : "Сервис пока не вернул топ водителей за период."
                    }
                  />
                )}
              </div>
            </TitledBlock>

            <TitledBlock
              title="Топ-3 водителей по активности"
              subtitle="Сравнение по доле активных дней"
              className="min-w-0"
              contentClassName="mt-2"
            >
              <div className="flex flex-col gap-3">
                {topByActivity.length > 0 ? (
                  topByActivity.map((item) => (
                    <ProgressCard
                      key={item.driverId}
                      title={`${item.rank}. ${item.fullName}`}
                      secondaryText={`${percentFormatter.format(item.activityRate)}%`}
                      value={Math.round(item.activityRate)}
                    />
                  ))
                ) : (
                  <AnalyticsStateCard
                    title="Нет рейтинга по активности"
                    message={
                      overviewQuery.error
                        ? overviewQuery.errorMessage
                        : "Сервис пока не вернул рейтинг активности за период."
                    }
                  />
                )}
              </div>
            </TitledBlock>

            <TitledBlock
              title="Потери от простоев"
              subtitle="Сводка по дням"
              topRightSlot={
                <AppText className="text-accent-primary text-3xl font-bold">
                  {formatCurrency(summary?.estimatedDowntimeLoss)}
                </AppText>
              }
              className="min-w-0"
              contentClassName="mt-2"
            >
              <div className="flex flex-col gap-2">
                <SummaryRow
                  label="Рабочих дней"
                  value={String(summary?.onlineDaysCount ?? "—")}
                />
                <SummaryRow
                  label="Дней простоя"
                  value={String(summary?.downtimeDaysCount ?? "—")}
                />
                <SummaryRow
                  label="Смен"
                  value={String(summary?.workDaysCount ?? "—")}
                />
              </div>
            </TitledBlock>

            <TitledBlock
              title="Средние выручки"
              subtitle="Данные по выбранному периоду"
              topRightSlot={
                <AppText className="text-accent-primary text-3xl font-bold">
                  {formatCurrency(summary?.totalRevenue)}
                </AppText>
              }
              className="min-w-0"
              contentClassName="mt-2"
            >
              <div className="flex flex-col gap-2">
                <SummaryRow
                  label="Средняя выручка / таксопарк"
                  value={formatCurrency(summary?.averageRevenuePerTaxiPark)}
                />
                <SummaryRow
                  label="Средняя выручка авто"
                  value={formatCurrency(summary?.averageRevenuePerCar)}
                />
                <SummaryRow
                  label="Средняя выручка / день"
                  value={formatCurrency(summary?.averageRevenuePerDay)}
                />
              </div>
            </TitledBlock>
          </section>
        </>
      )}
    </main>
  );
};

export const DriversPage = () => {
  const navigate = useNavigate();
  const { data: currentUser, error, isLoading } = useCurrentUserQuery();

  useEffect(() => {
    if (!error) {
      return;
    }

    clearAuthToken();
    void navigate({ to: "/auth/login", replace: true });
  }, [error, navigate]);

  if (isLoading) {
    return (
      <main className="bg-background-page flex min-h-full w-full items-center justify-center p-6">
        <Spinner className="min-h-40" />
      </main>
    );
  }

  if (!currentUser) {
    return null;
  }

  if (can(currentUser.role, [ROLES.DIRECTOR])) {
    return <DirectorDriversPage />;
  }

  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader
        title="Моя аналитика"
        description="Список водителей скрыт для роли водителя. Открываем вашу личную аналитику."
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Моя аналитика" },
        ]}
      />
      <DriverSelfRedirect />
    </main>
  );
};
