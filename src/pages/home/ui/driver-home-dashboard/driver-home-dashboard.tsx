import type { ColumnDef } from "@tanstack/react-table";
import { CarFront } from "lucide-react";

import {
  type DriverHomeDashboardViewModel,
  type HomeAnalyticsPeriodState,
  useDriverHomeDashboard,
  useDriverLiveState,
  useDriverWorkDayActions,
  useUnauthorizedHomeRedirect,
} from "@/pages/home/model";
import {
  AnalyticsStateCard,
  TaxiparksPeriodFilter,
} from "@/pages/taxiparks/ui";

import type { CurrentUser } from "@/shared/api/auth";
import {
  AppText,
  TAG,
  TEXT_SIZES_VARIABLES,
  TEXT_VARIANTS_VARIABLES,
} from "@/shared/ui/app-text";
import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";
import { CardSurface } from "@/shared/ui/card-surface";

import {
  DashboardEmptyState,
  DashboardPill,
  SummaryRow,
} from "./dashboard-primitives";
import {
  formatDashboardDate,
  formatFullDate,
  formatShortDate,
  getCarStatusConfig,
  getRecentDayStatusConfig,
} from "./driver-home-dashboard.utils";
import { DataTable } from "@/features/data-table";
import type { DateRangePickerValue } from "@/features/date-range-picker";
import { DriverTodayRevenueCard } from "@/features/driver-today-revenue-card";
import { KpiCard } from "@/features/kpi-card";
import { PageHeader } from "@/features/page-header/page-header";
import { TitledBlock } from "@/features/titled-block";
import { VerticalBarChart } from "@/features/vertical-bar-chart";

const moneyFormatter = new Intl.NumberFormat("ru-RU");
const compactMoneyFormatter = new Intl.NumberFormat("ru-RU", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const percentFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 1,
});

type DriverHomeDashboardProps = {
  currentUser: CurrentUser;
  range: DateRangePickerValue;
  period: HomeAnalyticsPeriodState;
  onRangeChange: (value: DateRangePickerValue) => void;
};

type DriverWorkDayRow = DriverHomeDashboardViewModel["workDays"][number];

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

const formatSignedPercent = (value?: number) => {
  if (value == null) {
    return "—";
  }

  const sign = value > 0 ? "+" : "";

  return `${sign}${percentFormatter.format(value)}%`;
};

const workDayColumns: ColumnDef<DriverWorkDayRow>[] = [
  {
    accessorKey: "date",
    header: "Дата",
    cell: ({ row }) => (
      <span className="tabular-nums">{formatFullDate(row.original.date)}</span>
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
    cell: ({ row }) => {
      const status = getRecentDayStatusConfig(row.original.status);

      return <DashboardPill label={status.label} tone={status.tone} />;
    },
  },
  {
    accessorKey: "car",
    header: "Авто",
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {row.original.car.firm} {row.original.car.model} ·{" "}
        {row.original.car.plateNumber}
      </span>
    ),
  },
];

