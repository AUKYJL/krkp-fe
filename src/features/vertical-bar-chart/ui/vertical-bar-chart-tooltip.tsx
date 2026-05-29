interface VerticalBarChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload?: {
      date: string;
      value: number;
    };
  }>;
  tooltipDateFormatter?: (date: string) => React.ReactNode;
  tooltipValueFormatter?: (value: number) => React.ReactNode;
}

export function VerticalBarChartTooltip({
  active,
  payload,
  tooltipDateFormatter,
  tooltipValueFormatter,
}: VerticalBarChartTooltipProps) {
  if (!active) return null;

  const item = payload?.[0]?.payload;
  if (!item) return null;

  return (
    <div className="bg-dark-primary rounded-lg px-2.5 py-2 shadow-sm">
      <div className="text-text-inverse text-[11px] leading-none font-semibold">
        {tooltipDateFormatter ? tooltipDateFormatter(item.date) : item.date}
      </div>
      <div className="text-accent-primary mt-1 text-xs leading-none font-bold tabular-nums">
        {tooltipValueFormatter
          ? tooltipValueFormatter(item.value)
          : item.value.toLocaleString()}
      </div>
    </div>
  );
}
