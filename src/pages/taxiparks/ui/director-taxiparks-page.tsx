import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { AppText } from "@/shared/ui/app-text";
import { Button } from "@/shared/ui/button";

import { columns } from "../consts";
import {
  useAnalyticsPeriod,
  useDirectorOverviewAnalytics,
} from "../model/taxiparks-analytics";
import {
  AnalyticsStateCard,
  BestIndicatorItem,
  StatusBadge,
  TaxiparksPeriodFilter,
} from "../ui";

import { CsvExportButton } from "@/features/csv-export-button";
import { DataTable } from "@/features/data-table";
import { DonutPieChart } from "@/features/donut-pie-chart";
import { KpiCard } from "@/features/kpi-card";
import { PageHeader } from "@/features/page-header/page-header";
import { ProgressCard } from "@/features/progress-card";
import { SearchInput } from "@/features/search-input";
import { TAXIPARKS_SIDEBAR_NAV_BY_ID } from "@/features/taxiparks-sidebar";
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

const formatCurrency = (value?: number) => {
  if (value == null) {
    return "—";
  }

  return `₽ ${moneyFormatter.format(value)}`;
};

const formatCompactCurrency = (value: number) => {
  return compactMoneyFormatter.format(value);
};

export const DirectorTaxiparksPage = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { range, period, onRangeChange } = useAnalyticsPeriod();
  const analyticsQuery = useDirectorOverviewAnalytics(period);
  const analytics = analyticsQuery.data;

  const query = search.trim().toLowerCase();
  const filteredTableData =
    analytics == null
      ? []
      : query.length === 0
        ? analytics.taxiParks
        : analytics.taxiParks.filter((row) =>
            [row.name, row.address].some((value) =>
              value.toLowerCase().includes(query),
            ),
          );

  const summaryCards =
    analytics == null
      ? []
      : [
          {
            label: "Таксопарки",
            value: String(analytics.summary.taxiParksCount),
            meta: `${analytics.summary.carsCount} авто в управлении`,
          },
          {
            label: "Общая выручка",
            value: formatCurrency(analytics.summary.totalRevenue),
            meta: `${formatCurrency(analytics.summary.averageRevenuePerDay)} в день`,
          },
          {
            label: "Активные водители",
            value: String(analytics.summary.activeDriversCount),
            meta: `${analytics.summary.driversCount} всего водителей`,
          },
          {
            label: "Средняя выручка водителя",
            value: formatCurrency(
              analytics.summary.averageRevenuePerActiveDriver,
            ),
            meta: `${analytics.summary.workDaysCount} рабочих дней`,
          },
          {
            label: "Средняя выручка авто",
            value: formatCurrency(analytics.summary.averageRevenuePerCar),
            meta: `${analytics.summary.carsCount} автомобилей`,
          },
          {
            label: "Выход на линию",
            value: `${percentFormatter.format(analytics.summary.onlineRate)}%`,
            meta: `${analytics.summary.onlineDaysCount} рабочих дней`,
          },
          {
            label: "Потери от простоя",
            value: formatCurrency(analytics.summary.estimatedDowntimeLoss),
            meta: `${percentFormatter.format(analytics.summary.downtimeRate)}% простоя`,
          },
        ];

  const revenueChartData =
    analytics?.charts.revenueByTaxiPark.map((item) => ({
      label: item.label,
      value: item.revenue,
    })) ?? [];

  const topProblemTaxiParks = analytics?.problemTaxiParks.slice(0, 3) ?? [];
  const topDrivers = analytics?.topDrivers.slice(0, 3) ?? [];
  const topBrands = analytics?.topBrands.slice(0, 3) ?? [];
  const revenueByDay = analytics?.charts.revenueByDay ?? [];

  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader
        title={TAXIPARKS_SIDEBAR_NAV_BY_ID.taxiparks.label}
        description="Управление таксопарками и анализ финансовой эффективности"
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: TAXIPARKS_SIDEBAR_NAV_BY_ID.taxiparks.label },
        ]}
        actions={
          <>
            <TaxiparksPeriodFilter value={range} onChange={onRangeChange} />

            <Button asChild>
              <Link to="/taxiparks/create">Создать таксопарк</Link>
            </Button>
          </>
        }
      />

      {analyticsQuery.isLoading ? (
        <AnalyticsStateCard
          title="Загружаем аналитику"
          message="Собираем сводные показатели по таксопаркам за выбранный период."
          tone="loading"
        />
      ) : analyticsQuery.error ? (
        <AnalyticsStateCard
          title="Не удалось загрузить аналитику"
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
          message="За выбранный период аналитика по таксопаркам не найдена."
        />
      ) : (
        <>
          <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
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

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-4">
            <TitledBlock
              title="Распределение выручки"
              subtitle={`По паркам за период ${analytics.period.from} - ${analytics.period.to}`}
              headerClassName="items-center"
              topRightSlot={
                <StatusBadge label={`${analytics.period.daysCount} дн.`} />
              }
              className="min-w-0"
            >
              {revenueChartData.length > 0 ? (
                <DonutPieChart
                  data={revenueChartData}
                  centerLabel={formatCompactCurrency(
                    analytics.summary.totalRevenue,
                  )}
                  centerSubLabel="выручка"
                />
              ) : (
                <AnalyticsStateCard
                  title="Нет разреза по паркам"
                  message="Сервис не вернул данные по распределению выручки."
                />
              )}
            </TitledBlock>

            <TitledBlock
              title="Топ водители"
              subtitle="Лидеры по выручке за выбранный период"
              className="min-w-0"
            >
              <div className="flex flex-col gap-3">
                {topDrivers.length > 0 ? (
                  topDrivers.map((driver) => (
                    <BestIndicatorItem
                      key={driver.driverId}
                      title={driver.fullName}
                      subtitle={driver.taxiParkName}
                      value={formatCurrency(driver.totalRevenue)}
                    />
                  ))
                ) : (
                  <AppText className="text-text-secondary text-sm font-medium">
                    Нет данных по водителям за выбранный период.
                  </AppText>
                )}
              </div>
            </TitledBlock>

            <TitledBlock
              title="Проблемные таксопарки"
              subtitle="Парки с самым высоким простоем"
              headerClassName="items-center"
              topRightSlot={
                <AppText className="text-accent-primary text-2xl font-bold">
                  {formatCurrency(analytics.summary.estimatedDowntimeLoss)}
                </AppText>
              }
              className="min-w-0"
            >
              <div className="flex flex-col gap-4">
                {topProblemTaxiParks.length > 0 ? (
                  topProblemTaxiParks.map((item) => (
                    <ProgressCard
                      key={item.taxiParkId}
                      title={item.name}
                      secondaryText={`${percentFormatter.format(item.downtimeRate)}%`}
                      value={item.downtimeRate}
                      footnote={`Потери ${formatCurrency(item.estimatedDowntimeLoss)}`}
                    />
                  ))
                ) : (
                  <AppText className="text-text-secondary text-sm font-medium">
                    Нет проблемных таксопарков за выбранный период.
                  </AppText>
                )}
              </div>
            </TitledBlock>

            <TitledBlock
              title="Лучшие марки"
              subtitle="Самые прибыльные марки автопарка"
              className="min-w-0"
            >
              <div className="flex flex-col gap-3">
                {topBrands.length > 0 ? (
                  topBrands.map((brand) => (
                    <BestIndicatorItem
                      key={brand.firm}
                      title={brand.firm}
                      subtitle={`${brand.carsCount} авто, ${percentFormatter.format(brand.utilizationRate)}% использования`}
                      value={formatCurrency(brand.totalRevenue)}
                    />
                  ))
                ) : (
                  <AppText className="text-text-secondary text-sm font-medium">
                    Нет данных по маркам за выбранный период.
                  </AppText>
                )}
              </div>
            </TitledBlock>
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <TitledBlock
              title="Динамика выручки"
              subtitle="Изменение выручки по дням"
              className="gap-5"
            >
              {revenueByDay.length > 0 ? (
                <VerticalBarChart
                  data={revenueByDay.map((point) => ({
                    date: point.date,
                    value: point.revenue,
                  }))}
                  valueLabel="Выручка, ₽"
                  height={320}
                  yTickFormatter={(value) => formatCompactCurrency(value)}
                  tooltipValueFormatter={(value) => formatCurrency(value)}
                />
              ) : (
                <AnalyticsStateCard
                  title="Нет данных по дням"
                  message="По выбранному периоду не найдено ни одного дня с выручкой."
                />
              )}
            </TitledBlock>

            <TitledBlock
              title="Проблемные автомобили"
              subtitle="Авто с максимальными потерями от простоя"
              className="min-w-0"
            >
              <div className="flex flex-col gap-3">
                {analytics.problemCars.slice(0, 3).length > 0 ? (
                  analytics.problemCars
                    .slice(0, 3)
                    .map((car) => (
                      <BestIndicatorItem
                        key={car.carId}
                        title={`${car.firm} ${car.model} · ${car.plateNumber}`}
                        subtitle={`${car.taxiParkName}, ${car.downtimeDaysCount} дн. простоя`}
                        value={formatCurrency(car.estimatedLoss)}
                      />
                    ))
                ) : (
                  <AppText className="text-text-secondary text-sm font-medium">
                    Нет автомобилей с потерями за выбранный период.
                  </AppText>
                )}
              </div>
            </TitledBlock>
          </section>

          <TitledBlock
            title="Таксопарки"
            subtitle="Финансовые и операционные показатели по каждому таксопарку"
            headerClassName="items-center"
            topRightSlot={
              <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
                <SearchInput
                  value={search}
                  onChange={(value) => setSearch(value)}
                  className="w-full lg:w-96"
                  placeholder="Поиск по названию или адресу"
                />
                <CsvExportButton
                  columns={columns}
                  data={filteredTableData}
                  fileName="taxiparks-analytics"
                />
              </div>
            }
          >
            <DataTable
              columns={columns}
              data={filteredTableData}
              initialPageSize={10}
              onRowClick={(row) => {
                navigate({
                  to: "/taxiparks/$id",
                  params: { id: row.taxiParkId },
                });
              }}
            />
          </TitledBlock>
        </>
      )}
    </main>
  );
};
