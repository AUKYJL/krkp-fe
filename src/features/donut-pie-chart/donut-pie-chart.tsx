import type { ReactNode } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { cn } from "@/shared/utils";
import { clampNumber } from "@/shared/utils";

import { DONUT_PIE_CHART_COLORS } from "./colors";
import { DonutPieChartTooltip } from "./ui";

export interface DonutPieChartItem {
  label: string;
  value: number;
}

export interface DonutPieChartProps {
  data: DonutPieChartItem[];
  centerLabel?: ReactNode;
  centerSubLabel?: ReactNode;
  className?: string;
  chartClassName?: string;
  legendClassName?: string;
  size?: number;
  innerRadius?: number;
  outerRadius?: number;
  percentDigits?: number;
}

export const DonutPieChart = ({
  data,
  centerLabel,
  centerSubLabel,
  className,
  chartClassName,
  legendClassName,
  size = 176,
  innerRadius = 62,
  outerRadius = 84,
  percentDigits = 0,
}: DonutPieChartProps) => {
  const safePercentDigits = clampNumber(percentDigits, 0, 2);
  const total = data.reduce(
    (acc, item) =>
      Number.isFinite(item.value) ? acc + Math.max(0, item.value) : acc,
    0,
  );

  const items = data.map((item, index) => ({
    ...item,
    color: DONUT_PIE_CHART_COLORS[index % DONUT_PIE_CHART_COLORS.length],
    percent: total > 0 ? (item.value / total) * 100 : 0,
  }));

  return (
    <div className={cn("flex items-center gap-6", className)}>
      <div
        className={cn("relative shrink-0", chartClassName)}
        style={{ width: size, height: size }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              cursor={false}
              isAnimationActive={false}
              wrapperStyle={{ zIndex: 50 }}
              content={
                <DonutPieChartTooltip percentDigits={safePercentDigits} />
              }
            />
            <Pie
              data={items}
              dataKey="value"
              nameKey="label"
              startAngle={90}
              endAngle={-270}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              stroke="transparent"
              paddingAngle={1}
              isAnimationActive={false}
            >
              {items.map((item, index) => (
                <Cell key={`${item.label}-${index}`} fill={item.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {(centerLabel != null || centerSubLabel != null) && (
          <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center text-center">
            {centerLabel != null && (
              <div className="text-text-primary text-[18px] leading-none font-bold">
                {centerLabel}
              </div>
            )}
            {centerSubLabel != null && (
              <div className="text-text-secondary mt-1 text-sm leading-none">
                {centerSubLabel}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={cn("flex min-w-0 flex-col gap-3", legendClassName)}>
        {items.map((item, index) => {
          const percentValue = Number.isFinite(item.percent) ? item.percent : 0;
          const percentText = percentValue.toFixed(safePercentDigits);
          return (
            <div
              key={`${item.label}-${index}`}
              className="flex items-center justify-between gap-8"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-text-secondary truncate text-base">
                  {item.label}
                </span>
              </div>
              <span className="text-text-primary shrink-0 text-base font-semibold tabular-nums">
                {percentText}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
