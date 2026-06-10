import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

import { useCarBrandsAnalytics } from "@/pages/vehicles/model";

import type { components } from "@/shared/api/apiTypes";
import { formatMoney, formatNumber, formatPercent } from "@/shared/lib/format";
import { AppText } from "@/shared/ui/app-text";
import { Combobox, type ComboboxOption } from "@/shared/ui/combobox";

import { DataTable } from "@/features/data-table";
import { KpiCard } from "@/features/kpi-card";
import { TitledBlock } from "@/features/titled-block";
import { VerticalBarChart } from "@/features/vertical-bar-chart";

type CarBrandAnalyticsItem = components["schemas"]["CarBrandAnalyticsItemDto"];
type CarBrandsAnalyticsResponse =
  components["schemas"]["GetCarBrandsAnalyticsResponseDto"];

export interface CarBrandsAnalyticsSectionProps {
  from: string;
  to: string;
  taxiParks: Array<{
    taxiParkId: string;
    name: string;
  }>;
}

const DEFAULT_TAXI_PARK_ID = "all";

const brandColumns: ColumnDef<CarBrandAnalyticsItem>[] = [
  {
    accessorKey: "firm",
    header: "Марка",
    cell: ({ row }) => (
      <span className="text-sm font-semibold">{row.original.firm}</span>
    ),
  },
  {
    accessorKey: "carsCount",
    header: "Автомобилей",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {formatNumber(row.original.carsCount)}
      </span>
    ),
  },
  {
    accessorKey: "totalRevenue",
    header: "Выручка",
    cell: ({ row }) => (
      <span className="text-accent-primary font-semibold tabular-nums">
        {formatMoney(row.original.totalRevenue)}
      </span>
    ),
  },
  {
    accessorKey: "averageRevenuePerCar",
    header: "Средняя на авто",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {formatMoney(row.original.averageRevenuePerCar)}
      </span>
    ),
  },
  {
    accessorKey: "averageRevenuePerOnlineDay",
    header: "Средняя за день на линии",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {formatMoney(row.original.averageRevenuePerOnlineDay)}
      </span>
    ),
  },
  {
    accessorKey: "onlineDaysCount",
    header: "Дней на линии",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {formatNumber(row.original.onlineDaysCount)}
      </span>
    ),
  },
  {
    accessorKey: "downtimeDaysCount",
    header: "Простоев",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {formatNumber(row.original.downtimeDaysCount)}
      </span>
    ),
  },
  {
    accessorKey: "utilizationRate",
    header: "Использование",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {formatPercent(row.original.utilizationRate)}
      </span>
    ),
  },
  {
    accessorKey: "revenueRank",
    header: "Ранг по выручке",
    cell: ({ row }) => (
      <span className="text-accent-primary font-semibold tabular-nums">
        #{formatNumber(row.original.revenueRank)}
      </span>
    ),
  },
  {
    accessorKey: "downtimeRank",
    header: "Ранг по простоям",
    cell: ({ row }) => (
      <span className="text-accent-primary font-semibold tabular-nums">
        #{formatNumber(row.original.downtimeRank)}
      </span>
    ),
  },
];

const getChartData = (
  items:
    | CarBrandsAnalyticsResponse["mostProfitableBrands"]
    | CarBrandsAnalyticsResponse["mostDowntimeBrands"],
  getValue: (item: (typeof items)[number]) => number,
) =>
  items.map((item) => ({
    date: item.firm,
    value: getValue(item),
  }));

const CarBrandsAnalyticsEmptyState = ({ message }: { message: string }) => {
  return (
    <div className="border-border-default bg-background-page rounded-[18px] border px-6 py-10 text-center">
      <AppText className="text-text-secondary text-sm font-medium">
        {message}
      </AppText>
    </div>
  );
};

