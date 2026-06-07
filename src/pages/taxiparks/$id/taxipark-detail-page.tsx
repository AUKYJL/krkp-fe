import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

import { DataTable } from "@/features/data-table";
import { KpiCard } from "@/features/kpi-card";
import { PageHeader } from "@/features/page-header/page-header";
import { SearchInput } from "@/features/search-input";
import { TitledBlock } from "@/features/titled-block";
import { VerticalBarChart } from "@/features/vertical-bar-chart";
import { AppText } from "@/shared/ui/app-text";
import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";

import {
  useAnalyticsPeriod,
  useTaxiParkDetailAnalytics,
} from "../model/taxiparks-analytics";
import {
  AnalyticsStateCard,
  BestIndicatorItem,
  StatusBadge,
  TaxiparksPeriodFilter,
} from "../ui";

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

type DriverRow = {
  id: string;
  fullName: string;
  totalRevenue: number;
  averageRevenuePerOnlineDay: number;
  onlineDaysCount: number;
  downtimeDaysCount: number;
  activityRate: number;
  rank: number;
};

type CarRow = {
  id: string;
  name: string;
  plateNumber: string;
  state: "WORKING" | "EMERGENCY" | "REPAIR";
  totalRevenue: number;
  averageRevenuePerOnlineDay: number;
  onlineDaysCount: number;
  downtimeDaysCount: number;
  utilizationRate: number;
};

type ProblemCarRow = {
  id: string;
  name: string;
  plateNumber: string;
  downtimeDaysCount: number;
  estimatedLoss: number;
};

const carStateLabelMap = {
  WORKING: { label: "На линии", tone: "default" as const },
  EMERGENCY: { label: "Авария", tone: "accent" as const },
  REPAIR: { label: "Ремонт", tone: "muted" as const },
};

const driverColumns: ColumnDef<DriverRow>[] = [
  { accessorKey: "rank", header: "Ранг" },
  { accessorKey: "fullName", header: "Водитель" },
  {
    accessorKey: "totalRevenue",
    header: "Выручка",
    cell: ({ getValue }) => (
      <span className="text-accent-primary font-semibold tabular-nums">
        {formatCurrency(getValue<number>())}
      </span>
    ),
  },
  {
    accessorKey: "averageRevenuePerOnlineDay",
    header: "₽ / онлайн-день",
    cell: ({ getValue }) => (
      <span className="tabular-nums">{formatCurrency(getValue<number>())}</span>
    ),
  },
  {
    accessorKey: "onlineDaysCount",
    header: "Онлайн-дни",
  },
  {
    accessorKey: "activityRate",
    header: "Активность",
    cell: ({ getValue }) => (
      <span className="tabular-nums">
        {percentFormatter.format(getValue<number>())}%
      </span>
    ),
  },
];

const carColumns: ColumnDef<CarRow>[] = [
  { accessorKey: "name", header: "Автомобиль" },
  { accessorKey: "plateNumber", header: "Номер" },
  {
    accessorKey: "state",
    header: "Состояние",
    cell: ({ getValue }) => {
      const value = getValue<CarRow["state"]>();
      const state = carStateLabelMap[value];

      return <StatusBadge label={state.label} tone={state.tone} />;
    },
  },
  {
    accessorKey: "totalRevenue",
    header: "Выручка",
    cell: ({ getValue }) => (
      <span className="text-accent-primary font-semibold tabular-nums">
        {formatCurrency(getValue<number>())}
      </span>
    ),
  },
  {
    accessorKey: "averageRevenuePerOnlineDay",
    header: "₽ / онлайн-день",
    cell: ({ getValue }) => (
      <span className="tabular-nums">{formatCurrency(getValue<number>())}</span>
    ),
  },
  {
    accessorKey: "utilizationRate",
    header: "Утилизация",
    cell: ({ getValue }) => (
      <span className="tabular-nums">
        {percentFormatter.format(getValue<number>())}%
      </span>
    ),
  },
];

