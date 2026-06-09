import type { ColumnDef } from "@tanstack/react-table";
import { CarFront } from "lucide-react";

import type { CurrentUser } from "@/shared/api/auth";
import { AppText, TAG, TEXT_SIZES_VARIABLES } from "@/shared/ui/app-text";
import { CardSurface } from "@/shared/ui/card-surface";

import { DataTable } from "@/features/data-table";
import { KpiCard } from "@/features/kpi-card";
import { PageHeader } from "@/features/page-header/page-header";
import { TitledBlock } from "@/features/titled-block";
import { VerticalBarChart } from "@/features/vertical-bar-chart";
import { TAXIPARKS_SIDEBAR_NAV_BY_ID } from "@/features/taxiparks-sidebar";
import { AnalyticsStateCard, StatusBadge, TaxiparksPeriodFilter } from "@/pages/taxiparks/ui";
import {
  getVehicleStateMeta,
  isVehicleAnalyticsEmpty,
  useDriverAssignedVehicleContext,
  useVehicleAnalyticsDetail,
  useVehicleAnalyticsPeriod,
} from "@/pages/vehicles/model";
import { getWorkDayStatusConfig } from "@/shared/lib/work-day-status";

type DriverVehiclesPageProps = {
  currentUser: CurrentUser;
};

type WorkDayRow = {
  id: string;
  date: string;
  revenue: number;
  status: "ACTIVE" | "COMPLETED" | "DOWNTIME";
  driverName: string;
};

const moneyFormatter = new Intl.NumberFormat("ru-RU");
const compactMoneyFormatter = new Intl.NumberFormat("ru-RU", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const percentFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 1,
});

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

const workDayColumns: ColumnDef<WorkDayRow>[] = [
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
    cell: ({ row }) => <StatusBadge {...getWorkDayStatusConfig(row.original.status)} />,
  },
  {
    accessorKey: "driverName",
    header: "Водитель",
  },
];

type SummaryRowProps = {
  label: string;
  value: string;
};

const SummaryRow = ({ label, value }: SummaryRowProps) => {
  return (
    <div className="bg-background-page flex items-center justify-between gap-4 rounded-[12px] px-4 py-3">
      <AppText className="text-text-primary text-sm font-medium">
        {label}
      </AppText>
      <AppText className="text-text-primary text-right text-sm font-semibold tabular-nums">
        {value}
      </AppText>
    </div>
  );
};

