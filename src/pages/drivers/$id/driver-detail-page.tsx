import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowLeft,
  Info,
  PencilLine,
  UserPlus,
  UserRoundX,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";

import {
  type DriverAnalyticsDetail,
  isDriverAnalyticsEmpty,
  useDriverAnalyticsDetail,
  useDriverAnalyticsPeriod,
  useDriverAnalyticsRouteContext,
} from "@/pages/drivers/model";
import { DashboardEmptyState } from "@/pages/home/ui/driver-home-dashboard/dashboard-primitives";
import {
  AnalyticsStateCard,
  StatusBadge,
  TaxiparksPeriodFilter,
} from "@/pages/taxiparks/ui";

import { fetchClient } from "@/shared/api/apiInstance";
import { clearAuthToken, useCurrentUserQuery } from "@/shared/api/auth";
import { getWorkDayStatusConfig } from "@/shared/lib/work-day-status";
import { ROLES } from "@/shared/types";
import { AppText } from "@/shared/ui/app-text";
import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";
import { CardSurface } from "@/shared/ui/card-surface";
import { Spinner } from "@/shared/ui/spinner";
import { cn } from "@/shared/utils";
import { can } from "@/shared/utils";

import { getDriverMockById } from "../consts";

import { ConfirmDialog } from "@/features/confirm-dialog";
import { DataTable } from "@/features/data-table";
import { KpiCard } from "@/features/kpi-card";
import { PageHeader } from "@/features/page-header/page-header";
import { TAXIPARKS_SIDEBAR_NAV_BY_ID } from "@/features/taxiparks-sidebar";
import { TitledBlock } from "@/features/titled-block/titled-block";
import { VerticalBarChart } from "@/features/vertical-bar-chart";

const moneyFormatter = new Intl.NumberFormat("ru-RU");
const compactMoneyFormatter = new Intl.NumberFormat("ru-RU", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const percentFormatter = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export type DriverDetailMode = "internal" | "external";

interface DriverDetailPageProps {
  driverId: string;
  mode: DriverDetailMode;
}

type DetailChipProps = {
  children: ReactNode;
  tone?: "default" | "accent";
};

type ComparisonRowProps = {
  label: string;
  score: string;
  percent: number;
  caption: string;
  info: string;
};

type ScorecardMetricProps = {
  label: string;
  value: number;
};

type DriverWorkDayRow = {
  id: string;
  date: string;
  revenue: number;
  status: "ACTIVE" | "COMPLETED" | "DOWNTIME";
  carLabel: string;
};

type AvailableCarOption = {
  carId: string;
  label: string;
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

const getAvailableCars = async (
  taxiParkId: string,
): Promise<AvailableCarOption[]> => {
  const data = await getResponseData(
    fetchClient.GET("/api/taxi-parks/{taxiParkId}/cars/available", {
      params: { path: { taxiParkId } },
    }) as Promise<{ data?: unknown; error?: unknown }>,
  );

  const items = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.items)
      ? data.items
      : [];

  return items
    .map((item) => {
      const carId = pickString(item, ["carId", "id", "car.id"]) ?? undefined;

      if (!carId) {
        return null;
      }

      const label = [
        pickString(item, ["firm", "car.firm"]),
        pickString(item, ["model", "car.model"]),
        pickString(item, ["plateNumber", "car.plateNumber"]),
      ]
        .filter(Boolean)
        .join(" · ");

      return {
        carId,
        label: label.length > 0 ? label : carId,
      };
    })
    .filter((item): item is AvailableCarOption => item != null);
};

const assignCarToDriver = async ({
  driverId,
  carId,
}: {
  driverId: string;
  carId: string;
}) => {
  await getResponseData(
    fetchClient.POST("/api/drivers/{driverId}/assign-car", {
      params: { path: { driverId } },
      body: { carId },
    }) as Promise<{ data?: unknown; error?: unknown }>,
  );
};

const DetailChip = ({ children, tone = "default" }: DetailChipProps) => {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold",
        tone === "accent"
          ? "bg-accent-primary-soft text-accent-primary"
          : "bg-background-page text-text-primary",
      )}
    >
      {children}
    </span>
  );
};

