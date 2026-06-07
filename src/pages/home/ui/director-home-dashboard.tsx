import type { ColumnDef } from "@tanstack/react-table";

import type { DateRangePickerValue } from "@/features/date-range-picker";
import { DataTable } from "@/features/data-table";
import { KpiCard } from "@/features/kpi-card";
import { PageHeader } from "@/features/page-header/page-header";
import { ProgressCard } from "@/features/progress-card";
import { TitledBlock } from "@/features/titled-block";
import { VerticalBarChart } from "@/features/vertical-bar-chart";
import {
  type DirectorHomeDashboardViewModel,
  type HomeAnalyticsPeriodState,
  useDirectorHomeDashboard,
  useUnauthorizedHomeRedirect,
} from "@/pages/home/model";
import { AnalyticsStateCard, TaxiparksPeriodFilter } from "@/pages/taxiparks/ui";
import type { CurrentUser } from "@/shared/api/auth";
import { AppText } from "@/shared/ui/app-text";

const moneyFormatter = new Intl.NumberFormat("ru-RU");
const compactMoneyFormatter = new Intl.NumberFormat("ru-RU", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const percentFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 1,
});

type DirectorHomeDashboardProps = {
  currentUser: CurrentUser;
  range: DateRangePickerValue;
  period: HomeAnalyticsPeriodState;
  onRangeChange: (value: DateRangePickerValue) => void;
};

type TaxiParkTableRow = DirectorHomeDashboardViewModel["taxiParks"][number];

const formatCurrency = (value?: number) => {
  if (value == null) {
    return "—";
  }

  return `₽ ${moneyFormatter.format(value)}`;
};

const formatCompactCurrency = (value?: number) => {
  if (value == null) {
    return "—";
  }

  return `₽ ${compactMoneyFormatter.format(value)}`;
};

const formatPercent = (value?: number) => {
  if (value == null) {
    return "—";
  }

  return `${percentFormatter.format(value)}%`;
};

const formatShortDate = (value: string) => {
  return new Date(value).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
  });
};

const EmptyBlock = ({
  title,
  message,
}: {
  title: string;
  message: string;
}) => {
  return (
    <div className="border-border-default bg-background-page flex min-h-36 flex-col items-center justify-center rounded-[16px] border border-dashed px-4 py-6 text-center">
      <AppText className="text-text-primary text-sm font-semibold">
        {title}
      </AppText>
      <AppText className="text-text-secondary mt-1 max-w-[420px] text-sm font-medium">
        {message}
      </AppText>
    </div>
  );
};

const topTaxiParkColumns: ColumnDef<TaxiParkTableRow>[] = [
  {
    accessorKey: "name",
    header: "Таксопарк",
    cell: ({ row }) => (
      <span className="text-text-primary text-sm font-semibold">
        {row.original.name}
      </span>
    ),
  },
  {
    accessorKey: "driversCount",
    header: "Водители",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {row.original.driversCount} / {row.original.activeDriversCount} акт.
      </span>
    ),
  },
  {
    accessorKey: "carsCount",
    header: "Авто",
    cell: ({ row }) => <span className="tabular-nums">{row.original.carsCount}</span>,
  },
  {
    accessorKey: "totalRevenue",
    header: "Выручка",
    cell: ({ row }) => (
      <span className="text-accent-primary font-semibold tabular-nums">
        {formatCurrency(row.original.totalRevenue)}
      </span>
    ),
  },
  {
    accessorKey: "onlineRate",
    header: "Онлайн",
    cell: ({ row }) => (
      <span className="tabular-nums">{formatPercent(row.original.onlineRate)}</span>
    ),
  },
  {
    accessorKey: "downtimeRate",
    header: "Простой",
    cell: ({ row }) => (
      <span className="tabular-nums">{formatPercent(row.original.downtimeRate)}</span>
    ),
  },
  {
    accessorKey: "estimatedDowntimeLoss",
    header: "Потери",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {formatCurrency(row.original.estimatedDowntimeLoss)}
      </span>
    ),
  },
];

