import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, CarFront, Trash2 } from "lucide-react";

import {
  AnalyticsStateCard,
  StatusBadge,
  TaxiparksPeriodFilter,
} from "@/pages/taxiparks/ui";
import {
  getVehicleStateMeta,
  isVehicleAnalyticsEmpty,
  useDirectorVehiclesCatalog,
  useVehicleAnalyticsDetail,
  useVehicleAnalyticsPeriod,
} from "@/pages/vehicles/model";

import { $api } from "@/shared/api/apiInstance";
import { getApiErrorMessage } from "@/shared/api/auth";
import { getWorkDayStatusConfig } from "@/shared/lib/work-day-status";
import { AppText, TAG, TEXT_SIZES_VARIABLES } from "@/shared/ui/app-text";
import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";
import { CardSurface } from "@/shared/ui/card-surface";

import { ConfirmDialog } from "@/features/confirm-dialog";
import { DataTable } from "@/features/data-table";
import { KpiCard } from "@/features/kpi-card";
import { PageHeader } from "@/features/page-header/page-header";
import { TitledBlock } from "@/features/titled-block";
import { VerticalBarChart } from "@/features/vertical-bar-chart";

type VehicleDetailPageProps = {
  carId: string;
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
    cell: ({ row }) => (
      <StatusBadge {...getWorkDayStatusConfig(row.original.status)} />
    ),
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

const formatSignedCurrency = (value?: number) => {
  if (value == null) {
    return "—";
  }

  const sign = value > 0 ? "+" : "";

  return `${sign}₽ ${moneyFormatter.format(value)}`;
};

const getVehicleDeleteLabel = ({
  plateNumber,
  firm,
  model,
  fallbackId,
}: {
  plateNumber?: string;
  firm?: string;
  model?: string;
  fallbackId: string;
}) => {
  if (plateNumber) {
    return plateNumber;
  }

  const modelLabel = [firm, model].filter(Boolean).join(" ").trim();

  return modelLabel.length > 0 ? modelLabel : fallbackId;
};

export const VehicleDetailPage = ({ carId }: VehicleDetailPageProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { range, period, onRangeChange } = useVehicleAnalyticsPeriod();
  const catalogQuery = useDirectorVehiclesCatalog();
  const deleteVehicleMutation = $api.useMutation("delete", "/api/cars/{id}", {
    retry: false,
  });
  const vehicleCatalogItem = catalogQuery.data?.vehicles.find(
    (vehicle) => vehicle.carId === carId,
  );
  const analyticsQuery = useVehicleAnalyticsDetail({
    taxiParkId: vehicleCatalogItem?.taxiParkId,
    carId,
    period,
    enabled: Boolean(vehicleCatalogItem?.taxiParkId),
  });

  const analytics = analyticsQuery.data;
  const vehicleState = analytics
    ? getVehicleStateMeta(analytics.car.state)
    : null;
  const workDays: WorkDayRow[] =
    analytics?.workDays.map((workDay) => ({
      id: workDay.workDayId,
      date: workDay.date,
      revenue: workDay.revenue,
      status: workDay.status,
      driverName: workDay.driver.fullName,
    })) ?? [];

  const isResolvingVehicle = catalogQuery.isLoading;
  const isVehicleMissing =
    !catalogQuery.isLoading &&
    !catalogQuery.error &&
    catalogQuery.data != null &&
    vehicleCatalogItem == null;
  const vehicleLabel = getVehicleDeleteLabel({
    plateNumber: analytics?.car.plateNumber ?? vehicleCatalogItem?.plateNumber,
    firm: analytics?.car.firm ?? vehicleCatalogItem?.firm,
    model: analytics?.car.model ?? vehicleCatalogItem?.model,
    fallbackId: carId,
  });
  const deleteErrorMessage = deleteVehicleMutation.error
    ? getApiErrorMessage(deleteVehicleMutation.error)
    : null;

  const handleVehicleDelete = async () => {
    await deleteVehicleMutation.mutateAsync({
      params: { path: { id: carId } },
    });

    await queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    await navigate({ to: "/vehicles" });
  };

  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader
        title={
          analytics
            ? `${analytics.car.firm} ${analytics.car.model}`
            : vehicleCatalogItem
              ? `${vehicleCatalogItem.firm} ${vehicleCatalogItem.model}`
              : "Автомобиль"
        }
        description={
          deleteErrorMessage
            ? deleteErrorMessage
            : analytics
            ? `Аналитика автомобиля ${analytics.car.plateNumber} за период ${analytics.period.from} - ${analytics.period.to}.`
            : "Детальная аналитика автомобиля по выручке, использованию и рабочим дням."
        }
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Автомобили", href: "/vehicles" },
          {
            label:
              analytics?.car.plateNumber ??
              vehicleCatalogItem?.plateNumber ??
              carId,
          },
        ]}
        actions={
          <>
            <TaxiparksPeriodFilter value={range} onChange={onRangeChange} />
            <ConfirmDialog
              title={`Удалить автомобиль ${vehicleLabel}?`}
              description="Автомобиль будет удален без возможности восстановления. Это действие нельзя отменить."
              confirmText={
                deleteVehicleMutation.isPending ? "Удаляем..." : "Удалить"
              }
              confirmDisabled={deleteVehicleMutation.isPending}
              onConfirm={() => {
                void handleVehicleDelete();
              }}
              trigger={
                <Button
                  type="button"
                  variant={BUTTON_VARIANTS_VARIABLES.destructive}
                >
                  <Trash2 className="size-4" />
                  Удалить
                </Button>
              }
            />
            <Button type="button" asChild>
              <Link to="/vehicles/$id/edit" params={{ id: carId }}>
                Редактировать
              </Link>
            </Button>
            <Button
              type="button"
              variant={BUTTON_VARIANTS_VARIABLES.secondary}
              onClick={() => navigate({ to: "/vehicles" })}
            >
              <ArrowLeft className="size-4" />
              Назад
            </Button>
          </>
        }
      />

      {isResolvingVehicle ? (
        <AnalyticsStateCard
          title="Определяем автомобиль"
          message="Проверяем доступный каталог директора перед загрузкой аналитики."
          tone="loading"
        />
      ) : catalogQuery.error ? (
        <AnalyticsStateCard
          title="Не удалось определить автомобиль"
          message={catalogQuery.errorMessage}
          tone="error"
          actionLabel="Повторить"
          onAction={() => {
            void catalogQuery.refetch();
          }}
        />
      ) : isVehicleMissing ? (
        <AnalyticsStateCard
          title="Автомобиль не найден"
          message="Указанный carId не найден среди доступных вам автомобилей."
          tone="error"
          actionLabel="К каталогу"
          onAction={() => {
            navigate({ to: "/vehicles" });
          }}
        />
      ) : analyticsQuery.isLoading ? (
        <AnalyticsStateCard
          title="Загружаем аналитику автомобиля"
          message="Подготавливаем показатели, сравнение с таксопарком и историю рабочих дней."
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
              ? "Этот автомобиль не найден или недоступен в выбранном таксопарке."
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
          message="За выбранный период сервис не вернул график выручки или рабочие дни."
        />
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_320px]">
            <CardSurface className="gap-5 rounded-[24px] p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                <div className="border-border-default bg-background-page flex h-[220px] w-full shrink-0 items-center justify-center rounded-[18px] border lg:w-[280px]">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="bg-accent-primary-soft text-accent-primary flex size-14 items-center justify-center rounded-full">
                      <CarFront className="size-7" />
                    </div>
                    <div>
                      <AppText className="text-text-primary text-sm font-semibold">
                        {analytics.car.firm} {analytics.car.model}
                      </AppText>
                      <AppText className="text-text-secondary text-xs font-medium">
                        carId: {analytics.car.carId}
                      </AppText>
                    </div>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <AppText
                        tag={TAG.h2}
                        size={TEXT_SIZES_VARIABLES.large}
                        className="text-text-primary font-bold"
                      >
                        {analytics.car.firm} {analytics.car.model}
                      </AppText>
                      <AppText className="text-text-secondary mt-1 text-sm font-medium">
                        Номер: {analytics.car.plateNumber}
                      </AppText>
                    </div>

                    {vehicleState ? (
                      <StatusBadge
                        label={vehicleState.label}
                        tone={vehicleState.tone}
                      />
                    ) : null}
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <SummaryRow
                      label="Таксопарк"
                      value={analytics.car.taxiParkName}
                    />
                    <SummaryRow
                      label="Водитель"
                      value={
                        analytics.car.assignedDriver?.fullName ?? "Не назначен"
                      }
                    />
                    <SummaryRow
                      label="Рабочих дней"
                      value={String(analytics.summary.onlineDaysCount)}
                    />
                    <SummaryRow
                      label="Рабочих дней"
                      value={String(analytics.summary.workDaysCount)}
                    />
                    <SummaryRow
                      label="Дней простоя"
                      value={String(analytics.summary.downtimeDaysCount)}
                    />
                    <SummaryRow
                      label="Потери от простоя"
                      value={formatCurrency(
                        analytics.summary.estimatedDowntimeLoss,
                      )}
                    />
                  </div>
                </div>
              </div>
            </CardSurface>

            <CardSurface className="justify-between gap-4 rounded-[24px] p-6">
              <div>
                <AppText className="text-text-secondary text-xs font-medium tracking-[0.12em] uppercase">
                  Использование
                </AppText>
                <AppText className="text-accent-primary mt-2 text-[48px] leading-none font-bold">
                  {percentFormatter.format(analytics.summary.utilizationRate)}%
                </AppText>
                <AppText className="text-text-secondary mt-2 text-sm font-medium">
                  {analytics.summary.onlineDaysCount} рабочих дней и{" "}
                  {analytics.summary.downtimeDaysCount} дней простоя
                </AppText>
              </div>

              <div className="bg-background-page rounded-[16px] px-4 py-3">
                <AppText className="text-text-secondary text-xs font-medium">
                  Выручка за период
                </AppText>
                <AppText className="text-text-primary mt-1 text-lg font-semibold">
                  {formatCurrency(analytics.summary.totalRevenue)}
                </AppText>
                <AppText className="text-text-secondary mt-1 text-xs font-medium">
                  {formatCurrency(analytics.summary.averageRevenuePerOnlineDay)}{" "}
                  за рабочий день
                </AppText>
              </div>
            </CardSurface>
          </section>

          <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Выручка"
              value={formatCurrency(analytics.summary.totalRevenue)}
            />
            <KpiCard
              label="₽ / рабочий день"
              value={formatCurrency(
                analytics.summary.averageRevenuePerOnlineDay,
              )}
            />
            <KpiCard
              label="Рабочих дней"
              value={`${analytics.summary.onlineDaysCount} дней`}
              meta={`${analytics.summary.workDaysCount} смен`}
            />
            <KpiCard
              label="Потери от простоя"
              value={formatCurrency(analytics.summary.estimatedDowntimeLoss)}
              meta={`${percentFormatter.format(analytics.summary.downtimeRate)}% простоя`}
            />
          </section>

          <TitledBlock
            title={`Позиция в бренде ${analytics.brandAnalytics.firm}`}
            subtitle="Срез по автомобилям той же марки вместо общих средних по парку"
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label="Авто бренда"
                value={analytics.brandAnalytics.carsCount}
                meta={`Место по выручке: #${analytics.brandAnalytics.rankByRevenue}`}
              />
              <KpiCard
                label="Средняя выручка бренда"
                value={formatCurrency(
                  analytics.brandAnalytics.averageRevenuePerCar,
                )}
                meta={formatSignedCurrency(
                  analytics.brandAnalytics
                    .currentCarRevenueDifferenceFromBrandAverage,
                )}
              />
              <KpiCard
                label="Доля в выручке марки"
                value={`${percentFormatter.format(analytics.brandAnalytics.currentCarRevenueShare)}%`}
                meta={formatCurrency(analytics.brandAnalytics.totalRevenue)}
              />
              <KpiCard
                label="Использование марки"
                value={`${percentFormatter.format(analytics.brandAnalytics.utilizationRate)}%`}
                meta={`${analytics.brandAnalytics.onlineDaysCount} рабочих дней / ${analytics.brandAnalytics.downtimeDaysCount} простой`}
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
                height={320}
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
            subtitle="Таблица выручки, статуса выхода на линию и назначенного водителя"
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
                message="За выбранный период сервис не вернул ни одной записи."
              />
            )}
          </TitledBlock>
        </>
      )}
    </main>
  );
};