const ComparisonRow = ({
  label,
  score,
  percent,
  caption,
}: ComparisonRowProps) => {
  const safePercent = Math.max(0, Math.min(100, percent));

  return (
    <div className="bg-background-page rounded-[12px] px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <AppText className="text-text-primary text-sm font-semibold">
              {label}
            </AppText>
          </div>
        </div>

        <AppText className="text-text-primary text-right text-sm font-bold tabular-nums">
          {score}
        </AppText>
      </div>

      <div className="bg-border-default/60 mt-3 h-2 w-full overflow-hidden rounded-full">
        <div
          className="bg-accent-primary h-full rounded-full transition-[width]"
          style={{ width: `${safePercent}%` }}
        />
      </div>

      <AppText className="text-text-secondary mt-2 text-xs font-medium">
        {caption}
      </AppText>
    </div>
  );
};

const ScorecardMetric = ({ label, value }: ScorecardMetricProps) => {
  return (
    <div className="bg-background-page flex items-center justify-between gap-3 rounded-[12px] px-4 py-3">
      <AppText className="text-text-primary text-sm font-semibold">
        {label}
      </AppText>
      <span className="bg-accent-primary-soft text-accent-primary inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold tabular-nums">
        {percentFormatter.format(value)}/100
      </span>
    </div>
  );
};

const ExternalDriverCard = ({
  driverName,
  driverInitials,
}: {
  driverName: string;
  driverInitials: string;
}) => {
  return (
    <section className="max-w-3xl">
      <CardSurface className="gap-6 rounded-[24px] p-6 md:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="bg-accent-primary-soft text-accent-primary flex size-20 shrink-0 items-center justify-center rounded-[24px] text-2xl font-bold">
            {driverInitials}
          </div>

          <div className="min-w-0">
            <AppText className="text-text-secondary text-xs font-semibold tracking-[0.12em] uppercase">
              Внешний профиль
            </AppText>
            <AppText className="text-text-primary mt-2 text-2xl font-bold">
              {driverName}
            </AppText>
          </div>
        </div>
      </CardSurface>
    </section>
  );
};

const formatCurrency = (value?: number) => {
  if (value == null) {
    return "—";
  }

  return `₽ ${moneyFormatter.format(value)}`;
};

const formatSignedCurrency = (value?: number) => {
  if (value == null) {
    return "—";
  }

  const sign = value > 0 ? "+" : "";

  return `${sign}₽ ${moneyFormatter.format(value)}`;
};

const formatCompactCurrency = (value: number) => {
  return compactMoneyFormatter.format(value);
};

const formatShortDate = (value: string) => {
  return new Date(value).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
  });
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const getRatioPercent = (value: number, baseline: number) => {
  if (baseline <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, (value / baseline) * 100));
};

const workDayColumns: ColumnDef<DriverWorkDayRow>[] = [
  {
    accessorKey: "date",
    header: "Дата",
    cell: ({ row }) => (
      <span className="tabular-nums">{formatShortDate(row.original.date)}</span>
    ),
  },
  {
    accessorKey: "revenue",
    header: "Выручка",
    cell: ({ row }) => (
      <span className="text-accent-primary font-semibold tabular-nums">
        {formatCurrency(row.original.revenue)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ row }) => (
      <StatusBadge {...getWorkDayStatusConfig(row.original.status)} />
    ),
  },
  {
    accessorKey: "carLabel",
    header: "Автомобиль",
  },
];