export const DriverVehiclesPage = ({
  currentUser,
}: DriverVehiclesPageProps) => {
  const { range, period, onRangeChange } = useVehicleAnalyticsPeriod();
  const assignedVehicleQuery = useDriverAssignedVehicleContext();
  const analyticsQuery = useVehicleAnalyticsDetail({
    taxiParkId: assignedVehicleQuery.data?.taxiParkId,
    carId: assignedVehicleQuery.data?.carId,
    period,
    enabled:
      Boolean(assignedVehicleQuery.data?.taxiParkId) &&
      Boolean(assignedVehicleQuery.data?.carId),
  });

  const analytics = analyticsQuery.data;
  const vehicleState = analytics ? getVehicleStateMeta(analytics.car.state) : null;
  const workDays: WorkDayRow[] =
    analytics?.workDays.map((workDay) => ({
      id: workDay.workDayId,
      date: workDay.date,
      revenue: workDay.revenue,
      status: workDay.status,
      driverName: workDay.driver.fullName,
    })) ?? [];

  const isContextLoading = assignedVehicleQuery.isLoading;
  const isContextMissing =
    !assignedVehicleQuery.isLoading &&
    !assignedVehicleQuery.error &&
    (!assignedVehicleQuery.data?.carId || !assignedVehicleQuery.data?.taxiParkId);

  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader
        title="Мой автомобиль"
        description="Реальная аналитика по назначенному автомобилю."
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: TAXIPARKS_SIDEBAR_NAV_BY_ID.vehicles.label },
        ]}
        actions={<TaxiparksPeriodFilter value={range} onChange={onRangeChange} />}
      />

      {isContextLoading ? (
        <AnalyticsStateCard
          title="Определяем назначенный автомобиль"
          message="Проверяем профиль водителя и текущий таксопарк."
          tone="loading"
        />
      ) : assignedVehicleQuery.error ? (
        <AnalyticsStateCard
          title="Не удалось определить автомобиль"
          message={assignedVehicleQuery.errorMessage}
          tone="error"
          actionLabel="Повторить"
          onAction={() => {
            void assignedVehicleQuery.refetch();
          }}
        />
      ) : isContextMissing ? (
        <CardSurface className="items-center justify-center gap-3 rounded-[24px] px-6 py-12 text-center">
          <div className="bg-accent-primary-soft text-accent-primary flex size-14 items-center justify-center rounded-full">
            <CarFront className="size-7" />
          </div>
          <AppText
            tag={TAG.h2}
            size={TEXT_SIZES_VARIABLES.medium}
            className="text-text-primary font-semibold"
          >
            Автомобиль не назначен
          </AppText>
          <AppText className="text-text-secondary max-w-[440px] text-sm font-medium">
            Профиль водителя не содержит `carId`, поэтому аналитика автомобиля
            недоступна. Обратитесь к директору таксопарка.
          </AppText>
        </CardSurface>
      ) : analyticsQuery.isLoading ? (
        <AnalyticsStateCard
          title="Загружаем аналитику автомобиля"
          message="Подготавливаем показатели, график и историю рабочих дней."
          tone="loading"
        />
      ) : analyticsQuery.error ? (
        <AnalyticsStateCard
          title={
            analyticsQuery.notFound
              ? "Автомобиль недоступен"
              : "Не удалось загрузить аналитику автомобиля"
          }
          message={
            analyticsQuery.notFound
              ? "Назначенный автомобиль не найден или больше недоступен для просмотра."
              : analyticsQuery.errorMessage
          }
          tone="error"
          actionLabel="Повторить"
          onAction={() => {
            void analyticsQuery.refetch();
          }}
        />
      ) : analytics == null || isVehicleAnalyticsEmpty(analytics) ? (
        <AnalyticsStateCard
          title="Нет аналитики по автомобилю"
          message="За выбранный период сервис не вернул рабочие дни или выручку."
        />
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
            <CardSurface className="gap-6 rounded-[24px] p-6 md:p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 flex-1 gap-4">
                  <div className="bg-accent-primary-soft text-accent-primary flex size-16 shrink-0 items-center justify-center rounded-[18px]">
                    <CarFront className="size-8" />
                  </div>

                  <div className="min-w-0">
                    <AppText className="text-text-secondary text-xs font-semibold tracking-[0.12em] uppercase">
                      Назначенный автомобиль
                    </AppText>
                    <AppText
                      tag={TAG.h2}
                      size={TEXT_SIZES_VARIABLES.medium}
                      className="text-text-primary mt-2 font-bold"
                    >
                      {analytics.car.firm} {analytics.car.model}
                    </AppText>
                    <AppText className="text-text-secondary mt-1 text-sm font-medium">
                      Госномер: {analytics.car.plateNumber}
                    </AppText>
                  </div>
                </div>

                {vehicleState ? (
                  <StatusBadge label={vehicleState.label} tone={vehicleState.tone} />
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <SummaryRow label="Таксопарк" value={analytics.car.taxiParkName} />
                <SummaryRow
                  label="Водитель"
                  value={
                    analytics.car.assignedDriver?.fullName ??
                    assignedVehicleQuery.data?.driverName ??
                    currentUser.fullName
                  }
                />
                <SummaryRow label="Онлайн-дней" value={String(analytics.summary.onlineDaysCount)} />
                <SummaryRow label="Рабочих дней" value={String(analytics.summary.workDaysCount)} />
                <SummaryRow
                  label="Простой"
                  value={`${analytics.summary.downtimeDaysCount} дн.`}
                />
                <SummaryRow
                  label="Утилизация"
                  value={`${percentFormatter.format(analytics.summary.utilizationRate)}%`}
                />
              </div>
            </CardSurface>

            <CardSurface className="gap-3 rounded-[24px] p-6">
              <KpiCard
                label="Выручка"
                value={formatCurrency(analytics.summary.totalRevenue)}
              />
              <KpiCard
                label="₽ / онлайн-день"
                value={formatCurrency(analytics.summary.averageRevenuePerOnlineDay)}
              />
              <KpiCard
                label="Потери от простоя"
                value={formatCurrency(analytics.summary.estimatedDowntimeLoss)}
              />
            </CardSurface>
          </section>

          <TitledBlock
            title={`Позиция в бренде ${analytics.brandAnalytics.firm}`}
            subtitle="Краткий срез по автомобилям той же марки"
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label="Авто бренда"
                value={analytics.brandAnalytics.carsCount}
                meta={`Место: #${analytics.brandAnalytics.rankByRevenue}`}
              />
              <KpiCard
                label="Средняя выручка бренда"
                value={formatCurrency(analytics.brandAnalytics.averageRevenuePerCar)}
                meta={formatSignedCurrency(
                  analytics.brandAnalytics.currentCarRevenueDifferenceFromBrandAverage,
                )}
              />
              <KpiCard
                label="Доля в выручке бренда"
                value={`${percentFormatter.format(analytics.brandAnalytics.currentCarRevenueShare)}%`}
                meta={formatCurrency(analytics.brandAnalytics.totalRevenue)}
              />
              <KpiCard
                label="Утилизация бренда"
                value={`${percentFormatter.format(analytics.brandAnalytics.utilizationRate)}%`}
                meta={`${analytics.brandAnalytics.onlineDaysCount} онлайн / ${analytics.brandAnalytics.downtimeDaysCount} простой`}
              />
            </div>
          </TitledBlock>

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
                height={300}
                xTickFormatter={formatShortDate}
                yTickFormatter={(value) => formatCompactCurrency(value)}
                tooltipValueFormatter={(value) => formatCurrency(value)}
              />
            ) : (
              <AnalyticsStateCard
                title="Нет графика выручки"
                message="Сервис не вернул данные по дням за выбранный период."
              />
            )}
          </TitledBlock>

          <TitledBlock
            title="История рабочих дней"
            subtitle="Выручка, статус выхода на линию и водитель по дням"
          >
            {workDays.length > 0 ? (
              <DataTable
                columns={workDayColumns}
                data={workDays}
                initialPageSize={10}
              />
            ) : (
              <AnalyticsStateCard
                title="История рабочих дней пуста"
                message="За выбранный период сервис не вернул записи по рабочим дням."
              />
            )}
          </TitledBlock>
        </>
      )}
    </main>
  );
};
