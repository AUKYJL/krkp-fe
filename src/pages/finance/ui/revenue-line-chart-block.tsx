import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyStateCard } from "./empty-state-card";
import {
  formatCompactCurrency,
  formatCurrency,
} from "../utils/finance-page.utils";

type RevenueLineChartBlockProps = {
  data: Array<{ date: string; value: number }>;
};

export const RevenueLineChartBlock = ({
  data,
}: RevenueLineChartBlockProps) => {
  if (data.length === 0) {
    return (
      <EmptyStateCard message="Выручка за выбранный период еще не заполнена" />
    );
  }

  return (
    <div className="relative h-[320px] w-full">
      <div className="text-text-secondary pointer-events-none absolute top-0 left-2 text-xs font-medium">
        Выручка, ₽
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 28, right: 8, left: 8, bottom: 4 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="var(--border-default)"
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "var(--text-secondary)",
              fontSize: 10,
              fontWeight: 500,
            }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={56}
            tickMargin={6}
            tick={{
              fill: "var(--text-secondary)",
              fontSize: 10,
              fontWeight: 500,
            }}
            tickFormatter={(value) => formatCompactCurrency(value)}
          />
          <Tooltip
            cursor={{ stroke: "var(--border-default)", strokeDasharray: "4 4" }}
            content={({ active, payload }) => {
              if (!active) {
                return null;
              }

              const point = payload?.[0]?.payload as
                | { date: string; value: number }
                | undefined;

              if (!point) {
                return null;
              }

              return (
                <div className="bg-dark-primary rounded-lg px-2.5 py-2 shadow-sm">
                  <div className="text-text-inverse text-[11px] leading-none font-semibold">
                    {point.date}
                  </div>
                  <div className="text-accent-primary mt-1 text-xs leading-none font-bold tabular-nums">
                    {formatCurrency(point.value)}
                  </div>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--accent-primary)"
            strokeWidth={3}
            dot={{ r: 4, fill: "var(--accent-primary)" }}
            activeDot={{ r: 5, fill: "var(--accent-primary)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
