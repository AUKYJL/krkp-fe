import type { ReactNode } from "react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/shared/utils";

import { VerticalBarChartTooltip } from "./ui";

export interface VerticalBarChartItem {
  date: string;
  value: number;
}

export interface VerticalBarChartProps {
  data: VerticalBarChartItem[];
  valueLabel: string;
  className?: string;
  chartClassName?: string;
  height?: number;
  barRadius?: number;
  barFill?: string;
  activeBarFill?: string;
  xTickFormatter?: (date: string) => string;
  yTickFormatter?: (value: number) => string;
  tooltipDateFormatter?: (date: string) => ReactNode;
  tooltipValueFormatter?: (value: number) => ReactNode;
}

export const VerticalBarChart = ({
  data,
  valueLabel,
  className,
  chartClassName,
  height = 160,
  barRadius = 6,
  barFill = "#ff7a0266",
  activeBarFill = "#ff7a02",
  xTickFormatter,
  yTickFormatter,
  tooltipDateFormatter,
  tooltipValueFormatter,
}: VerticalBarChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const safeData = data.map((item) => ({
    date: item.date,
    value: Number.isFinite(item.value) ? item.value : 0,
  }));

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("relative w-full", chartClassName)} style={{ height }}>
        <div className="text-text-secondary pointer-events-none absolute top-0 left-2 text-xs font-medium">
          {valueLabel}
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={safeData}
            margin={{ top: 28, right: 8, left: 8, bottom: 4 }}
            onMouseLeave={() => setActiveIndex(null)}
            onMouseMove={(state) => {
              const rawIndex = state.activeTooltipIndex;
              const coercedIndex =
                typeof rawIndex === "number"
                  ? rawIndex
                  : rawIndex == null
                    ? null
                    : Number(rawIndex);

              const nextIndex = Number.isFinite(coercedIndex)
                ? (coercedIndex as number)
                : null;

              setActiveIndex((prevIndex) =>
                prevIndex === nextIndex ? prevIndex : nextIndex,
              );
            }}
          >
            <Tooltip
              cursor={false}
              isAnimationActive={false}
              wrapperStyle={{ zIndex: 50 }}
              content={
                <VerticalBarChartTooltip
                  tooltipDateFormatter={tooltipDateFormatter}
                  tooltipValueFormatter={tooltipValueFormatter}
                />
              }
            />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              tick={{
                fill: "var(--text-secondary)",
                fontSize: 10,
                fontWeight: 500,
              }}
              tickFormatter={xTickFormatter}
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
              tickFormatter={yTickFormatter}
            />

            <Bar
              dataKey="value"
              fill={barFill}
              radius={[barRadius, barRadius, 0, 0]}
              isAnimationActive={false}
            >
              {safeData.map((item, index) => (
                <Cell
                  key={`${item.date}-${index}`}
                  fill={index === activeIndex ? activeBarFill : barFill}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
