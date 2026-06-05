import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";

import { PERIOD_OPTIONS } from "../consts/finance-page.consts";
import type { RevenuePeriodKey } from "../types";

import {
  DateRangePicker,
  type DateRangePickerValue,
} from "@/features/date-range-picker";

type FinancePeriodFilterProps = {
  period: RevenuePeriodKey;
  customRange: DateRangePickerValue;
  onPeriodChange: (period: RevenuePeriodKey) => void;
  onCustomRangeChange: (value: DateRangePickerValue) => void;
};

export const FinancePeriodFilter = ({
  period,
  customRange,
  onPeriodChange,
  onCustomRangeChange,
}: FinancePeriodFilterProps) => {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-2">
        {PERIOD_OPTIONS.map((item) => {
          const isActive = period === item.key;

          return (
            <Button
              key={item.key}
              type="button"
              variant={
                isActive
                  ? BUTTON_VARIANTS_VARIABLES.tertiary
                  : BUTTON_VARIANTS_VARIABLES.secondary
              }
              className="h-10 rounded-[12px] px-4"
              onClick={() => onPeriodChange(item.key)}
            >
              {item.label}
            </Button>
          );
        })}
        <div className="w-full lg:max-w-[360px]">
          <DateRangePicker
            value={customRange}
            onChange={onCustomRangeChange}
            numberOfMonths={2}
            placeholder="Выберите диапазон"
            buttonClassName="h-10 rounded-[12px]"
            buttonProps={{
              variant: BUTTON_VARIANTS_VARIABLES.secondary,
            }}
            formatDate={(date) =>
              date.toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            }
            renderValue={(value) => {
              if (!value?.from) {
                return "Выберите диапазон";
              }

              const from = value.from.toLocaleDateString("ru-RU");
              const to = (value.to ?? value.from).toLocaleDateString("ru-RU");

              return `${from} - ${to}`;
            }}
          />
        </div>
      </div>
    </div>
  );
};