export const DriverHomeDashboard = ({
  currentUser,
  range,
  period,
  onRangeChange,
}: DriverHomeDashboardProps) => {
  const dashboardQuery = useDriverHomeDashboard(period);
  const liveStateQuery = useDriverLiveState();
  const workDayActions = useDriverWorkDayActions();

  useUnauthorizedHomeRedirect(dashboardQuery.error);
  useUnauthorizedHomeRedirect(liveStateQuery.error);

  if (dashboardQuery.isLoading) {
    return (
      <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
        <PageHeader
          title="Главная"
          description={`Персональная аналитика для ${currentUser.fullName}.`}
          showLogoutButton
          actions={
            <TaxiparksPeriodFilter value={range} onChange={onRangeChange} />
          }
        />
        <AnalyticsStateCard
          title="Загружаем водительский дашборд"
          message="Подготавливаем показатели по выручке, рейтингу и рабочим дням."
          tone="loading"
        />
      </main>
    );
  }

  if (dashboardQuery.error || !dashboardQuery.data) {
    return (
      <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
        <PageHeader
          title="Главная"
          description={`Персональная аналитика для ${currentUser.fullName}.`}
          showLogoutButton
          actions={
            <TaxiparksPeriodFilter value={range} onChange={onRangeChange} />
          }
        />
        <AnalyticsStateCard
          title="Не удалось загрузить водительский дашборд"
          message={dashboardQuery.errorMessage}
          tone="error"
          actionLabel="Повторить"
          onAction={() => {
            void dashboardQuery.refetch();
          }}
        />
      </main>
    );
  }

  const dashboard = dashboardQuery.data;
  const liveState = liveStateQuery.data;
  const currentDate = formatDashboardDate(new Date());
  const carStatus = getCarStatusConfig(dashboard.driver.assignedCar?.state);
  const liveWorkDayStatus = liveState?.workDayStatus ?? null;
  const liveWorkDayStatusConfig = getRecentDayStatusConfig(liveWorkDayStatus);
  const canEditRevenue =
    liveWorkDayStatusConfig.canEditRevenue && Boolean(liveState?.workDayId);
  const liveWorkDayId = liveState?.workDayId ?? null;
  const liveCarLabel = liveState?.assignedCar
    ? `${liveState.assignedCar.firm} ${liveState.assignedCar.model} · ${liveState.assignedCar.plateNumber}`
    : "Автомобиль не назначен";
  const kpiCards = [
    {
      label: "Общая выручка",
      value: formatCurrency(dashboard.summary.totalRevenue),
      meta: `${dashboard.period.from} - ${dashboard.period.to}`,
    },
    {
      label: "Средняя за смену",
      value: formatCurrency(dashboard.summary.averageRevenuePerShift),
      meta: formatCurrency(dashboard.comparison.taxiParkAverageRevenuePerShift),
    },
    {
      label: "Средняя за день",
      value: formatCurrency(dashboard.summary.averageRevenuePerDay),
      meta: `${dashboard.summary.workDaysCount} рабочих дней`,
    },
    {
      label: "Рабочие дни / простой",
      value: String(dashboard.summary.onlineDaysCount),
      meta: `${dashboard.summary.downtimeDaysCount} дней простоя`,
    },
    {
      label: "Место в рейтинге",
      value: `#${dashboard.rating.rank}`,
      meta: `из ${dashboard.rating.driversCount} водителей`,
    },
    {
      label: "Efficiency score",
      value: `${percentFormatter.format(dashboard.scorecard.driverEfficiency)}/100`,
      meta: `${percentFormatter.format(dashboard.scorecard.stabilityScore)} стабильность`,
    },
    {
      label: "Разница  по средней выручке",
      value: `${formatSignedCurrency(
        dashboard.comparison.revenueDifferenceFromParkAverage,
      )} с парком`,
      meta: `${formatCurrency(
        dashboard.comparison.taxiParkAverageRevenuePerDriver,
      )} с водителем`,
    },
    {
      label: "Активность в сравнении с парком",
      value: formatSignedPercent(
        dashboard.comparison.activityDifferenceFromParkAverage,
      ),
      meta: `${percentFormatter.format(dashboard.comparison.taxiParkAverageActivityRate)}% в среднем по парку`,
    },
  ];

  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader
        title="Главная"
        description="Персональная аналитика по выручке, активности и рейтингу за выбранный период."
        showLogoutButton
        actions={
          <TaxiparksPeriodFilter value={range} onChange={onRangeChange} />
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_350px]">
        <CardSurface className="gap-5 rounded-[24px] p-6 md:p-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 flex-1">
              <AppText className="text-text-secondary text-xs font-semibold tracking-[0.12em] uppercase">
                Главная
              </AppText>

              <AppText
                tag={TAG.h1}
                size={TEXT_SIZES_VARIABLES.large}
                className="text-text-primary mt-2 font-bold"
              >
                {dashboard.driver.fullName || currentUser.fullName}
              </AppText>

              <AppText className="text-text-secondary mt-1 text-sm font-medium">
                {currentDate}
              </AppText>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <DashboardPill
                  label={liveWorkDayStatusConfig.label}
                  tone={liveWorkDayStatusConfig.tone}
                />
                <DashboardPill
                  label={`Таксопарк: ${dashboard.driver.taxiParkName}`}
                  tone="default"
                />
              </div>

              <AppText
                variant={TEXT_VARIANTS_VARIABLES.main}
                size={TEXT_SIZES_VARIABLES.xs}
                className="text-text-secondary mt-3 font-medium"
              >
                Выручку можно редактировать только в активной смене.
              </AppText>

              <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap">
                {!liveState?.isOnLine ? (
                  <Button
                    type="button"
                    className="min-w-[168px]"
                    disabled={workDayActions.isPending}
                    onClick={() => {
                      void workDayActions.startWorkDay();
                    }}
                  >
                    Выйти на линию
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant={BUTTON_VARIANTS_VARIABLES.secondary}
                  className="min-w-[168px]"
                  disabled={
                    workDayActions.isPending ||
                    !liveWorkDayStatusConfig.canFinishShift
                  }
                  onClick={() => {
                    if (!liveWorkDayId) {
                      return;
                    }

                    void workDayActions.finishWorkDay(liveWorkDayId);
                  }}
                >
                  Завершить смену
                </Button>
              </div>
            </div>

            <div className="bg-background-page flex min-w-[220px] flex-col gap-2 rounded-[16px] px-4 py-3">
              <AppText className="text-text-secondary text-xs font-semibold uppercase">
                Рейтинг
              </AppText>
              <AppText className="text-text-primary text-[28px] font-bold tabular-nums">
                #{dashboard.rating.rank}
              </AppText>
              <AppText className="text-text-secondary text-sm font-medium">
                из {dashboard.rating.driversCount} водителей
              </AppText>
              <AppText className="text-text-secondary text-sm font-medium">
                {liveCarLabel}
              </AppText>
            </div>
          </div>
        </CardSurface>

        <DriverTodayRevenueCard
          revenue={liveState?.activeWorkDayRevenue}
          updatedAt={liveState?.activeWorkDayUpdatedAt}
          canEdit={canEditRevenue}
          isBusy={workDayActions.isPending}
          helperText={
            canEditRevenue
              ? "Выручку можно обновлять несколько раз в рамках активной смены."
              : liveWorkDayStatus === "COMPLETED"
                ? "Смена завершена. Редактирование выручки недоступно."
                : "Выйдите на линию, чтобы редактировать выручку."
          }
          onSave={({ revenue }) => {
            if (!liveWorkDayId) {
              return;
            }

            void workDayActions.updateWorkDayRevenue({
              workDayId: liveWorkDayId,
              revenue,
            });
          }}
        />
      </div>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {kpiCards.map((card) => (
          <KpiCard
            key={String(card.label)}
            label={card.label}
            value={card.value}
            meta={card.meta}
            className="min-w-0"
            valueClassName="text-text-primary"
            metaClassName="text-accent-primary"
          />
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <TitledBlock
          title="Назначенный автомобиль"
          subtitle="Актуальные данные по автомобилю на выбранный период"
          className="gap-5"
        >
          {dashboard.driver.assignedCar ? (
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
              <div className="border-border-default bg-background-page flex h-[168px] w-full shrink-0 items-center justify-center rounded-[18px] border lg:w-[220px]">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="bg-accent-primary-soft text-accent-primary flex size-14 items-center justify-center rounded-full">
                    <CarFront className="size-7" />
                  </div>
                  <div>
                    <AppText className="text-text-primary text-sm font-semibold">
                      {dashboard.driver.assignedCar.firm}{" "}
                      {dashboard.driver.assignedCar.model}
                    </AppText>
                    <AppText className="text-text-secondary text-xs font-medium">
                      {dashboard.driver.assignedCar.plateNumber}
                    </AppText>
                  </div>
                </div>
              </div>

              <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 md:grid-cols-2">
                <SummaryRow
                  label="Марка"
                  value={dashboard.driver.assignedCar.firm}
                />
                <SummaryRow
                  label="Модель"
                  value={dashboard.driver.assignedCar.model}
                />
                <SummaryRow
                  label="Госномер"
                  value={dashboard.driver.assignedCar.plateNumber}
                />
                <SummaryRow label="Статус" value={carStatus.label} />
              </div>
            </div>
          ) : (
            <DashboardEmptyState
              title="Автомобиль не назначен"
              description="В ответе API `assignedCar = null`. Показываем пустой блок без моковых значений."
            />
          )}
        </TitledBlock>

        <TitledBlock
          title="Сравнение с парком"
          subtitle="Сводка относительно средних значений парка"
          contentClassName="mt-2"
        >
          <div className="flex flex-col gap-3">
            <SummaryRow
              label="Выручка"
              value={formatSignedCurrency(
                dashboard.comparison.revenueDifferenceFromParkAverage,
              )}
            />
            <SummaryRow
              label="Средняя выручка / смена"
              value={formatSignedCurrency(
                dashboard.comparison.shiftRevenueDifferenceFromParkAverage,
              )}
            />
            <SummaryRow
              label="Активность"
              value={formatSignedPercent(
                dashboard.comparison.activityDifferenceFromParkAverage,
              )}
            />
            <SummaryRow
              label="Средняя по парку"
              value={formatCurrency(
                dashboard.comparison.taxiParkAverageRevenuePerDriver,
              )}
            />
          </div>
        </TitledBlock>
      </section>

      <TitledBlock
        title="Динамика выручки"
        subtitle={`Период ${dashboard.period.from} - ${dashboard.period.to}`}
        topRightSlot={
          <DashboardPill
            label={`${dashboard.summary.onlineDaysCount} рабочих дней`}
          />
        }
      >
        {dashboard.charts.revenueByDay.length > 0 ? (
          <VerticalBarChart
            data={dashboard.charts.revenueByDay.map((point) => ({
              date: point.date,
              value: point.revenue,
            }))}
            valueLabel="Выручка, ₽"
            height={300}
            xTickFormatter={formatShortDate}
            yTickFormatter={(value) => compactMoneyFormatter.format(value)}
            tooltipDateFormatter={(value) => formatFullDate(value)}
            tooltipValueFormatter={(value) => formatCurrency(value)}
          />
        ) : (
          <DashboardEmptyState
            title="Нет графика выручки"
            description="API не вернул ни одного значения `revenueByDay` за выбранный период."
          />
        )}
      </TitledBlock>

      <section className="flex flex-col gap-4">
        <TitledBlock
          title="Последние рабочие смены"
          subtitle="История смен и выручки"
        >
          {dashboard.workDays.length > 0 ? (
            <DataTable
              columns={workDayColumns}
              data={dashboard.workDays}
              initialPageSize={5}
            />
          ) : (
            <DashboardEmptyState
              title="История рабочих дней пуста"
              description="Массив `workDays` пуст. Проверьте другой диапазон дат."
            />
          )}
        </TitledBlock>
      </section>
    </main>
  );
};