const problemCarColumns: ColumnDef<ProblemCarRow>[] = [
  { accessorKey: "name", header: "Автомобиль" },
  { accessorKey: "plateNumber", header: "Номер" },
  {
    accessorKey: "downtimeDaysCount",
    header: "Дней простоя",
  },
  {
    accessorKey: "estimatedLoss",
    header: "Оценка потерь",
    cell: ({ getValue }) => (
      <span className="text-accent-primary font-semibold tabular-nums">
        {formatCurrency(getValue<number>())}
      </span>
    ),
  },
];

type TaxiparkDetailPageProps = {
  taxiparkId: string;
};

export const TaxiparkDetailPage = ({ taxiparkId }: TaxiparkDetailPageProps) => {
  const navigate = useNavigate();
  const { range, period, onRangeChange } = useAnalyticsPeriod();
  const analyticsQuery = useTaxiParkDetailAnalytics({
    taxiParkId: taxiparkId,
    period,
  });
  const analytics = analyticsQuery.data;

  const [driversSearch, setDriversSearch] = useState("");
  const [carsSearch, setCarsSearch] = useState("");
  const [problemCarsSearch, setProblemCarsSearch] = useState("");

  const driverRows: DriverRow[] =
    analytics?.topDrivers.map((driver) => ({
      id: driver.driverId,
      fullName: driver.fullName,
      totalRevenue: driver.totalRevenue,
      averageRevenuePerOnlineDay: driver.averageRevenuePerOnlineDay,
      onlineDaysCount: driver.onlineDaysCount,
      downtimeDaysCount: driver.downtimeDaysCount,
      activityRate: driver.activityRate,
      rank: driver.rank,
    })) ?? [];

  const carRows: CarRow[] =
    analytics?.topCars.map((car) => ({
      id: car.carId,
      name: `${car.firm} ${car.model}`,
      plateNumber: car.plateNumber,
      state: car.state,
      totalRevenue: car.totalRevenue,
      averageRevenuePerOnlineDay: car.averageRevenuePerOnlineDay,
      onlineDaysCount: car.onlineDaysCount,
      downtimeDaysCount: car.downtimeDaysCount,
      utilizationRate: car.utilizationRate,
    })) ?? [];

  const problemCarRows: ProblemCarRow[] =
    analytics?.problemCars.map((car) => ({
      id: car.carId,
      name: `${car.firm} ${car.model}`,
      plateNumber: car.plateNumber,
      downtimeDaysCount: car.downtimeDaysCount,
      estimatedLoss: car.estimatedLoss,
    })) ?? [];

  const filteredDrivers = driverRows.filter((row) =>
    [row.fullName, String(row.rank)].some((value) =>
      value.toLowerCase().includes(driversSearch.trim().toLowerCase()),
    ),
  );
  const filteredCars = carRows.filter((row) =>
    [row.name, row.plateNumber].some((value) =>
      value.toLowerCase().includes(carsSearch.trim().toLowerCase()),
    ),
  );
  const filteredProblemCars = problemCarRows.filter((row) =>
    [row.name, row.plateNumber].some((value) =>
      value.toLowerCase().includes(problemCarsSearch.trim().toLowerCase()),
    ),
  );

  const summaryCards =
    analytics == null
      ? []
      : [
          {
            label: "Общая выручка",
            value: formatCurrency(analytics.summary.totalRevenue),
            meta: `${formatCurrency(analytics.summary.averageRevenuePerDay)} в день`,
          },
          {
            label: "Водители",
            value: String(analytics.summary.driversCount),
            meta: `${analytics.summary.activeDriversCount} активных`,
          },
          {
            label: "Автомобили",
            value: String(analytics.summary.carsCount),
            meta: `${percentFormatter.format(analytics.summary.onlineRate)}% выхода на линию`,
          },
          {
            label: "₽ / активный водитель",
            value: formatCurrency(analytics.summary.averageRevenuePerActiveDriver),
            meta: `${analytics.summary.onlineDaysCount} онлайн-дней`,
          },
          {
            label: "₽ / авто",
            value: formatCurrency(analytics.summary.averageRevenuePerCar),
            meta: `${analytics.summary.workDaysCount} рабочих дней`,
          },
          {
            label: "Потери от простоя",
            value: formatCurrency(analytics.summary.estimatedDowntimeLoss),
            meta: `${percentFormatter.format(analytics.summary.downtimeRate)}% простоя`,
          },
        ];

  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader
        title={analytics?.header.name ?? `Таксопарк ${taxiparkId}`}
        description={
          analytics?.header.address
            ? `Аналитика таксопарка за период ${period.from} - ${period.to}. ${analytics.header.address}`
            : `Аналитика таксопарка за период ${period.from} - ${period.to}.`
        }
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Таксопарки", href: "/taxiparks" },
          { label: analytics?.header.name ?? `Таксопарк ${taxiparkId}` },
        ]}
        actions={
          <>
            <TaxiparksPeriodFilter value={range} onChange={onRangeChange} />
            <Button
              type="button"
              variant={BUTTON_VARIANTS_VARIABLES.secondary}
              onClick={() => {
                navigate({ to: "/taxiparks" });
              }}
            >
              <ArrowLeft className="size-4" />
              Назад
            </Button>
          </>
        }
      />

      {analyticsQuery.isLoading ? (
        <AnalyticsStateCard
          title="Загружаем аналитику таксопарка"
          message="Подготавливаем показатели, графики и таблицы за выбранный период."
          tone="loading"
        />
      ) : analyticsQuery.error ? (
        <AnalyticsStateCard
          title="Не удалось загрузить аналитику таксопарка"
          message={analyticsQuery.errorMessage}
          tone="error"
          actionLabel="Повторить"
          onAction={() => {
            void analyticsQuery.refetch();
          }}
        />
      ) : analytics == null ? (
        <AnalyticsStateCard
          title="Нет данных"
          message="По этому таксопарку нет аналитики за выбранный период."
        />
      ) : (
        <>
          <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {summaryCards.map((card) => (
              <KpiCard
                key={card.label}
                label={card.label}
                value={card.value}
                meta={card.meta}
                valueClassName="text-text-primary"
                metaClassName="text-accent-primary"
                className="min-w-0"
              />
            ))}
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <TitledBlock
              title="Выручка по дням"
              subtitle={`Период ${analytics.period.from} - ${analytics.period.to}`}
              headerClassName="items-center"
              topRightSlot={
                <StatusBadge label={`${analytics.period.daysCount} дн.`} />
              }
              className="gap-5"
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
                  message="Сервис не вернул данные по выручке за дни выбранного периода."
                />
              )}
            </TitledBlock>

            <TitledBlock
              title="Простой по дням"
              subtitle="Количество автомобилей вне линии"
              className="gap-5"
            >
              {analytics.charts.downtimeByDay.length > 0 ? (
                <VerticalBarChart
                  data={analytics.charts.downtimeByDay.map((point) => ({
                    date: point.date,
                    value: point.downtimeCarsCount,
                  }))}
                  valueLabel="Авто в простое"
                  height={320}
                  xTickFormatter={formatShortDate}
                />
              ) : (
                <AnalyticsStateCard
                  title="Нет графика простоя"
                  message="Сервис не вернул данные по простоям за выбранный период."
                />
              )}
            </TitledBlock>
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <TitledBlock title="Лучшие бренды" subtitle="Рейтинг по выручке">
              <div className="flex flex-col gap-3">
                {analytics.topBrands.length > 0 ? (
                  analytics.topBrands.slice(0, 4).map((brand) => (
                    <BestIndicatorItem
                      key={brand.firm}
                      title={brand.firm}
                      subtitle={`${brand.carsCount} авто, ${percentFormatter.format(brand.utilizationRate)}% утилизации`}
                      value={formatCurrency(brand.totalRevenue)}
                    />
                  ))
                ) : (
                  <AppText className="text-text-secondary text-sm font-medium">
                    Нет данных по брендам за выбранный период.
                  </AppText>
                )}
              </div>
            </TitledBlock>

            <TitledBlock
              title="Проблемные автомобили"
              subtitle="Самые большие потери от простоя"
              topRightSlot={
                <AppText className="text-accent-primary text-2xl font-bold">
                  {formatCurrency(analytics.summary.estimatedDowntimeLoss)}
                </AppText>
              }
            >
              <div className="flex flex-col gap-3">
                {problemCarRows.slice(0, 4).length > 0 ? (
                  problemCarRows.slice(0, 4).map((car) => (
                    <BestIndicatorItem
                      key={car.id}
                      title={`${car.name} · ${car.plateNumber}`}
                      subtitle={`${car.downtimeDaysCount} дней простоя`}
                      value={formatCurrency(car.estimatedLoss)}
                    />
                  ))
                ) : (
                  <AppText className="text-text-secondary text-sm font-medium">
                    Нет проблемных автомобилей за выбранный период.
                  </AppText>
                )}
              </div>
            </TitledBlock>
          </section>

          <TitledBlock
            title="Топ водители"
            subtitle="Лидеры по выручке и активности"
            headerClassName="items-center"
            topRightSlot={
              <SearchInput
                value={driversSearch}
                onChange={(value) => setDriversSearch(value)}
                className="w-full lg:w-80"
                placeholder="Поиск по водителям"
              />
            }
          >
            {driverRows.length > 0 ? (
              <DataTable
                columns={driverColumns}
                data={filteredDrivers}
                initialPageSize={10}
              />
            ) : (
              <AnalyticsStateCard
                title="Нет данных по водителям"
                message="Сервис не вернул рейтинг водителей за выбранный период."
              />
            )}
          </TitledBlock>

          <TitledBlock
            title="Топ автомобили"
            subtitle="Лучшие автомобили по выручке и утилизации"
            headerClassName="items-center"
            topRightSlot={
              <SearchInput
                value={carsSearch}
                onChange={(value) => setCarsSearch(value)}
                className="w-full lg:w-80"
                placeholder="Поиск по автомобилям"
              />
            }
          >
            {carRows.length > 0 ? (
              <DataTable
                columns={carColumns}
                data={filteredCars}
                initialPageSize={10}
                onRowClick={(row) => {
                  navigate({
                    to: "/vehicles/$id",
                    params: { id: row.id },
                  });
                }}
              />
            ) : (
              <AnalyticsStateCard
                title="Нет данных по автомобилям"
                message="Сервис не вернул рейтинг автомобилей за выбранный период."
              />
            )}
          </TitledBlock>

          <TitledBlock
            title="Автомобили с потерями"
            subtitle="Таблица простоев и оценочных потерь"
            headerClassName="items-center"
            topRightSlot={
              <SearchInput
                value={problemCarsSearch}
                onChange={(value) => setProblemCarsSearch(value)}
                className="w-full lg:w-80"
                placeholder="Поиск по проблемным авто"
              />
            }
          >
            {problemCarRows.length > 0 ? (
              <DataTable
                columns={problemCarColumns}
                data={filteredProblemCars}
                initialPageSize={10}
                onRowClick={(row) => {
                  navigate({
                    to: "/vehicles/$id",
                    params: { id: row.id },
                  });
                }}
              />
            ) : (
              <AnalyticsStateCard
                title="Нет проблемных автомобилей"
                message="За выбранный период потери от простоя не найдены."
              />
            )}
          </TitledBlock>
        </>
      )}
    </main>
  );
};
