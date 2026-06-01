interface DonutPieChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload?: {
      label: string;
      value: number;
      percent: number;
      color: string;
    };
  }>;
  percentDigits: number;
}
export const DonutPieChartTooltip = ({
  active,
  payload,
  percentDigits,
}: DonutPieChartTooltipProps) => {
  if (!active) return null;

  const item = payload?.[0]?.payload;
  if (!item) return null;

  const percentText = (
    Number.isFinite(item.percent) ? item.percent : 0
  ).toFixed(percentDigits);
  const valueText = Number.isFinite(item.value) ? item.value : 0;

  return (
    <div className="border-border rounded-md border bg-white px-3 py-2 shadow-sm">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        <span className="text-text-primary text-sm font-medium">
          {item.label}
        </span>
      </div>
      <div className="text-text-secondary mt-1 text-xs tabular-nums">
        {valueText} · {percentText}%
      </div>
    </div>
  );
};