const DriverAnalyticsContent = ({
  analytics,
}: {
  analytics: DriverAnalyticsDetail;
}) => {
  const queryClient = useQueryClient();
  const availableCarsQuery = useQuery({
    queryKey: ["drivers", analytics.driver.driverId, "available-cars"] as const,
    queryFn: () => getAvailableCars(analytics.driver.taxiParkId),
    enabled: analytics.driver.assignedCar == null,
    retry: false,
  });
  const assignCarMutation = useMutation({
    mutationFn: assignCarToDriver,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["drivers", analytics.driver.driverId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["drivers", "analytics", analytics.driver.driverId],
        }),
        queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
      ]);
    },
  });
  const driverInitials = getInitials(analytics.driver.fullName);
  const assignedCarLabel = analytics.driver.assignedCar
    ? `${analytics.driver.assignedCar.firm} ${analytics.driver.assignedCar.model} · ${analytics.driver.assignedCar.plateNumber}`
    : "Автомобиль не назначен";
  const workDays: DriverWorkDayRow[] = analytics.workDays.map((workDay) => ({
    id: workDay.workDayId,
    date: workDay.date,
    revenue: workDay.revenue,
    status: workDay.status,
    carLabel: `${workDay.car.firm} ${workDay.car.model} · ${workDay.car.plateNumber}`,
  }));
  const comparisonRows = [
    {
      label: "Выручка за период",
      score: formatCurrency(analytics.summary.totalRevenue),
      percent: getRatioPercent(
        analytics.summary.totalRevenue,
        analytics.comparison.taxiParkAverageRevenuePerDriver,
      ),
      caption: `Среднее по парку: ${formatCurrency(analytics.comparison.taxiParkAverageRevenuePerDriver)}`,
    },
    {
      label: "Средняя / смена",
      score: formatCurrency(analytics.summary.averageRevenuePerShift),
      percent: getRatioPercent(
        analytics.summary.averageRevenuePerShift,
        analytics.comparison.taxiParkAverageRevenuePerShift,
      ),
      caption: `Среднее по парку: ${formatCurrency(analytics.comparison.taxiParkAverageRevenuePerShift)}`,
    },
    {
      label: "Активность",
      score: `${percentFormatter.format(analytics.summary.activityRate)}%`,
      percent: getRatioPercent(
        analytics.summary.activityRate,
        analytics.comparison.taxiParkAverageActivityRate,
      ),
      caption: `Среднее по парку: ${percentFormatter.format(analytics.comparison.taxiParkAverageActivityRate)}%`,
    },
  ];
  const canAssignCar =
    analytics.driver.assignedCar == null &&
    !availableCarsQuery.isLoading &&
    !availableCarsQuery.error &&
    (availableCarsQuery.data?.length ?? 0) > 0;

  return (
    <>
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <CardSurface className="gap-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="bg-accent-primary-soft text-accent-primary flex size-14 shrink-0 items-center justify-center rounded-[18px] text-xl font-bold">
                  {driverInitials}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <AppText className="text-text-primary text-xl font-bold">
                      {analytics.driver.fullName}
                    </AppText>
                    <StatusBadge
                      label={`#${analytics.rating.rank} из ${analytics.rating.driversCount}`}
                    />
                  </div>

                  <AppText className="text-text-secondary mt-1 text-sm font-medium">
                    {assignedCarLabel}
                  </AppText>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <DetailChip>
                      Таксопарк: {analytics.driver.taxiParkName}
                    </DetailChip>
                    <DetailChip>
                      {analytics.summary.workDaysCount} смен
                    </DetailChip>
                    <DetailChip>
                      {analytics.summary.onlineDaysCount} рабочих дней
                    </DetailChip>
                    <DetailChip tone="accent">
                      {percentFormatter.format(analytics.summary.activityRate)}%
                      активности
                    </DetailChip>
                  </div>
                </div>
              </div>
            </div>
          </CardSurface>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <KpiCard
              label="Выручка"
              value={formatCurrency(analytics.summary.totalRevenue)}
              meta={`Период ${analytics.period.from} - ${analytics.period.to}`}
              valueClassName="text-text-primary"
              metaClassName="text-accent-primary"
              className="min-w-0"
            />
            <KpiCard
              label="Средняя выручка за смену"
              value={formatCurrency(analytics.summary.averageRevenuePerShift)}
              meta="С учетом периода"
              valueClassName="text-text-primary"
              metaClassName="text-accent-primary"
              className="min-w-0"
            />
            <KpiCard
              label="Средняя / день"
              value={formatCurrency(analytics.summary.averageRevenuePerDay)}
              meta="С учетом периода"
              valueClassName="text-text-primary"
              metaClassName="text-accent-primary"
              className="min-w-0"
            />
            <KpiCard
              label="Разница с парком"
              value={formatSignedCurrency(
                analytics.summary.revenueDifferenceFromParkAverage,
              )}
              meta={`${analytics.summary.downtimeDaysCount} дн. простоя`}
              valueClassName="text-text-primary"
              metaClassName="text-accent-primary"
              className="min-w-0"
            />
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <TitledBlock
            title="Оценка водителя"
            subtitle="Реальные оценки из аналитики за выбранный период"
            className="h-full min-w-0 gap-3"
          >
            <div className="flex flex-col gap-2">
              <ScorecardMetric
                label="Эффективность"
                value={analytics.scorecard.driverEfficiency}
              />
              <ScorecardMetric
                label="Выручка"
                value={analytics.scorecard.revenueScore}
              />
              <ScorecardMetric
                label="Активность"
                value={analytics.scorecard.activityScore}
              />
              <ScorecardMetric
                label="Стабильность"
                value={analytics.scorecard.stabilityScore}
              />
            </div>
          </TitledBlock>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <TitledBlock
          title="Сравнение с парком"
          subtitle="Ключевые показатели относительно среднего по таксопарку"
          className="min-w-0 gap-3"
        >
          <div className="flex flex-col gap-2">
            {comparisonRows.map((item) => (
              <ComparisonRow
                key={item.label}
                label={item.label}
                score={item.score}
                percent={item.percent}
                caption={item.caption}
              />
            ))}
          </div>
        </TitledBlock>

        <TitledBlock
          title="Сравнение с парком"
          subtitle="Показатели водителя относительно средних значений"
          topRightSlot={
            <div className="text-right">
              <AppText className="text-accent-primary text-3xl font-bold tabular-nums">
                {analytics.scorecard.daysWithRevenueAboveAverage}
              </AppText>
              <AppText className="text-text-secondary mt-1 text-sm font-medium">
                дней выше среднего
              </AppText>
            </div>
          }
          className="min-w-0 gap-3"
        >
          <div className="grid grid-cols-1 gap-3">
            <KpiCard
              label="Максимум по парку"
              value={formatCurrency(analytics.scorecard.maxDriverRevenue)}
              meta="лучший водитель периода"
            />
            <KpiCard
              label="Отклонение по смене"
              value={formatSignedCurrency(
                analytics.comparison.shiftRevenueDifferenceFromParkAverage,
              )}
              meta={formatCurrency(
                analytics.comparison.taxiParkAverageRevenuePerShift,
              )}
            />
            <KpiCard
              label="Отклонение по активности"
              value={`${percentFormatter.format(analytics.comparison.activityDifferenceFromParkAverage)}%`}
              meta={`${percentFormatter.format(analytics.summary.downtimeRate)}% простоя`}
            />
          </div>
        </TitledBlock>
      </section>

      <TitledBlock
        title="Выручка по дням"
        subtitle={`Период ${analytics.period.from} - ${analytics.period.to}`}
      >
        {analytics.charts.revenueByDay.length > 0 ? (
          <VerticalBarChart
            data={analytics.charts.revenueByDay.map((point) => ({
              date: point.date,
              value: point.revenue,
            }))}
            valueLabel="Выручка, ₽"
            height={320}
            xTickFormatter={formatShortDate}
            yTickFormatter={(value) => formatCompactCurrency(value)}
            tooltipValueFormatter={(value) => formatCurrency(value)}
          />
        ) : (
          <AnalyticsStateCard
            title="Нет графика выручки"
            message="Сервис не вернул данные по выручке за выбранный период."
          />
        )}
      </TitledBlock>

      <TitledBlock
        title="История смен"
        subtitle="Выручка, статус выхода на линию и автомобиль по дням"
      >
        {workDays.length > 0 ? (
          <DataTable
            columns={workDayColumns}
            data={workDays}
            initialPageSize={10}
          />
        ) : (
          <AnalyticsStateCard
            title="История смен пуста"
            message="За выбранный период сервис не вернул записи по рабочим дням."
          />
        )}
      </TitledBlock>
    </>
  );
};