const AnalyticsCharts = ({ data }: { data: CarBrandsAnalyticsResponse }) => {
  const revenueChartData = getChartData(
    data.mostProfitableBrands,
    (item) => item.totalRevenue,
  );
  const downtimeChartData = getChartData(
    data.mostDowntimeBrands,
    (item) => item.downtimeDaysCount,
  );

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <TitledBlock
        title="Выручка по маркам"
        subtitle="Лидеры по суммарной выручке за выбранный период"
        className="gap-4 rounded-[20px] p-5"
      >
        {revenueChartData.length > 0 ? (
          <VerticalBarChart
            data={revenueChartData}
            valueLabel="₽"
            height={220}
            xTickFormatter={(value) => value}
            yTickFormatter={(value) => formatNumber(value)}
            tooltipDateFormatter={(value) => value}
            tooltipValueFormatter={(value) => formatMoney(value)}
          />
        ) : (
          <CarBrandsAnalyticsEmptyState message="Нет данных по выручке марок за выбранный период." />
        )}
      </TitledBlock>

      <TitledBlock
        title="Простои по маркам"
        subtitle="Марки с максимальным числом дней простоя"
        className="gap-4 rounded-[20px] p-5"
      >
        {downtimeChartData.length > 0 ? (
          <VerticalBarChart
            data={downtimeChartData}
            valueLabel="дней"
            height={220}
            xTickFormatter={(value) => value}
            yTickFormatter={(value) => formatNumber(value)}
            tooltipDateFormatter={(value) => value}
            tooltipValueFormatter={(value) => `${formatNumber(value)} дн.`}
            barFill="#1e355e66"
            activeBarFill="#1e355e"
          />
        ) : (
          <CarBrandsAnalyticsEmptyState message="Нет данных по простоям марок за выбранный период." />
        )}
      </TitledBlock>
    </section>
  );
};

export const CarBrandsAnalyticsSection = ({
  from,
  to,
  taxiParks,
}: CarBrandsAnalyticsSectionProps) => {
  const [selectedTaxiParkId, setSelectedTaxiParkId] =
    useState<string>(DEFAULT_TAXI_PARK_ID);

  const taxiParkOptions: ComboboxOption[] = [
    {
      label: "Все таксопарки",
      value: DEFAULT_TAXI_PARK_ID,
    },
    ...taxiParks.map((taxiPark) => ({
      label: taxiPark.name,
      value: taxiPark.taxiParkId,
    })),
  ];

  const analyticsQuery = useCarBrandsAnalytics({
    from,
    to,
    taxiParkId: selectedTaxiParkId,
    taxiParkIds: taxiParks.map((taxiPark) => taxiPark.taxiParkId),
  });
  const data = analyticsQuery.data;

  return (
    <TitledBlock
      title="Аналитика марок автомобилей"
      subtitle="Сравнение марок по выручке, простоям и использованию"
      topRightSlot={
        <div className="flex max-w-full min-w-[260px] flex-col gap-2">
          <AppText className="text-text-secondary text-xs font-semibold tracking-[0.08em] uppercase">
            Таксопарк
          </AppText>
          <Combobox
            options={taxiParkOptions}
            value={selectedTaxiParkId}
            onValueChange={(value) => {
              if (!value) {
                return;
              }

              setSelectedTaxiParkId(value);
            }}
            placeholder="Выберите таксопарк"
            searchPlaceholder="Найти таксопарк"
            emptyText="Таксопарки не найдены"
          />
        </div>
      }
      className="gap-6 rounded-[24px] p-6"
      headerClassName="flex-col gap-4 xl:flex-row xl:items-start"
      contentClassName="flex flex-col gap-6"
    >
      {analyticsQuery.isLoading ? (
        <CarBrandsAnalyticsEmptyState message="Загрузка аналитики марок..." />
      ) : analyticsQuery.error ? (
        <CarBrandsAnalyticsEmptyState message="Не удалось загрузить аналитику марок автомобилей." />
      ) : data == null || data.brands.length === 0 ? (
        <CarBrandsAnalyticsEmptyState message="За выбранный период нет данных по маркам автомобилей." />
      ) : (
        <>
          <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <KpiCard
              label="Самая прибыльная марка"
              value={data.summary.bestRevenueBrand?.firm ?? "—"}
              meta={formatMoney(data.summary.bestRevenueBrand?.totalRevenue)}
            />
            <KpiCard
              label="Чаще всего не выходит на линию"
              value={data.summary.mostDowntimeBrand?.firm ?? "—"}
              meta={
                data.summary.mostDowntimeBrand
                  ? `${formatNumber(data.summary.mostDowntimeBrand.downtimeDaysCount)} дн.`
                  : "—"
              }
            />
            <KpiCard
              label="Всего автомобилей"
              value={formatNumber(data.summary.carsCount)}
            />
            <KpiCard
              label="Всего марок"
              value={formatNumber(data.summary.brandsCount)}
            />
            <KpiCard
              label="Всего простоев"
              value={formatNumber(data.summary.totalDowntimeDaysCount)}
            />
          </section>

          <AnalyticsCharts data={data} />

          <TitledBlock
            title="Сравнение марок"
            subtitle={`Период ${from} - ${to}`}
            className="gap-4 rounded-[20px] p-5"
          >
            <DataTable
              columns={brandColumns}
              data={data.brands}
              initialPageSize={10}
            />
          </TitledBlock>
        </>
      )}
    </TitledBlock>
  );
};
