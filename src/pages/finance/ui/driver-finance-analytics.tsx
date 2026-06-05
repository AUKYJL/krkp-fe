import { KpiCard } from "@/features/kpi-card";
import { TitledBlock } from "@/features/titled-block";
import { VerticalBarChart } from "@/features/vertical-bar-chart";

import { formatCompactCurrency, formatCurrency } from "../utils/finance-page.utils";
import { EmptyStateCard } from "./empty-state-card";
import { RevenueLineChartBlock } from "./revenue-line-chart-block";

type DriverFinanceAnalyticsProps = {
  filteredDaysCount: number;
  kpiCards: Array<{
    label: string;
    value: string;
    meta: string;
    valueClassName: string;
    metaClassName: string;
    className: string;
  }>;
  chartData: Array<{ date: string; value: number }>;
  table: React.ReactNode;
};

export const DriverFinanceAnalytics = ({
  filteredDaysCount,
  kpiCards,
  chartData,
  table,
}: DriverFinanceAnalyticsProps) => {
  return (
    <>
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {kpiCards.map((card) => (
          <KpiCard key={String(card.label)} {...card} />
        ))}
      </section>

      {filteredDaysCount === 0 ? (
        <EmptyStateCard message="За выбранный период нет рабочих дней" />
      ) : (
        <>
          <section className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            <TitledBlock
              title="Динамика выручки"
              subtitle="Линейный график по заполненным рабочим дням"
              className="gap-5"
            >
              <RevenueLineChartBlock data={chartData} />
            </TitledBlock>

            <TitledBlock
              title="Сравнение по дням"
              subtitle="Столбчатая диаграмма выручки по заполненным дням"
              className="gap-5"
            >
              {chartData.length > 0 ? (
                <VerticalBarChart
                  data={chartData}
                  valueLabel="Выручка, ₽"
                  height={320}
                  yTickFormatter={(value) => formatCompactCurrency(value)}
                  tooltipValueFormatter={(value) => formatCurrency(value)}
                />
              ) : (
                <EmptyStateCard message="Выручка за выбранный период еще не заполнена" />
              )}
            </TitledBlock>
          </section>

          <TitledBlock
            title="Рабочие даты"
            subtitle="История внесения выручки по сменам"
            className="gap-5"
          >
            {table}
          </TitledBlock>
        </>
      )}
    </>
  );
};