const ExternalDriverDetailContent = ({ driverId }: { driverId: string }) => {
  const navigate = useNavigate();
  const driver = getDriverMockById(driverId);
  const driverInitials = getInitials(driver.driver);

  return (
    <>
      <PageHeader
        title="Карточка водителя"
        description="Профиль приглашения без аналитики."
        breadcrumbs={[
          { label: "Главная", href: "/" },
          {
            label: TAXIPARKS_SIDEBAR_NAV_BY_ID.drivers.label,
            href: "/drivers",
          },
        ]}
        actions={
          <>
            <Button
              type="button"
              variant={BUTTON_VARIANTS_VARIABLES.secondary}
              onClick={() => navigate({ to: "/drivers" })}
            >
              <ArrowLeft className="size-4" />
              Назад
            </Button>

            <ConfirmDialog
              title={`Пригласить ${driver.driver} в таксопарк?`}
              description={
                <>
                  Мы отправим приглашение водителю {driver.driver}. В текущей
                  версии это только UI-flow без изменения mock-данных.
                </>
              }
              confirmText="Пригласить"
              cancelText="Отмена"
              confirmVariant={BUTTON_VARIANTS_VARIABLES.default}
              media={
                <div className="bg-accent-primary-soft text-accent-primary flex size-12 items-center justify-center rounded-full">
                  <UserPlus className="size-6" />
                </div>
              }
              onConfirm={() => {}}
              trigger={
                <Button type="button">
                  <UserPlus className="size-4" />
                  Пригласить в таксопарк
                </Button>
              }
            />
          </>
        }
      />

      <ExternalDriverCard
        driverName={driver.driver}
        driverInitials={driverInitials}
      />
    </>
  );
};