export const DirectorHomeDashboard = ({
  currentUser,
  range,
  period,
  onRangeChange,
}: DirectorHomeDashboardProps) => {
  const dashboardQuery = useDirectorHomeDashboard(period);

  useUnauthorizedHomeRedirect(dashboardQuery.error);

  if (dashboardQuery.isLoading) {
    return (
      <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
        <PageHeader
          title="Главная"
          description={`Директорский дашборд для ${currentUser.fullName}.`}
          actions={<TaxiparksPeriodFilter value={range} onChange={onRangeChange} />}
        />
        <AnalyticsStateCard
          title="Загружаем директорский дашборд"
          message="Подготавливаем сводку по выручке, простоям и эффективности таксопарков."
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
          description={`Директорский дашборд для ${currentUser.fullName}.`}
          actions={<TaxiparksPeriodFilter value={range} onChange={onRangeChange} />}
        />
        <AnalyticsStateCard
          title="Не удалось загрузить директорский дашборд"
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
  const downtimeCars =
    dashboard.downtimeKpis.mostDowntimeCars.length > 0
      ? dashboard.downtimeKpis.mostDowntimeCars
      : dashboard.carKpis.problemCars;
  const topBrands = dashboard.carKpis.topBrands;
  const kpiCards = [
    {
      label: "Таксопарки",
      value: String(dashboard.summary.taxiParksCount),
      meta: `${dashboard.summary.workDaysCount} рабочих дней`,
    },
    {
      label: "Водители / активные",
      value: String(dashboard.summary.driversCount),
      meta: `${dashboard.summary.activeDriversCount} активных`,
    },
    {
      label: "Автомобили",
      value: String(dashboard.summary.carsCount),
      meta: `${dashboard.summary.onlineDaysCount} онлайн-дней`,
    },
    {
      label: "Общая выручка",
      value: formatCurrency(dashboard.financialKpis.totalRevenue),
      meta: `${dashboard.period.from} - ${dashboard.period.to}`,
    },
    {
      label: "Средняя выручка в день",
      value: formatCurrency(dashboard.financialKpis.averageRevenuePerDay),
      meta: formatCurrency(dashboard.financialKpis.averageRevenuePerTaxiPark),
    },
    {
      label: "₽ / активный водитель",
      value: formatCurrency(dashboard.financialKpis.averageRevenuePerActiveDriver),
      meta: formatCurrency(dashboard.financialKpis.averageRevenuePerCar),
    },
    {
      label: "Онлайн-рейт",
      value: formatPercent(dashboard.downtimeKpis.onlineRate),
      meta: `${dashboard.downtimeKpis.onlineDaysCount} онлайн-дней`,
    },
    {
      label: "Потери от простоя",
      value: formatCurrency(dashboard.downtimeKpis.estimatedDowntimeLoss),
      meta: `${formatPercent(dashboard.downtimeKpis.downtimeRate)} простоя`,
    },
  ];

  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader
        title="Главная"
        description="Сводка по выручке, таксопаркам и простоям за выбранный период."
        actions={<TaxiparksPeriodFilter value={range} onChange={onRangeChange} />}
      />

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
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

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
        <TitledBlock
          title="Выручка по дням"
          subtitle={`Период ${dashboard.period.from} - ${dashboard.period.to}`}
        >
          {dashboard.charts.revenueByDay.length > 0 ? (
            <VerticalBarChart
              data={dashboard.charts.revenueByDay.map((point) => ({
                date: point.date,
                value: point.revenue,
              }))}
              valueLabel="Выручка, ₽"
              height={320}
              xTickFormatter={formatShortDate}
              yTickFormatter={(value) => compactMoneyFormatter.format(value)}
              tooltipDateFormatter={(value) =>
                new Date(value).toLocaleDateString("ru-RU")
              }
              tooltipValueFormatter={(value) => formatCurrency(value)}
            />
          ) : (
            <EmptyBlock
              title="Нет данных по выручке"
              message="API вернул пустой временной ряд. Попробуйте другой период."
            />
          )}
        </TitledBlock>

        <TitledBlock
          title="Выручка по таксопаркам"
          subtitle="Распределение по паркам"
        >
          {dashboard.charts.revenueByTaxiPark.length > 0 ? (
            <VerticalBarChart
              data={dashboard.charts.revenueByTaxiPark.map((point) => ({
                date: point.taxiParkName,
                value: point.revenue,
              }))}
              valueLabel="Выручка, ₽"
              height={320}
              yTickFormatter={(value) => compactMoneyFormatter.format(value)}
              tooltipValueFormatter={(value) => formatCurrency(value)}
            />
          ) : (
            <EmptyBlock
              title="Нет распределения по паркам"
              message="За выбранный период нет данных по выручке таксопарков."
            />
          )}
        </TitledBlock>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <TitledBlock
          title="Топ водителей"
          subtitle="По общей выручке"
          contentClassName="mt-2"
        >
          {dashboard.driverKpis.topDrivers.length > 0 ? (
            <div className="flex flex-col gap-3">
              {dashboard.driverKpis.topDrivers.slice(0, 5).map((driver) => (
                <ProgressCard
                  key={driver.driverId}
                  title={`${driver.rank}. ${driver.fullName}`}
                  secondaryText={formatCurrency(driver.totalRevenue)}
                  value={driver.activityRate}
                  footnote={`${driver.taxiParkName} · ${formatPercent(driver.activityRate)} активности`}
                />
              ))}
            </div>
          ) : (
            <EmptyBlock
              title="Топ водителей пуст"
              message="В рейтинге пока нет данных по выручке водителей."
            />
          )}
        </TitledBlock>

        <TitledBlock
          title="Проблемные авто"
          subtitle="Максимальные простои"
          contentClassName="mt-2"
        >
          {downtimeCars.length > 0 ? (
            <div className="flex flex-col gap-3">
              {downtimeCars.slice(0, 5).map((car) => (
                <ProgressCard
                  key={car.carId}
                  title={`${car.firm} ${car.model}`}
                  secondaryText={formatPercent(car.downtimeDaysCount)}
                  value={car.downtimeDaysCount}
                  max={Math.max(...downtimeCars.map((item) => item.downtimeDaysCount), 1)}
                  footnote={`${car.plateNumber} · Потери ${formatCurrency(car.estimatedLoss)}`}
                />
              ))}
            </div>
          ) : (
            <EmptyBlock
              title="Нет проблемных авто"
              message="Простои по автомобилям не зафиксированы."
            />
          )}
        </TitledBlock>

        <TitledBlock
          title="Топ брендов"
          subtitle="По суммарной выручке"
          contentClassName="mt-2"
        >
          {topBrands.length > 0 ? (
            <div className="flex flex-col gap-3">
              {topBrands.slice(0, 5).map((brand) => (
                <KpiCard
                  key={brand.firm}
                  label={brand.firm}
                  value={formatCurrency(brand.totalRevenue)}
                  meta={`${brand.carsCount} авто · ${formatPercent(brand.utilizationRate)} утилизации`}
                  className="min-w-0"
                  valueClassName="text-text-primary"
                  metaClassName="text-text-secondary"
                />
              ))}
            </div>
          ) : (
            <EmptyBlock
              title="Нет данных по брендам"
              message="API не вернул агрегаты по брендам за выбранный период."
            />
          )}
        </TitledBlock>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <TitledBlock
          title="Простои по дням"
          subtitle={`${dashboard.summary.downtimeDaysCount} дней простоя в сумме`}
        >
          {dashboard.charts.downtimeByDay.length > 0 ? (
            <VerticalBarChart
              data={dashboard.charts.downtimeByDay.map((point) => ({
                date: point.date,
                value: point.downtimeCarsCount,
              }))}
              valueLabel="Авто в простое"
              height={260}
              xTickFormatter={formatShortDate}
              tooltipDateFormatter={(value) =>
                new Date(value).toLocaleDateString("ru-RU")
              }
            />
          ) : (
            <EmptyBlock
              title="Простоев не найдено"
              message="Детализация по простоям за выбранный период отсутствует."
            />
          )}
        </TitledBlock>

        <TitledBlock
          title="Ключевые ориентиры"
          subtitle="Финансовая и операционная сводка"
          contentClassName="mt-2"
        >
          <div className="flex flex-col gap-3">
            <KpiCard
              label="Средняя выручка на парк"
              value={formatCurrency(dashboard.financialKpis.averageRevenuePerTaxiPark)}
              meta={formatCompactCurrency(dashboard.financialKpis.totalRevenue)}
              valueClassName="text-text-primary"
              metaClassName="text-text-secondary"
            />
            <KpiCard
              label="Средняя выручка на авто"
              value={formatCurrency(dashboard.financialKpis.averageRevenuePerCar)}
              meta={`${dashboard.summary.carsCount} автомобилей`}
              valueClassName="text-text-primary"
              metaClassName="text-text-secondary"
            />
            <KpiCard
              label="Активные водители"
              value={String(dashboard.summary.activeDriversCount)}
              meta={`${formatPercent(dashboard.downtimeKpis.onlineRate)} выхода на линию`}
              valueClassName="text-text-primary"
              metaClassName="text-text-secondary"
            />
          </div>
        </TitledBlock>
      </section>

      <TitledBlock
        title="Сводка по таксопаркам"
        subtitle="Нижняя таблица по каждому парку"
      >
        {dashboard.taxiParks.length > 0 ? (
          <DataTable
            columns={topTaxiParkColumns}
            data={dashboard.taxiParks}
            initialPageSize={10}
          />
        ) : (
          <EmptyBlock
            title="Нет строк по таксопаркам"
            message="API не вернул ни одного парка для выбранного диапазона дат."
          />
        )}
      </TitledBlock>
    </main>
  );
};