const InternalDriverDetailContent = ({ driverId }: { driverId: string }) => {
  const navigate = useNavigate();
  const { data: currentUser, error, isLoading } = useCurrentUserQuery();
  const { range, period, onRangeChange } = useDriverAnalyticsPeriod();

  useEffect(() => {
    if (!error) {
      return;
    }

    clearAuthToken();
    void navigate({ to: "/auth/login", replace: true });
  }, [error, navigate]);

  const contextQuery = useDriverAnalyticsRouteContext({
    requestedDriverId: driverId,
    role: currentUser?.role,
  });
  const analyticsQuery = useDriverAnalyticsDetail({
    taxiParkId: contextQuery.data?.taxiParkId,
    driverId: contextQuery.data?.driverId,
    period,
    enabled:
      Boolean(contextQuery.data?.taxiParkId) &&
      Boolean(contextQuery.data?.driverId) &&
      !contextQuery.data?.shouldRedirect,
  });

  useEffect(() => {
    if (
      !contextQuery.data?.shouldRedirect ||
      !contextQuery.data.redirectDriverId
    ) {
      return;
    }

    void navigate({
      to: "/drivers/$id",
      params: { id: contextQuery.data.redirectDriverId },
      replace: true,
    });
  }, [
    contextQuery.data?.redirectDriverId,
    contextQuery.data?.shouldRedirect,
    navigate,
  ]);

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

  const isDirector = can(currentUser.role, [ROLES.DIRECTOR]);
  const breadcrumbs = isDirector
    ? [
        { label: "Главная", href: "/" },
        { label: TAXIPARKS_SIDEBAR_NAV_BY_ID.drivers.label, href: "/drivers" },
      ]
    : [{ label: "Главная", href: "/" }, { label: "Моя аналитика" }];

  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader
        title="Карточка водителя"
        description={
          analyticsQuery.data
            ? `Аналитика водителя за период ${analyticsQuery.data.period.from} - ${analyticsQuery.data.period.to}.`
            : "Аналитика водителя по выручке, активности и истории смен."
        }
        breadcrumbs={breadcrumbs}
        actions={
          <>
            <TaxiparksPeriodFilter value={range} onChange={onRangeChange} />
            <Button
              type="button"
              variant={BUTTON_VARIANTS_VARIABLES.secondary}
              onClick={() =>
                navigate({
                  to: isDirector ? "/drivers" : "/",
                })
              }
            >
              <ArrowLeft className="size-4" />
              Назад
            </Button>

            {isDirector ? (
              <>
                <Button
                  type="button"
                  onClick={() =>
                    navigate({
                      to: "/drivers/$id/edit",
                      params: { id: driverId },
                    })
                  }
                >
                  <PencilLine className="size-4" />
                  Редактировать
                </Button>

                <ConfirmDialog
                  title={`Уволить водителя ${analyticsQuery.data?.driver.fullName ?? "?"}?`}
                  description="Действие пока остается UI-сценарием, но позволяет проверить destructive flow на карточке водителя."
                  confirmText="Уволить"
                  trigger={
                    <Button
                      type="button"
                      variant={BUTTON_VARIANTS_VARIABLES.destructive}
                    >
                      <UserRoundX className="size-4" />
                      Уволить
                    </Button>
                  }
                />
              </>
            ) : null}
          </>
        }
      />

      {contextQuery.isLoading ? (
        <AnalyticsStateCard
          title="Определяем доступ к аналитике"
          message="Проверяем профиль водителя и привязку к таксопарку."
          tone="loading"
        />
      ) : contextQuery.error ? (
        <AnalyticsStateCard
          title={
            contextQuery.notFound
              ? "Водитель недоступен"
              : "Не удалось определить контекст водителя"
          }
          message={
            contextQuery.notFound
              ? "Этот водитель не найден или недоступен для просмотра."
              : contextQuery.errorMessage
          }
          tone="error"
          actionLabel="Повторить"
          onAction={() => {
            void contextQuery.refetch();
          }}
        />
      ) : contextQuery.data?.shouldRedirect ? (
        <AnalyticsStateCard
          title="Открываем вашу карточку"
          message="Для роли водителя доступна только собственная аналитика."
          tone="loading"
        />
      ) : !contextQuery.data?.driverId || !contextQuery.data.taxiParkId ? (
        <AnalyticsStateCard
          title="Не удалось определить водителя"
          message="Профиль не содержит достаточных данных для загрузки аналитики. Проверьте привязку к таксопарку."
          tone="error"
        />
      ) : analyticsQuery.isLoading ? (
        <AnalyticsStateCard
          title="Загружаем аналитику водителя"
          message="Подготавливаем выручку, сравнение с парком и историю смен."
          tone="loading"
        />
      ) : analyticsQuery.error ? (
        <AnalyticsStateCard
          title={
            analyticsQuery.notFound
              ? "Аналитика водителя недоступна"
              : "Не удалось загрузить аналитику водителя"
          }
          message={
            analyticsQuery.notFound
              ? "Водитель не найден или недоступен в выбранном таксопарке."
              : analyticsQuery.errorMessage
          }
          tone="error"
          actionLabel="Повторить"
          onAction={() => {
            void analyticsQuery.refetch();
          }}
        />
      ) : analyticsQuery.data == null ||
        isDriverAnalyticsEmpty(analyticsQuery.data) ? (
        <AnalyticsStateCard
          title="Нет аналитики по водителю"
          message="За выбранный период сервис не вернул выручку или историю смен."
        />
      ) : (
        <DriverAnalyticsContent analytics={analyticsQuery.data} />
      )}
    </main>
  );
};

export const DriverDetailPage = ({ driverId, mode }: DriverDetailPageProps) => {
  if (mode === "external") {
    return (
      <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
        <ExternalDriverDetailContent driverId={driverId} />
      </main>
    );
  }

  return <InternalDriverDetailContent driverId={driverId} />;
};
